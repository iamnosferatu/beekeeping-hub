// backend/src/models/Article.js

module.exports = (sequelize, DataTypes) => {
  const slug = require("slug");

  const Article = sequelize.define(
    "Article",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      content: {
        type: DataTypes.TEXT('long'),
        allowNull: false,
      },
      excerpt: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      featured_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("draft", "published", "archived"),
        defaultValue: "draft",
      },
      view_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      published_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Blocking-related fields
      blocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      blocked_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      blocked_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      blocked_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeValidate: (article) => {
          // Fix: Check for title, not name
          if (article.title && (!article.slug || article.slug.trim() === "")) {
            article.slug = slug(article.title, { lower: true });
            console.log(
              `Generated slug '${article.slug}' for article '${article.title}'`
            );
          }
        },
      },
    }
  );

  return Article;
};