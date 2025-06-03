module.exports = (sequelize, DataTypes) => {
  const UserForumBan = sequelize.define('UserForumBan', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  bannedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'banned_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bannedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'banned_at'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  }
}, {
  tableName: 'user_forum_bans',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Instance methods
UserForumBan.prototype.isActive = function() {
  if (!this.expiresAt) return true; // Permanent ban
  return new Date() < this.expiresAt;
};

// Class methods
UserForumBan.isUserBanned = async function(userId) {
  const ban = await this.findOne({
    where: { userId },
    order: [['created_at', 'DESC']]
  });
  
  if (!ban) return false;
  return ban.isActive();
};

return UserForumBan;
};