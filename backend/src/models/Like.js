// backend/src/models/Like.js - FIXED VERSION
module.exports = (sequelize, DataTypes) => {
  const Like = sequelize.define(
    "Like",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    },
    {
      // Force table name to be lowercase and plural
      tableName: "likes",
      // Disable automatic pluralization
      freezeTableName: true,
    }
  );

  return Like;
};
