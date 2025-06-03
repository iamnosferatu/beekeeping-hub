module.exports = (sequelize, DataTypes) => {
  const ForumCategory = sequelize.define('ForumCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Category name cannot be empty'
      },
      len: {
        args: [3, 100],
        msg: 'Category name must be between 3 and 100 characters'
      }
    }
  },
  slug: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: {
      msg: 'This category slug already exists'
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'forum_categories',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeValidate: (category) => {
      // Generate slug from name if not provided
      if (!category.slug && category.name) {
        category.slug = category.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
          .substring(0, 150);
      }
    }
  }
});

// Instance methods
ForumCategory.prototype.canBeEditedBy = function(user) {
  // Admin can edit any category
  if (user.role === 'admin') return true;
  // Author can only edit their own categories
  return user.role === 'author' && this.userId === user.id;
};

ForumCategory.prototype.canBeDeletedBy = function(user) {
  // Same rules as editing
  return this.canBeEditedBy(user);
};

return ForumCategory;
};