module.exports = (sequelize, DataTypes) => {
  const ForumThread = sequelize.define('ForumThread', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Thread title cannot be empty'
      },
      len: {
        args: [5, 255],
        msg: 'Thread title must be between 5 and 255 characters'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(300),
    allowNull: false,
    unique: {
      msg: 'This thread slug already exists'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Thread content cannot be empty'
      },
      len: {
        args: [10],
        msg: 'Thread content must be at least 10 characters long'
      }
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id',
    references: {
      model: 'forum_categories',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_pinned'
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_locked'
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_blocked'
  },
  blockedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'blocked_at'
  },
  blockedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'blocked_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  blockedReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'blocked_reason'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'view_count'
  },
  lastActivityAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'last_activity_at'
  }
}, {
  tableName: 'forum_threads',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: (thread) => {
      // Generate slug from title if not provided
      if (!thread.slug && thread.title) {
        thread.slug = thread.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 300);
      }
    }
  }
});

// Instance methods
ForumThread.prototype.canBeEditedBy = function(user) {
  // Admin can edit any thread
  if (user.role === 'admin') return true;
  // Author can only edit their own threads if not locked
  return user.role === 'author' && this.userId === user.id && !this.isLocked;
};

ForumThread.prototype.canBeDeletedBy = function(user) {
  // Admin can delete any thread
  if (user.role === 'admin') return true;
  // Author can only delete their own threads
  return user.role === 'author' && this.userId === user.id;
};

ForumThread.prototype.canReceiveComments = function() {
  return !this.isLocked && !this.isBlocked;
};

ForumThread.prototype.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save({ fields: ['view_count'] });
};

ForumThread.prototype.updateLastActivity = async function() {
  this.lastActivityAt = new Date();
  await this.save({ fields: ['last_activity_at'] });
};

return ForumThread;
};