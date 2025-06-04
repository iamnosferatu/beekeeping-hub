// backend/src/routes/maintenanceRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const maintenanceController = require("../controllers/maintenanceController");

const router = express.Router();

// Public route - anyone can check maintenance settings
// This is needed so the frontend can check if maintenance mode is active
router.get("/", maintenanceController.getSettings);

// Admin-only routes for updating settings
router.put(
  "/",
  protect,
  authorize("admin"),
  maintenanceController.updateSettings
);

// Quick toggle routes for convenience
router.post(
  "/toggle",
  protect,
  authorize("admin"),
  maintenanceController.toggleMaintenanceMode
);

router.post(
  "/alert/toggle",
  protect,
  authorize("admin"),
  maintenanceController.toggleAlert
);

module.exports = router;
