// backend/src/routes/commentRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Define controller functions
const commentController = {
  getComments: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  createComment: async (req, res, next) => {
    try {
      res.status(201).json({
        success: true,
        data: {
          id: 1,
          content: req.body.content,
          status: "pending",
          user_id: 1,
          article_id: req.body.articleId,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  updateComment: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          id: req.params.id,
          content: req.body.content,
          status: "pending",
          user_id: 1,
          article_id: 1,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  deleteComment: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        message: "Comment deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  updateCommentStatus: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          id: req.params.id,
          content: "Comment content",
          status: req.body.status,
          user_id: 1,
          article_id: 1,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

// Public routes - GET comments only for approved comments
router.get("/", commentController.getComments);

// Protected routes
router.post("/", protect, commentController.createComment);
router.put("/:id", protect, commentController.updateComment);
router.delete("/:id", protect, commentController.deleteComment);

// Admin routes
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  commentController.updateCommentStatus
);

module.exports = router;
