// backend/src/controllers/articleController.js
const { Article, User, Tag, Comment, Like, sequelize } = require("../models");
const { Op } = require("sequelize");
const slug = require("slug");

// Helper function to build include options for article queries
const getArticleIncludes = () => {
  return [
    {
      model: User,
      as: "author",
      attributes: ["id", "username", "first_name", "last_name", "avatar"],
    },
    {
      model: Tag,
      as: "tags",
      attributes: ["id", "name", "slug"],
      through: { attributes: [] }, // Don't include junction table
    },
    {
      model: Comment,
      as: "comments",
      where: { status: "approved" },
      required: false,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name", "avatar"],
        },
      ],
    },
    {
      model: Like,
      attributes: ["id", "user_id"],
      required: false,
    },
  ];
};

// Helper to generate a unique slug from title
const generateUniqueSlug = async (title) => {
  let baseSlug = slug(title || "article", { lower: true });
  let slugToUse = baseSlug;
  let counter = 1;
  let existingArticle;

  do {
    existingArticle = await Article.findOne({ where: { slug: slugToUse } });
    if (existingArticle) {
      slugToUse = `${baseSlug}-${counter}`;
      counter++;
    }
  } while (existingArticle);

  return slugToUse;
};

// @desc    Get all articles with pagination, filtering, and search
// @route   GET /api/articles
// @access  Public (but blocked articles are hidden from non-admins)
exports.getArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    let whereClause = { status: "published" };
    let includeOptions = getArticleIncludes();

    // IMPORTANT: Filter out blocked articles for non-admin users
    // Only show blocked articles to admins or the article author
    if (!req.user || req.user.role !== "admin") {
      whereClause.blocked = false;
    }

    // If user is requesting their own articles (author filter)
    if (req.query.author) {
      whereClause.user_id = req.query.author;
      // Authors can see their own blocked articles
      delete whereClause.blocked;
    }

    // Filter by tag if provided
    if (req.query.tag) {
      console.log("Filtering by tag:", req.query.tag);

      // Find the tag first
      const tag = await Tag.findOne({ where: { slug: req.query.tag } });

      if (!tag) {
        console.log("Tag not found:", req.query.tag);
        return res.status(200).json({
          success: true,
          data: [],
          count: 0,
          pagination: {
            page,
            limit,
            totalPages: 0,
          },
        });
      }

      console.log("Found tag:", tag.name, "with ID:", tag.id);

      // Method 1: Use a subquery to find article IDs that have this tag
      const articleIdsResult = await sequelize.query(
        `SELECT DISTINCT at.article_id 
         FROM article_tags at 
         WHERE at.tag_id = :tagId`,
        {
          replacements: { tagId: tag.id },
          type: sequelize.QueryTypes.SELECT,
          raw: true,
        }
      );

      console.log("Article IDs query result:", articleIdsResult);

      // Extract the IDs
      const articleIds = articleIdsResult
        .map((row) => {
          // Handle different possible property names
          return (
            row.article_id ||
            row.ARTICLE_ID ||
            row["article_id"] ||
            row["ARTICLE_ID"]
          );
        })
        .filter((id) => id != null);

      console.log("Extracted article IDs:", articleIds);

      if (articleIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          count: 0,
          pagination: {
            page,
            limit,
            totalPages: 0,
          },
        });
      }

      // Add the article ID filter to where clause
      whereClause.id = { [Op.in]: articleIds };
    }

    // Search functionality
    if (req.query.search) {
      const searchTerm = `%${req.query.search}%`;
      whereClause[Op.or] = [
        { title: { [Op.like]: searchTerm } },
        { content: { [Op.like]: searchTerm } },
        { excerpt: { [Op.like]: searchTerm } },
      ];
    }

    // Status filter for admin panel
    if (req.query.status && req.user && req.user.role === "admin") {
      if (req.query.status === "blocked") {
        whereClause.blocked = true;
        delete whereClause.status; // Remove published filter for blocked articles
      } else {
        whereClause.status = req.query.status;
      }
    }

    console.log("Final where clause:", whereClause);

    // Get total count for pagination
    const count = await Article.count({ where: whereClause });
    console.log("Total articles count:", count);

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    // Get articles with related data
    const articles = await Article.findAll({
      where: whereClause,
      include: includeOptions,
      order: [["published_at", "DESC"]],
      limit,
      offset,
    });

    console.log("Found articles:", articles.length);

    // Format articles for response
    const formattedArticles = articles.map((article) => {
      const articleJson = article.toJSON();

      // Count comments instead of including all of them in list view
      if (articleJson.comments) {
        articleJson.comment_count = articleJson.comments.length;
      }

      // Count likes
      if (articleJson.Likes) {
        articleJson.like_count = articleJson.Likes.length;
        delete articleJson.Likes; // Remove likes array from response
      }

      return articleJson;
    });

    res.status(200).json({
      success: true,
      data: formattedArticles,
      count,
      pagination: {
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error in getArticles:", error);
    next(error);
  }
};

// @desc    Get single article by ID
// @route   GET /api/articles/byId/:id
// @access  Public (but blocked articles require admin or author access)
exports.getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name", "avatar"],
        },
        {
          model: Tag,
          as: "tags",
          attributes: ["id", "name", "slug"],
          through: { attributes: [] },
        },
        {
          model: Comment,
          as: "comments",
          where: { status: "approved" },
          required: false,
          include: [
            {
              model: User,
              as: "author",
              attributes: [
                "id",
                "username",
                "first_name",
                "last_name",
                "avatar",
              ],
            },
          ],
        },
      ],
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // For the editor (byId endpoint), we need to allow admins and authors to edit blocked articles
    // Check if article is blocked and user has permission to edit it
    if (article.blocked) {
      const canEditBlocked =
        req.user &&
        (req.user.role === "admin" || req.user.id === article.user_id);

      if (!canEditBlocked) {
        return res.status(403).json({
          success: false,
          message: "This article has been blocked and cannot be edited",
        });
      }
    }

    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error("Error fetching article by ID:", error);
    next(error);
  }
};

// @desc    Get single article by slug
// @route   GET /api/articles/:slug
// @access  Public (but blocked articles require admin or author access)
exports.getArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const article = await Article.findOne({
      where: { slug },
      include: getArticleIncludes(),
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if article is blocked and user has permission to view it
    if (article.blocked) {
      const canViewBlocked =
        req.user &&
        (req.user.role === "admin" || req.user.id === article.user_id);

      if (!canViewBlocked) {
        return res.status(403).json({
          success: false,
          message: "This article has been blocked and is not available",
        });
      }
    }

    // Increment view count only for published, non-blocked articles
    if (article.status === "published" && !article.blocked) {
      article.view_count += 1;
      await article.save();
    }

    // Get article data
    const articleData = article.toJSON();

    // Format likes for easier frontend handling
    if (articleData.Likes) {
      articleData.like_count = articleData.Likes.length;
    }

    res.status(200).json({
      success: true,
      data: articleData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new article
// @route   POST /api/articles
// @access  Private (Author, Admin)
exports.createArticle = async (req, res, next) => {
  try {
    const {
      title,
      content,
      excerpt,
      featured_image,
      status = "draft",
      tags = [],
    } = req.body;

    const user_id = req.user.id;

    // Generate a unique slug from the title
    const articleSlug = await generateUniqueSlug(title);

    console.log(`Generated slug for article: ${articleSlug}`);

    // Create the article
    const article = await Article.create({
      title,
      slug: articleSlug,
      content,
      excerpt: excerpt || content.substring(0, 200) + "...",
      featured_image,
      status,
      user_id,
      published_at: status === "published" ? new Date() : null,
      blocked: false, // New articles are never blocked by default
    });

    // Handle tags
    if (tags.length > 0) {
      const tagObjects = await Promise.all(
        tags.map(async (tagName) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim() },
          });
          return tag;
        })
      );

      await article.setTags(tagObjects);
    }

    // Get full article with associations
    const fullArticle = await Article.findByPk(article.id, {
      include: getArticleIncludes(),
    });

    res.status(201).json({
      success: true,
      data: fullArticle,
    });
  } catch (error) {
    console.error("Error creating article:", error);
    next(error);
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (Owner, Admin)
exports.updateArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check ownership
    if (article.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this article",
      });
    }

    const {
      title,
      content,
      excerpt,
      featured_image,
      status,
      tags = [],
    } = req.body;

    const isPublishingNow = !article.published_at && status === "published";

    if (title && title !== article.title) {
      article.slug = await generateUniqueSlug(title);
    }

    article.title = title || article.title;
    article.content = content || article.content;
    article.excerpt = excerpt || article.excerpt;
    article.featured_image = featured_image || article.featured_image;

    if (status) {
      article.status = status;
      if (isPublishingNow) {
        article.published_at = new Date();
      }
    }

    await article.save();

    // Handle tags if provided
    if (tags.length > 0) {
      const tagObjects = await Promise.all(
        tags.map(async (tagName) => {
          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim() },
          });
          return tag;
        })
      );

      await article.setTags(tagObjects);
    }

    // Get updated article with associations
    const updatedArticle = await Article.findByPk(id, {
      include: getArticleIncludes(),
    });

    res.status(200).json({
      success: true,
      data: updatedArticle,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Owner, Admin)
exports.deleteArticle = async (req, res, next) => {
  try {
    console.log('deleteArticle - Request user:', {
      id: req.user?.id,
      role: req.user?.role,
      username: req.user?.username
    });
    
    const { id } = req.params;

    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check ownership
    console.log('deleteArticle - Authorization check:', {
      articleOwnerId: article.user_id,
      requestUserId: req.user.id,
      isOwner: article.user_id === req.user.id,
      userRole: req.user.role,
      isAdmin: req.user.role === "admin",
      willAllow: article.user_id === req.user.id || req.user.role === "admin"
    });
    
    if (article.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this article",
      });
    }

    await article.destroy();

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle like on article
// @route   POST /api/articles/:id/like
// @access  Private
exports.toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Don't allow liking blocked articles
    if (article.blocked) {
      return res.status(403).json({
        success: false,
        message: "Cannot like a blocked article",
      });
    }

    const existingLike = await Like.findOne({
      where: { article_id: id, user_id },
    });

    if (existingLike) {
      await existingLike.destroy();

      res.status(200).json({
        success: true,
        message: "Article unliked successfully",
        liked: false,
      });
    } else {
      await Like.create({ article_id: id, user_id });

      res.status(200).json({
        success: true,
        message: "Article liked successfully",
        liked: true,
      });
    }
  } catch (error) {
    next(error);
  }
};
