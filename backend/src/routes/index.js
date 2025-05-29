// backend/src/routes/index.js
const express = require("express");
const router = express.Router();

// Import route files
const authRoutes = require("./authRoutes");
const articleRoutes = require("./articleRoutes");
const commentRoutes = require("./commentRoutes");
const tagRoutes = require("./tagRoutes");
const adminRoutes = require("./adminRoutes");
const siteSettingsRoutes = require("./siteSettingsRoutes");

// API root
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BeeKeeper Blog API",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    endpoints: [
      "/auth",
      "/articles",
      "/comments",
      "/tags",
      "/admin",
      "/site-settings",
      "/health",
    ],
  });
});

// Mount route groups
router.use("/auth", authRoutes);
router.use("/articles", articleRoutes);
router.use("/comments", commentRoutes);
router.use("/tags", tagRoutes);
router.use("/admin", adminRoutes);
router.use("/site-settings", siteSettingsRoutes);

// API health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
