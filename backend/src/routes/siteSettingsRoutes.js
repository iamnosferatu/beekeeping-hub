// backend/src/routes/siteSettingsRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const siteSettingsController = require("../controllers/siteSettingsController");

const router = express.Router();

// Public route - anyone can check site settings
// This is needed so the frontend can check if maintenance mode is active
router.get("/", siteSettingsController.getSettings);

// Admin-only routes for updating settings
router.put(
  "/",
  protect,
  authorize("admin"),
  siteSettingsController.updateSettings
);

// Quick toggle routes for convenience
router.post(
  "/maintenance/toggle",
  protect,
  authorize("admin"),
  siteSettingsController.toggleMaintenanceMode
);

router.post(
  "/alert/toggle",
  protect,
  authorize("admin"),
  siteSettingsController.toggleAlert
);

module.exports = router;
