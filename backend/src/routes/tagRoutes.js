// ============================================================================
// backend/src/routes/tagRoutes.js - WITH VALIDATION
// ============================================================================

const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  validateTagCreate,
  validateTagUpdate,
  validateId,
  validateSlug,
} = require("../middleware/validation");
const {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");

const router = express.Router();

// Public routes
router.get("/", getTags);
router.get("/:slug", validateSlug, getTag);

// Protected routes (for creating tags)
router.post(
  "/",
  protect,
  authorize("author", "admin"),
  validateTagCreate,
  createTag
);

// Admin only routes
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validateId,
  validateTagUpdate,
  updateTag
);
router.delete("/:id", protect, authorize("admin"), validateId, deleteTag);

module.exports = router;
