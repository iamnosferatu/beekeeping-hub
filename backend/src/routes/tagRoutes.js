// backend/src/routes/tagRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const tagController = require("../controllers/tagController");

const router = express.Router();

// Public routes
router.get("/", tagController.getTags);
router.get("/popular", tagController.getPopularTags);
router.get("/:slug", tagController.getTag);

// Admin routes - Create, Update, Delete tags
router.post("/", protect, authorize("admin"), tagController.createTag);

router.put("/:id", protect, authorize("admin"), tagController.updateTag);

router.delete("/:id", protect, authorize("admin"), tagController.deleteTag);

module.exports = router;
