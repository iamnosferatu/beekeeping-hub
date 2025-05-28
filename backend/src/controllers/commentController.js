// backend/src/controllers/commentController.js
const { Comment, User, Article } = require("../models");
const { Op } = require("sequelize");

/**
 * Comment Controller
 *
 * Handles all comment-related operations including creation,
 * retrieval, updating, and deletion of comments.
 */
const commentController = {
  /**
   * Get all comments with filtering and pagination
   * @route GET /api/comments
   * @access Public (only shows approved comments for public users)
   */
  getComments: async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;
      const { article_id, status, search } = req.query;

      // Build where clause
      const whereClause = {};

      // For non-admin users, only show approved comments
      if (!req.user || req.user.role !== "admin") {
        whereClause.status = "approved";
      } else if (status) {
        // Admin can filter by status
        whereClause.status = status;
      }

      // Filter by article if specified
      if (article_id) {
        whereClause.article_id = article_id;
      }

      // Search in comment content
      if (search) {
        whereClause.content = { [Op.like]: `%${search}%` };
      }

      // Get comments with author information
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
  },

  /**
   * Get comments for a specific article
   * @route GET /api/comments/article/:articleId
   * @access Public
   */
  getArticleComments: async (req, res, next) => {
    try {
      const { articleId } = req.params;

      // Verify article exists
      const article = await Article.findByPk(articleId);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }

      // Get approved comments for the article with nested replies
      const comments = await Comment.findAll({
        where: {
          article_id: articleId,
          status: "approved",
          parent_id: null, // Only get top-level comments
        },
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "first_name", "last_name", "avatar"],
          },
          {
            model: Comment,
            as: "replies",
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
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: comments,
      });
    } catch (error) {
      console.error("Error fetching article comments:", error);
      next(error);
    }
  },

  /**
   * Create a new comment
   * @route POST /api/comments
   * @access Private (authenticated users only)
   */
  createComment: async (req, res, next) => {
    try {
      // Extract data from request body
      const { article_id, content, parent_id } = req.body;
      const user_id = req.user.id;

      console.log("Creating comment:", {
        article_id,
        content,
        user_id,
        parent_id,
      });

      // Validate required fields
      if (!article_id || !content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Article ID and content are required",
        });
      }

      // Verify article exists and is not blocked
      const article = await Article.findByPk(article_id);
      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }

      if (article.blocked) {
        return res.status(403).json({
          success: false,
          message: "Cannot comment on a blocked article",
        });
      }

      // If it's a reply, verify parent comment exists
      if (parent_id) {
        const parentComment = await Comment.findByPk(parent_id);
        if (!parentComment) {
          return res.status(404).json({
            success: false,
            message: "Parent comment not found",
          });
        }

        // Ensure parent comment is from the same article
        if (parentComment.article_id !== parseInt(article_id)) {
          return res.status(400).json({
            success: false,
            message: "Parent comment is from a different article",
          });
        }
      }

      // Create the comment
      const comment = await Comment.create({
        content: content.trim(),
        article_id,
        user_id,
        parent_id: parent_id || null,
        status: "pending", // Comments start as pending for moderation
        ip_address: req.ip || req.connection.remoteAddress,
      });

      // Fetch the complete comment with author information
      const fullComment = await Comment.findByPk(comment.id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "first_name", "last_name", "avatar"],
          },
        ],
      });

      console.log("Comment created successfully:", fullComment.id);

      res.status(201).json({
        success: true,
        message:
          "Comment submitted successfully. It will appear after moderation.",
        data: fullComment,
      });
    } catch (error) {
      console.error("Error creating comment:", error);
      next(error);
    }
  },

  /**
   * Update a comment
   * @route PUT /api/comments/:id
   * @access Private (owner or admin)
   */
  updateComment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const user_id = req.user.id;

      // Find the comment
      const comment = await Comment.findByPk(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      // Check ownership or admin
      if (comment.user_id !== user_id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to update this comment",
        });
      }

      // Validate content
      if (!content || !content.trim()) {
        return res.status(400).json({
          success: false,
          message: "Comment content cannot be empty",
        });
      }

      // Update the comment
      comment.content = content.trim();
      // Reset status to pending if edited by user (not admin)
      if (req.user.role !== "admin") {
        comment.status = "pending";
      }

      await comment.save();

      // Fetch updated comment with author
      const updatedComment = await Comment.findByPk(id, {
        include: [
          {
            model: User,
            as: "author",
            attributes: ["id", "username", "first_name", "last_name", "avatar"],
          },
        ],
      });

      res.status(200).json({
        success: true,
        message: "Comment updated successfully",
        data: updatedComment,
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      next(error);
    }
  },

  /**
   * Delete a comment
   * @route DELETE /api/comments/:id
   * @access Private (owner or admin)
   */
  deleteComment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      // Find the comment
      const comment = await Comment.findByPk(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      // Check ownership or admin
      if (comment.user_id !== user_id && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Not authorized to delete this comment",
        });
      }

      // Check if comment has replies
      const replyCount = await Comment.count({
        where: { parent_id: id },
      });

      if (replyCount > 0) {
        // Instead of deleting, mark as deleted
        comment.content = "[This comment has been deleted]";
        comment.status = "approved"; // Keep it visible for thread continuity
        await comment.save();

        res.status(200).json({
          success: true,
          message: "Comment marked as deleted (has replies)",
        });
      } else {
        // No replies, safe to delete
        await comment.destroy();

        res.status(200).json({
          success: true,
          message: "Comment deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      next(error);
    }
  },

  /**
   * Update comment status (admin only)
   * @route PUT /api/comments/:id/status
   * @access Private (admin only)
   */
  updateCommentStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ["pending", "approved", "rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid status. Must be one of: pending, approved, rejected",
        });
      }

      // Find and update comment
      const comment = await Comment.findByPk(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          message: "Comment not found",
        });
      }

      comment.status = status;
      await comment.save();

      // Fetch updated comment with associations
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

      res.status(200).json({
        success: true,
        message: `Comment ${status}`,
        data: updatedComment,
      });
    } catch (error) {
      console.error("Error updating comment status:", error);
      next(error);
    }
  },
};

module.exports = commentController;
