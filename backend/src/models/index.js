// backend/src/models/index.js
const { sequelize } = require("../config/database");
const { DataTypes } = require("sequelize");

// Initialize models by passing sequelize and DataTypes
const User = require("./User")(sequelize, DataTypes);
const Article = require("./Article")(sequelize, DataTypes);
const Comment = require("./Comment")(sequelize, DataTypes);
const Tag = require("./Tag")(sequelize, DataTypes);
const Like = require("./Like")(sequelize, DataTypes);
const Maintenance = require("./Maintenance")(sequelize, DataTypes);
const Feature = require("./Feature")(sequelize, DataTypes);
const Newsletter = require("./Newsletter")(sequelize, DataTypes);
const Contact = require("./Contact")(sequelize, DataTypes);
const AuthorApplication = require("./AuthorApplication")(sequelize, DataTypes);
const ForumCategory = require("./ForumCategory")(sequelize, DataTypes);
const ForumThread = require("./ForumThread")(sequelize, DataTypes);
const ForumComment = require("./ForumComment")(sequelize, DataTypes);
const UserForumBan = require("./UserForumBan")(sequelize, DataTypes);


// Define relationships
User.hasMany(Article, { foreignKey: "user_id", as: "articles" });
Article.belongsTo(User, { foreignKey: "user_id", as: "author" });

User.hasMany(Comment, { foreignKey: "user_id", as: "comments" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "author" });

// Comment reporting relationship
User.hasMany(Comment, { foreignKey: "reported_by", as: "reportedComments" });
Comment.belongsTo(User, { foreignKey: "reported_by", as: "reporter" });

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

// Maintenance relationship with User (who updated it)
Maintenance.belongsTo(User, { foreignKey: "updated_by", as: "updatedBy" });

// Author Application relationships
User.hasMany(AuthorApplication, { foreignKey: "user_id", as: "authorApplications" });
AuthorApplication.belongsTo(User, { foreignKey: "user_id", as: "applicant" });
AuthorApplication.belongsTo(User, { foreignKey: "reviewed_by", as: "reviewer" });

// Forum relationships
// Forum Categories
User.hasMany(ForumCategory, { foreignKey: "user_id", as: "forumCategories" });
ForumCategory.belongsTo(User, { foreignKey: "user_id", as: "creator" });
ForumCategory.belongsTo(User, { foreignKey: "blocked_by", as: "blocker" });

// Forum Threads
ForumCategory.hasMany(ForumThread, { foreignKey: "category_id", as: "threads" });
ForumThread.belongsTo(ForumCategory, { foreignKey: "category_id", as: "category" });
User.hasMany(ForumThread, { foreignKey: "user_id", as: "forumThreads" });
ForumThread.belongsTo(User, { foreignKey: "user_id", as: "author" });
ForumThread.belongsTo(User, { foreignKey: "blocked_by", as: "blocker" });

// Forum Comments
ForumThread.hasMany(ForumComment, { foreignKey: "thread_id", as: "comments" });
ForumComment.belongsTo(ForumThread, { foreignKey: "thread_id", as: "thread" });
User.hasMany(ForumComment, { foreignKey: "user_id", as: "forumComments" });
ForumComment.belongsTo(User, { foreignKey: "user_id", as: "author" });
ForumComment.belongsTo(User, { foreignKey: "blocked_by", as: "blocker" });

// Self-referencing for parent comments
ForumComment.hasMany(ForumComment, { foreignKey: "parent_comment_id", as: "replies" });
ForumComment.belongsTo(ForumComment, { foreignKey: "parent_comment_id", as: "parentComment" });

// User Forum Bans
User.hasOne(UserForumBan, { foreignKey: "user_id", as: "forumBan" });
UserForumBan.belongsTo(User, { foreignKey: "user_id", as: "bannedUser" });
UserForumBan.belongsTo(User, { foreignKey: "banned_by", as: "bannedByUser" });

module.exports = {
  sequelize,
  User,
  Article,
  Comment,
  Tag,
  Like,
  Maintenance,
  Feature,
  Newsletter,
  Contact,
  AuthorApplication,
  ForumCategory,
  ForumThread,
  ForumComment,
  UserForumBan,
};
