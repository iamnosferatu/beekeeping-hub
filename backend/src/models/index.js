// backend/src/models/index.js
const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");

// Initialize models by passing sequelize and DataTypes
const User = require("./User")(sequelize, DataTypes);
const Article = require("./Article")(sequelize, DataTypes);
const Comment = require("./Comment")(sequelize, DataTypes);
const Tag = require("./Tag")(sequelize, DataTypes);
const Like = require("./Like")(sequelize, DataTypes);
const SiteSettings = require("./SiteSettings")(sequelize, DataTypes);


// Define relationships
User.hasMany(Article, { foreignKey: "user_id", as: "articles" });
Article.belongsTo(User, { foreignKey: "user_id", as: "author" });

User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "author" });

Article.hasMany(Comment, { foreignKey: "article_id", as: "comments" });
Comment.belongsTo(Article, { foreignKey: "article_id", as: "article" });

// Self-referencing association for nested comments
Comment.hasMany(Comment, { foreignKey: "parent_id", as: "replies" });
Comment.belongsTo(Comment, { foreignKey: "parent_id", as: "parent" });

// ArticleTags junction table
Article.belongsToMany(Tag, { through: "article_tags", as: "tags" });
Tag.belongsToMany(Article, { through: "article_tags", as: "articles" });

// Likes
User.hasMany(Like, { foreignKey: "user_id" });
Like.belongsTo(User, { foreignKey: "user_id" });

Article.hasMany(Like, { foreignKey: "article_id" });
Like.belongsTo(Article, { foreignKey: "article_id" });

// Site Settings relationship with User (who updated it)
SiteSettings.belongsTo(User, { foreignKey: "updated_by", as: "updatedBy" });

module.exports = {
  sequelize,
  User,
  Article,
  Comment,
  Tag,
  Like,
  SiteSettings,
};
