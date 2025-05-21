// backend/src/routes/adminDiagnosticsRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  getSystemDiagnostics,
  getLogs,
  getApiMetrics,
  getDatabaseDiagnostics,
  testEndpoint,
} = require("../controllers/adminController");

const router = express.Router();

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(authorize("admin"));

// Diagnostic routes
router.get("/system", getSystemDiagnostics);
router.get("/logs", getLogs);
router.get("/metrics", getApiMetrics);
router.get("/database", getDatabaseDiagnostics);
router.post("/test-endpoint", testEndpoint);

module.exports = router;
