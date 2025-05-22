// backend/src/models/index.js - FIXED VERSION
const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");

// Initialize models by passing sequelize and DataTypes
const User = require("./User")(sequelize, DataTypes);
const Article = require("./Article")(sequelize, DataTypes);
const Comment = require("./Comment")(sequelize, DataTypes);
const Tag = require("./Tag")(sequelize, DataTypes);
const Like = require("./Like")(sequelize, DataTypes);

// Define relationships
User.hasMany(Article, {
  foreignKey: "user_id",
  as: "articles",
});
Article.belongsTo(User, {
  foreignKey: "user_id",
  as: "author",
});

User.hasMany(Comment, {
  foreignKey: "user_id",
  as: "comments",
});
Comment.belongsTo(User, {
  foreignKey: "user_id",
  as: "author",
});

Article.hasMany(Comment, {
  foreignKey: "article_id",
  as: "comments",
});
Comment.belongsTo(Article, {
  foreignKey: "article_id",
  as: "article",
});

// ArticleTags junction table - specify the exact table name
Article.belongsToMany(Tag, {
  through: "article_tags",
  as: "tags",
  foreignKey: "article_id",
  otherKey: "tag_id",
});
Tag.belongsToMany(Article, {
  through: "article_tags",
  as: "articles",
  foreignKey: "tag_id",
  otherKey: "article_id",
});

// Likes
User.hasMany(Like, {
  foreignKey: "user_id",
});
Like.belongsTo(User, {
  foreignKey: "user_id",
});

Article.hasMany(Like, {
  foreignKey: "article_id",
});
Like.belongsTo(Article, {
  foreignKey: "article_id",
});

module.exports = {
  sequelize,
  User,
  Article,
  Comment,
  Tag,
  Like,
};
