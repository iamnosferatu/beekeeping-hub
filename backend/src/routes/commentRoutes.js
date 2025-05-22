// ============================================================================
// backend/src/routes/commentRoutes.js - WITH VALIDATION
// ============================================================================

const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  validateCommentCreate,
  validateCommentUpdate,
  validateCommentStatus,
  validateCommentQuery,
  validateId,
} = require("../middleware/validation");
const {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  updateCommentStatus,
} = require("../controllers/commentController");

const router = express.Router();

// Public routes - GET comments only for approved comments
router.get("/", validateCommentQuery, getComments);

// Protected routes
router.post("/", protect, validateCommentCreate, createComment);
router.put("/:id", protect, validateId, validateCommentUpdate, updateComment);
router.delete("/:id", protect, validateId, deleteComment);

// Admin routes
router.put(
  "/:id/status",
  protect,
  authorize("admin"),
  validateId,
  validateCommentStatus,
  updateCommentStatus
);

module.exports = router;
