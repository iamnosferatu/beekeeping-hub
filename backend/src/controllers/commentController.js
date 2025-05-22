// backend/src/controllers/commentController.js - REAL DATABASE QUERIES
const { Comment, User, Article } = require("../models");
const { Op } = require("sequelize");

// @desc    Get all comments with pagination and filtering
// @route   GET /api/comments
// @access  Public (only approved comments for regular users)
exports.getComments = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const articleId = req.query.articleId;
    const status = req.query.status || "approved";

    console.log("Fetching comments with params:", {
      page,
      limit,
      articleId,
      status,
    });

    // Build where clause
    let whereClause = {};

    // For public access, only show approved comments
    // For admin access (via different endpoint), show all statuses
    if (req.user && req.user.role === "admin") {
      if (status !== "all") {
        whereClause.status = status;
      }
    } else {
      whereClause.status = "approved";
    }

    // Filter by article if specified
    if (articleId) {
      whereClause.article_id = articleId;
    }

    // Get comments with user and article info
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name", "avatar"],
        },
        {
          model: Article,
          as: "article",
          attributes: ["id", "title", "slug"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    console.log(`Found ${comments.length} comments out of ${count} total`);

    res.status(200).json({
      success: true,
      data: comments,
      count,
      pagination: {
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    next(error);
  }
};

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private (logged in users)
exports.createComment = async (req, res, next) => {
  try {
    const { content, articleId } = req.body;
    const userId = req.user.id;

    console.log(`Creating comment for article ${articleId} by user ${userId}`);

    // Validate required fields
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: "Article ID is required",
      });
    }

    // Check if article exists
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    // Create comment (defaults to 'pending' status)
    const comment = await Comment.create({
      content: content.trim(),
      user_id: userId,
      article_id: articleId,
      status: "pending", // Comments require approval
      ip_address: req.ip || req.connection.remoteAddress,
    });

    // Get comment with user info
    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name", "avatar"],
        },
        {
          model: Article,
          as: "article",
          attributes: ["id", "title", "slug"],
        },
      ],
    });

    console.log(`Comment created with ID: ${comment.id}`);

    res.status(201).json({
      success: true,
      data: fullComment,
      message: "Comment submitted for approval",
    });
  } catch (error) {
    console.error("Error creating comment:", error);
    next(error);
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private (comment author or admin)
exports.updateComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    console.log(`Updating comment ${id}`);

    // Validate content
    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    // Find comment
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check permissions (only comment author or admin can update)
    if (comment.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this comment",
      });
    }

    // Update comment
    comment.content = content.trim();

    // If user is editing their own comment, reset to pending status
    if (comment.user_id === req.user.id && req.user.role !== "admin") {
      comment.status = "pending";
    }

    await comment.save();

    // Get updated comment with user info
    const updatedComment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name", "avatar"],
        },
        {
          model: Article,
          as: "article",
          attributes: ["id", "title", "slug"],
        },
      ],
    });

    console.log(`Comment ${id} updated successfully`);

    res.status(200).json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    next(error);
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private (comment author or admin)
exports.deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`Deleting comment ${id}`);

    // Find comment
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check permissions (only comment author or admin can delete)
    if (comment.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    // Delete comment
    await comment.destroy();

    console.log(`Comment ${id} deleted successfully`);

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    next(error);
  }
};

// @desc    Update comment status (approve/reject)
// @route   PUT /api/comments/:id/status
// @access  Private (admin only)
exports.updateCommentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log(`Updating comment ${id} status to ${status}`);

    // Validate status
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'pending', 'approved', or 'rejected'",
      });
    }

    // Find comment
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Update status
    comment.status = status;
    await comment.save();

    // Get updated comment with user info
    const updatedComment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name", "avatar"],
        },
        {
          model: Article,
          as: "article",
          attributes: ["id", "title", "slug"],
        },
      ],
    });

    console.log(`Comment ${id} status updated to ${status}`);

    res.status(200).json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error updating comment status:", error);
    next(error);
  }
};
