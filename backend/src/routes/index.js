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
const newsletterRoutes = require("./newsletterRoutes");
const contactRoutes = require("./contactRoutes");
const likeRoutes = require("./likeRoutes");
const sitemapRoutes = require("./sitemapRoutes");

// API root
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BeeKeeper's Blog API",
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
      "/newsletter",
      "/contact",
      "/likes",
      "/health",
      "/sitemap",
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
router.use("/newsletter", newsletterRoutes);
router.use("/contact", contactRoutes);
router.use("/likes", likeRoutes);
router.use("/", sitemapRoutes); // Sitemap routes at root level for sitemap.xml

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
