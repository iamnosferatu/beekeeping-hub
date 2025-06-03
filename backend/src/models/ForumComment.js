module.exports = (sequelize, DataTypes) => {
  const ForumComment = sequelize.define('ForumComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Comment content cannot be empty'
      },
      len: {
        args: [1],
        msg: 'Comment content must be at least 1 character long'
      }
    }
  },
  threadId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'thread_id',
    references: {
      model: 'forum_threads',
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
  parentCommentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_comment_id',
    references: {
      model: 'forum_comments',
      key: 'id'
    }
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
  }
}, {
  tableName: 'forum_comments',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
ForumComment.prototype.canBeEditedBy = function(user) {
  // Admin can edit any comment
  if (user.role === 'admin') return true;
  // Author can only edit their own comments
  return user.role === 'author' && this.userId === user.id;
};

ForumComment.prototype.canBeDeletedBy = function(user) {
  // Same rules as editing
  return this.canBeEditedBy(user);
};

return ForumComment;
};