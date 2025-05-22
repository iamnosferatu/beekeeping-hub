// backend/src/controllers/articleController.js - PROPERLY FIXED VERSION
const { Article, User, Tag, Comment, Like, sequelize } = require("../models");
const { Op } = require("sequelize");
const slug = require("slug"); // Make sure slug package is installed

// Helper function to build include options for article lists (prevents duplicates)
const getArticleListIncludes = () => {
  return [
    {
      model: User,
      as: "author",
      attributes: ["id", "username", "first_name", "last_name", "avatar"],
    },
    // For lists, we'll fetch tags and other data separately to avoid duplicates
  ];
};

// Helper function for single article includes (full data)
const getSingleArticleIncludes = () => {
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
  // Create base slug from title
  let baseSlug = slug(title || "article", { lower: true });

  // Check if slug exists
  let slugToUse = baseSlug;
  let counter = 1;
  let existingArticle;

  // Keep checking for slug uniqueness
  do {
    existingArticle = await Article.findOne({ where: { slug: slugToUse } });

    if (existingArticle) {
      // Add incremental number to slug if exists
      slugToUse = `${baseSlug}-${counter}`;
      counter++;
    }
  } while (existingArticle);

  return slugToUse;
};

// Helper function to safely get query parameters
const getValidQueryParam = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === "undefined" ||
    value === "null"
  ) {
    return null;
  }
  if (typeof value === "string" && value.trim() === "") {
    return null;
  }
  return value;
};

// Helper function to fetch additional data for articles
const enrichArticlesWithMetadata = async (articles) => {
  if (!articles || articles.length === 0) return [];

  const articleIds = articles.map((article) => article.id);

  // Fetch tags for all articles in one query
  const articleTags = await sequelize.query(
    `SELECT at.article_id, t.id, t.name, t.slug 
     FROM article_tags at 
     JOIN tags t ON at.tag_id = t.id 
     WHERE at.article_id IN (${articleIds.map(() => "?").join(",")})`,
    {
      replacements: articleIds,
      type: sequelize.QueryTypes.SELECT,
    }
  );

  // Fetch comment counts for all articles in one query
  const commentCounts = await sequelize.query(
    `SELECT article_id, COUNT(*) as comment_count 
     FROM comments 
     WHERE article_id IN (${articleIds.map(() => "?").join(",")}) 
     AND status = 'approved' 
     GROUP BY article_id`,
    {
      replacements: articleIds,
      type: sequelize.QueryTypes.SELECT,
    }
  );

  // Fetch like counts for all articles in one query
  const likeCounts = await sequelize.query(
    `SELECT article_id, COUNT(*) as like_count 
     FROM likes 
     WHERE article_id IN (${articleIds.map(() => "?").join(",")}) 
     GROUP BY article_id`,
    {
      replacements: articleIds,
      type: sequelize.QueryTypes.SELECT,
    }
  );

  // Group tags by article_id
  const tagsByArticle = {};
  articleTags.forEach((tag) => {
    if (!tagsByArticle[tag.article_id]) {
      tagsByArticle[tag.article_id] = [];
    }
    tagsByArticle[tag.article_id].push({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    });
  });

  // Group counts by article_id
  const commentCountsByArticle = {};
  commentCounts.forEach((count) => {
    commentCountsByArticle[count.article_id] = parseInt(count.comment_count);
  });

  const likeCountsByArticle = {};
  likeCounts.forEach((count) => {
    likeCountsByArticle[count.article_id] = parseInt(count.like_count);
  });

  // Enrich articles with metadata
  return articles.map((article) => {
    const articleJson = article.toJSON();

    // Add tags
    articleJson.tags = tagsByArticle[article.id] || [];

    // Add counts
    articleJson.comment_count = commentCountsByArticle[article.id] || 0;
    articleJson.like_count = likeCountsByArticle[article.id] || 0;

    return articleJson;
  });
};

// @desc    Get all articles with pagination, filtering, and search
// @route   GET /api/articles
// @access  Public
exports.getArticles = async (req, res, next) => {
  try {
    console.log("Raw query parameters:", req.query);

    // Safely extract and validate query parameters
    const page = parseInt(getValidQueryParam(req.query.page)) || 1;
    const limit = parseInt(getValidQueryParam(req.query.limit)) || 10;
    const offset = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause = { status: "published" };

    // Filter by tag if provided
    const tagParam = getValidQueryParam(req.query.tag);
    if (tagParam) {
      console.log("Filtering by tag:", tagParam);

      // Find tag ID from slug
      const tag = await Tag.findOne({ where: { slug: tagParam } });

      if (tag) {
        // Get article IDs associated with this tag
        const articleTags = await sequelize.query(
          "SELECT article_id FROM article_tags WHERE tag_id = ?",
          {
            replacements: [tag.id],
            type: sequelize.QueryTypes.SELECT,
          }
        );

        const articleIds = articleTags.map((at) => at.article_id);

        if (articleIds.length > 0) {
          whereClause.id = { [Op.in]: articleIds };
        } else {
          // No articles with this tag, return empty result early
          console.log("No articles found for tag:", tagParam);
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
      } else {
        console.log("Tag not found:", tagParam);
        // Tag doesn't exist, return empty result
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
    }

    // Search functionality - FIXED: Proper parameter validation
    const searchParam = getValidQueryParam(req.query.search);
    if (searchParam && searchParam.length >= 2) {
      // Minimum search length
      console.log("Applying search filter:", searchParam);
      const searchTerm = `%${searchParam}%`;
      whereClause[Op.or] = [
        { title: { [Op.like]: searchTerm } },
        { content: { [Op.like]: searchTerm } },
        { excerpt: { [Op.like]: searchTerm } },
      ];
    } else if (searchParam) {
      console.log("Search term too short, ignoring:", searchParam);
    }

    console.log("Final where clause:", JSON.stringify(whereClause, null, 2));

    // Get total count for pagination (without includes to avoid duplicates)
    const count = await Article.count({ where: whereClause });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    // Get articles with minimal includes to avoid duplicates
    const articles = await Article.findAll({
      where: whereClause,
      include: getArticleListIncludes(), // Only includes author, no many-to-many
      order: [["published_at", "DESC"]],
      limit,
      offset,
    });

    console.log(
      `Found ${articles.length} articles, enriching with metadata...`
    );

    // Enrich articles with tags, comments, and likes data
    const enrichedArticles = await enrichArticlesWithMetadata(articles);

    console.log(`Enriched ${enrichedArticles.length} articles with metadata`);

    res.status(200).json({
      success: true,
      data: enrichedArticles,
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

// Get Article by ID
exports.getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    const articleId = parseInt(id);
    if (isNaN(articleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    console.log("Fetching article by ID:", articleId);

    // For single article, we can use regular includes since we only get one result
    const article = await Article.findByPk(articleId, {
      include: getSingleArticleIncludes(),
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Add like count to the response
    const articleData = article.toJSON();
    if (articleData.Likes) {
      articleData.like_count = articleData.Likes.length;
    }

    res.status(200).json({
      success: true,
      data: articleData,
    });
  } catch (error) {
    console.error("Error fetching article by ID:", error);
    next(error);
  }
};

// @desc    Get single article by slug
// @route   GET /api/articles/:slug
// @access  Public
exports.getArticle = async (req, res, next) => {
  try {
    const { slug: articleSlug } = req.params;

    // Validate slug parameter
    if (!articleSlug || articleSlug.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Invalid article slug",
      });
    }

    console.log("Fetching article by slug:", articleSlug);

    // For single article, we can use regular includes since we only get one result
    const article = await Article.findOne({
      where: { slug: articleSlug.trim() },
      include: getSingleArticleIncludes(),
    });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Increment view count
    article.view_count += 1;
    await article.save();

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
    console.error("Error in getArticle:", error);
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

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title is required",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Content is required",
      });
    }

    // Generate a unique slug from the title
    const articleSlug = await generateUniqueSlug(title.trim());

    console.log(`Creating article with slug: ${articleSlug}`);

    // Create the article
    const article = await Article.create({
      title: title.trim(),
      slug: articleSlug,
      content: content.trim(),
      excerpt: excerpt ? excerpt.trim() : content.substring(0, 200) + "...",
      featured_image: featured_image ? featured_image.trim() : null,
      status,
      user_id,
      published_at: status === "published" ? new Date() : null,
    });

    // Handle tags
    if (tags.length > 0) {
      // Get existing tags or create new ones
      const tagObjects = await Promise.all(
        tags.map(async (tagName) => {
          if (!tagName || !tagName.trim()) return null;

          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim() },
            defaults: { slug: slug(tagName.trim(), { lower: true }) },
          });
          return tag;
        })
      );

      // Filter out null values and associate tags with article
      const validTags = tagObjects.filter((tag) => tag !== null);
      if (validTags.length > 0) {
        await article.setTags(validTags);
      }
    }

    // Get full article with associations (single article, so no duplicates)
    const fullArticle = await Article.findByPk(article.id, {
      include: getSingleArticleIncludes(),
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

    // Validate ID parameter
    const articleId = parseInt(id);
    if (isNaN(articleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    // Find article
    const article = await Article.findByPk(articleId);

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

    // Get update fields
    const {
      title,
      content,
      excerpt,
      featured_image,
      status,
      tags = [],
    } = req.body;

    // Check if publishing for the first time
    const isPublishingNow = !article.published_at && status === "published";

    // Check if title is being changed - if so, update slug
    if (title && title.trim() && title.trim() !== article.title) {
      article.slug = await generateUniqueSlug(title.trim());
    }

    // Update article fields
    if (title && title.trim()) {
      article.title = title.trim();
    }
    if (content && content.trim()) {
      article.content = content.trim();
    }
    if (excerpt !== undefined) {
      article.excerpt = excerpt ? excerpt.trim() : null;
    }
    if (featured_image !== undefined) {
      article.featured_image = featured_image ? featured_image.trim() : null;
    }

    if (status) {
      article.status = status;

      // Set published_at when publishing for the first time
      if (isPublishingNow) {
        article.published_at = new Date();
      }
    }

    await article.save();

    // Handle tags if provided
    if (Array.isArray(tags) && tags.length > 0) {
      // Get existing tags or create new ones
      const tagObjects = await Promise.all(
        tags.map(async (tagName) => {
          if (!tagName || !tagName.trim()) return null;

          const [tag] = await Tag.findOrCreate({
            where: { name: tagName.trim() },
            defaults: { slug: slug(tagName.trim(), { lower: true }) },
          });
          return tag;
        })
      );

      // Filter out null values and replace existing tags
      const validTags = tagObjects.filter((tag) => tag !== null);
      await article.setTags(validTags);
    } else if (Array.isArray(tags) && tags.length === 0) {
      // Clear all tags if empty array is provided
      await article.setTags([]);
    }

    // Get updated article with associations (single article, so no duplicates)
    const updatedArticle = await Article.findByPk(articleId, {
      include: getSingleArticleIncludes(),
    });

    res.status(200).json({
      success: true,
      data: updatedArticle,
    });
  } catch (error) {
    console.error("Error updating article:", error);
    next(error);
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Owner, Admin)
exports.deleteArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID parameter
    const articleId = parseInt(id);
    if (isNaN(articleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    // Find article
    const article = await Article.findByPk(articleId);

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
        message: "Not authorized to delete this article",
      });
    }

    // Delete article (this will also delete associated comments and likes due to cascade)
    await article.destroy();

    res.status(200).json({
      success: true,
      message: "Article deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting article:", error);
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

    // Validate ID parameter
    const articleId = parseInt(id);
    if (isNaN(articleId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid article ID",
      });
    }

    // Find article
    const article = await Article.findByPk(articleId);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if user already liked the article
    const existingLike = await Like.findOne({
      where: { article_id: articleId, user_id },
    });

    if (existingLike) {
      // Unlike - remove the like
      await existingLike.destroy();

      res.status(200).json({
        success: true,
        message: "Article unliked successfully",
        liked: false,
      });
    } else {
      // Like - add a new like
      await Like.create({ article_id: articleId, user_id });

      res.status(200).json({
        success: true,
        message: "Article liked successfully",
        liked: true,
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    next(error);
  }
};
