// backend/src/routes/commentRoutes.js

const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const commentController = require("../controllers/commentController");

const router = express.Router();

// Public routes - GET comments only (shows approved comments for public)
router.get("/", commentController.getComments);

// Get comments for a specific article (public route)
router.get("/article/:articleId", commentController.getArticleComments);

// Protected routes - authenticated users can create comments
router.post("/", protect, commentController.createComment);
router.put("/:id", protect, commentController.updateComment);
router.delete("/:id", protect, commentController.deleteComment);

// Admin routes - update comment status
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  commentController.updateCommentStatus
);

module.exports = router;
