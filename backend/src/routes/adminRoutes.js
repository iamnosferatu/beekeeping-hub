// backend/src/routes/adminRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const diagnosticsRoutes = require("./adminDiagnosticsRoutes");
const adminArticleRoutes = require("./adminArticleRoutes");
const {
  getDashboardStats,
  getRecentActivity,
  getUsers,
  updateUserRole,
  getCommentsForModeration,
  updateCommentStatus,
  toggleArticleBlock,
} = require("../controllers/adminController");

const router = express.Router();

// Apply middleware to all admin routes
router.use(protect);
router.use(authorize("admin"));

// Mount diagnostics routes
router.use("/diagnostics", diagnosticsRoutes);

// Mount article management routes (for blocking/unblocking)
router.use("/", adminArticleRoutes);

// Admin dashboard routes
router.get("/dashboard", getDashboardStats);
router.get("/activity", getRecentActivity);
router.get("/users", getUsers);
router.put("/users/:id/role", updateUserRole);
router.get("/comments", getCommentsForModeration);
router.put("/comments/:id/status", updateCommentStatus);
router.put("/articles/:id/block", toggleArticleBlock);
router.put("/articles/:id/unblock", toggleArticleBlock);

module.exports = router;
