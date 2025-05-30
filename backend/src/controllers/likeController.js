// backend/src/controllers/likeController.js
const { Like, Article, User } = require("../models");
const { Op } = require("sequelize");

// Toggle like on an article
exports.toggleLike = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    // Check if article exists
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Check if article is blocked
    if (article.blocked) {
      return res.status(403).json({ message: "Cannot like a blocked article" });
    }

    // Check if user already liked this article
    const existingLike = await Like.findOne({
      where: {
        user_id: userId,
        article_id: articleId,
      },
    });

    if (existingLike) {
      // Unlike: Remove the like
      await existingLike.destroy();
      
      // Get updated like count
      const likeCount = await Like.count({
        where: { article_id: articleId },
      });

      return res.json({
        liked: false,
        likeCount,
        message: "Article unliked successfully",
      });
    } else {
      // Like: Create new like
      await Like.create({
        user_id: userId,
        article_id: articleId,
      });

      // Get updated like count
      const likeCount = await Like.count({
        where: { article_id: articleId },
      });

      return res.json({
        liked: true,
        likeCount,
        message: "Article liked successfully",
      });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Error toggling like", error: error.message });
  }
};

// Get like status for a specific article
exports.getLikeStatus = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.user.id;

    const like = await Like.findOne({
      where: {
        user_id: userId,
        article_id: articleId,
      },
    });

    const likeCount = await Like.count({
      where: { article_id: articleId },
    });

    res.json({
      liked: !!like,
      likeCount,
    });
  } catch (error) {
    console.error("Error getting like status:", error);
    res.status(500).json({ message: "Error getting like status", error: error.message });
  }
};

// Get all articles liked by the current user
exports.getUserLikedArticles = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const likes = await Like.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Article,
          as: "Article",
          where: {
            status: "published",
            blocked: false,
          },
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "username", "avatar"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const articles = likes.rows.map((like) => ({
      ...like.Article.toJSON(),
      likedAt: like.created_at,
    }));

    res.json({
      articles,
      totalCount: likes.count,
      currentPage: page,
      totalPages: Math.ceil(likes.count / limit),
    });
  } catch (error) {
    console.error("Error getting user liked articles:", error);
    res.status(500).json({ message: "Error getting liked articles", error: error.message });
  }
};

// Get users who liked a specific article
exports.getArticleLikers = async (req, res) => {
  try {
    const { articleId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Check if article exists
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const likes = await Like.findAndCountAll({
      where: { article_id: articleId },
      include: [
        {
          model: User,
          attributes: ["id", "username", "avatar"],
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    const users = likes.rows.map((like) => ({
      ...like.User.toJSON(),
      likedAt: like.created_at,
    }));

    res.json({
      users,
      totalCount: likes.count,
      currentPage: page,
      totalPages: Math.ceil(likes.count / limit),
    });
  } catch (error) {
    console.error("Error getting article likers:", error);
    res.status(500).json({ message: "Error getting article likers", error: error.message });
  }
};