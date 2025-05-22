// ============================================================================
// backend/src/routes/adminRoutes.js - WITH VALIDATION
// ============================================================================

const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  validateUserRoleUpdate,
  validateCommentQuery,
  validatePagination,
  validateId,
} = require("../middleware/validation");
const diagnosticsRoutes = require("./adminDiagnosticsRoutes");
const {
  getDashboardStats,
  getUsers,
  updateUserRole,
  getCommentsForModeration,
} = require("../controllers/adminController");

const router = express.Router();

// Apply middleware to all admin routes
router.use(protect);
router.use(authorize("admin"));

// Mount diagnostics routes
router.use("/diagnostics", diagnosticsRoutes);

// Admin dashboard routes - WITH VALIDATION
router.get("/dashboard", getDashboardStats);
router.get("/users", validatePagination, getUsers);
router.put(
  "/users/:id/role",
  validateId,
  validateUserRoleUpdate,
  updateUserRole
);
router.get("/comments", validateCommentQuery, getCommentsForModeration);

module.exports = router;
