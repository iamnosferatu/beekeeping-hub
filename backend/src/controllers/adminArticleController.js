// backend/src/controllers/adminArticleController.js
const { Article, User } = require("../models");

/**
 * @desc    Block an article
 * @route   PUT /api/admin/articles/:id/block
 * @access  Private (Admin only)
 */
exports.blockArticle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    console.log(`Admin ${req.user.id} attempting to block article ${id}`);

    // Find the article
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if article is already blocked
    if (article.blocked) {
      return res.status(400).json({
        success: false,
        message: "Article is already blocked",
      });
    }

    // Update article with blocked status
    article.blocked = true;
    article.blocked_reason = reason || "No reason specified";
    article.blocked_by = req.user.id;
    article.blocked_at = new Date();

    await article.save();

    console.log(`Article ${id} blocked successfully by admin ${req.user.id}`);

    // Return updated article with author information
    const updatedArticle = await Article.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Article blocked successfully",
      data: updatedArticle,
    });
  } catch (error) {
    console.error("Error blocking article:", error);
    next(error);
  }
};

/**
 * @desc    Unblock an article
 * @route   PUT /api/admin/articles/:id/unblock
 * @access  Private (Admin only)
 */
exports.unblockArticle = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`Admin ${req.user.id} attempting to unblock article ${id}`);

    // Find the article
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Check if article is not blocked
    if (!article.blocked) {
      return res.status(400).json({
        success: false,
        message: "Article is not blocked",
      });
    }

    // Update article to remove blocked status
    article.blocked = false;
    article.blocked_reason = null;
    article.blocked_by = null;
    article.blocked_at = null;

    await article.save();

    console.log(`Article ${id} unblocked successfully by admin ${req.user.id}`);

    // Return updated article with author information
    const updatedArticle = await Article.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Article unblocked successfully",
      data: updatedArticle,
    });
  } catch (error) {
    console.error("Error unblocking article:", error);
    next(error);
  }
};

/**
 * @desc    Get all blocked articles
 * @route   GET /api/admin/articles/blocked
 * @access  Private (Admin only)
 */
exports.getBlockedArticles = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get blocked articles with pagination
    const { count, rows: articles } = await Article.findAndCountAll({
      where: { blocked: true },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name", "email"],
        },
      ],
      order: [["blocked_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: articles,
      count,
      pagination: {
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching blocked articles:", error);
    next(error);
  }
};
