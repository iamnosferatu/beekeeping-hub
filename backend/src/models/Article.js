// backend/src/models/Article.js - FIXED VERSION

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
        type: DataTypes.TEXT,
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
    },
    {
      // Force table name to be lowercase and plural
      tableName: "articles",
      // Disable automatic pluralization
      freezeTableName: true,
      hooks: {
        beforeValidate: (article) => {
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
