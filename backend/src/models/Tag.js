// backend/src/models/Tag.js - FIXED VERSION
module.exports = (sequelize, DataTypes) => {
  const slug = require("slug");

  const Tag = sequelize.define(
    "Tag",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      // Force table name to be lowercase and plural
      tableName: "tags",
      // Disable automatic pluralization
      freezeTableName: true,
      hooks: {
        beforeValidate: (tag) => {
          if (tag.name && (!tag.slug || tag.slug.trim() === "")) {
            tag.slug = slug(tag.name, { lower: true });
            console.log(`Generated slug '${tag.slug}' for tag '${tag.name}'`);
          }
        },
      },
    }
  );

  return Tag;
};
