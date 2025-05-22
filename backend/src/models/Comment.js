// backend/src/models/Comment.js - FIXED VERSION
module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending",
      },
      ip_address: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      // Force table name to be lowercase and plural
      tableName: "comments",
      // Disable automatic pluralization
      freezeTableName: true,
    }
  );

  return Comment;
};
