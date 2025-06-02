// backend/src/models/AuthorApplication.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuthorApplication = sequelize.define('AuthorApplication', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    application_text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Application text is required'
        },
        len: {
          args: [50, 2000],
          msg: 'Application text must be between 50 and 2000 characters'
        }
      }
    },
    writing_experience: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Writing experience must be less than 1000 characters'
        }
      }
    },
    beekeeping_experience: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Beekeeping experience must be less than 1000 characters'
        }
      }
    },
    topics_of_interest: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Topics of interest must be less than 500 characters'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: {
          args: [['pending', 'approved', 'rejected']],
          msg: 'Status must be pending, approved, or rejected'
        }
      }
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: {
          args: [0, 1000],
          msg: 'Admin notes must be less than 1000 characters'
        }
      }
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'author_applications',
    timestamps: true,
    underscored: false, // Use camelCase for timestamps (createdAt, updatedAt)
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
      beforeUpdate: (application) => {
        // Set reviewed_at timestamp when status changes from pending
        if (application.changed('status') && application.status !== 'pending') {
          application.reviewed_at = new Date();
        }
      }
    }
  });

  // Define associations
  AuthorApplication.associate = (models) => {
    // Association with User (applicant)
    AuthorApplication.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'applicant',
      onDelete: 'CASCADE'
    });

    // Association with User (reviewer)
    AuthorApplication.belongsTo(models.User, {
      foreignKey: 'reviewed_by',
      as: 'reviewer',
      onDelete: 'SET NULL'
    });
  };

  // Instance methods
  AuthorApplication.prototype.approve = function(adminUserId, notes = null) {
    this.status = 'approved';
    this.reviewed_by = adminUserId;
    this.reviewed_at = new Date();
    if (notes) this.admin_notes = notes;
    return this.save();
  };

  AuthorApplication.prototype.reject = function(adminUserId, notes = null) {
    this.status = 'rejected';
    this.reviewed_by = adminUserId;
    this.reviewed_at = new Date();
    if (notes) this.admin_notes = notes;
    return this.save();
  };

  AuthorApplication.prototype.isPending = function() {
    return this.status === 'pending';
  };

  AuthorApplication.prototype.isApproved = function() {
    return this.status === 'approved';
  };

  AuthorApplication.prototype.isRejected = function() {
    return this.status === 'rejected';
  };

  // Class methods
  AuthorApplication.findPendingApplications = function() {
    return this.findAll({
      where: { status: 'pending' },
      include: [
        {
          model: sequelize.models.User,
          as: 'applicant',
          attributes: ['id', 'username', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['createdAt', 'ASC']]
    });
  };

  AuthorApplication.findUserApplication = function(userId) {
    return this.findOne({
      where: { user_id: userId },
      include: [
        {
          model: sequelize.models.User,
          as: 'reviewer',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
  };

  AuthorApplication.hasUserApplied = async function(userId) {
    const application = await this.findOne({
      where: { user_id: userId }
    });
    return !!application;
  };

  AuthorApplication.hasPendingApplication = async function(userId) {
    const application = await this.findOne({
      where: { 
        user_id: userId,
        status: 'pending'
      }
    });
    return !!application;
  };

  return AuthorApplication;
};