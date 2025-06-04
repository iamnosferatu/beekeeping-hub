// backend/src/routes/index.js
const express = require("express");
const { rateLimiters } = require("../middleware/enhancedRateLimiter");
const router = express.Router();

// Apply general API rate limiting to all routes
router.use(rateLimiters.generalApi);

// Import route files
const authRoutes = require("./authRoutes");
const articleRoutes = require("./articleRoutes");
const commentRoutes = require("./commentRoutes");
const tagRoutes = require("./tagRoutes");
const adminRoutes = require("./adminRoutes");
const maintenanceRoutes = require("./maintenanceRoutes");
const featureRoutes = require("./featureRoutes");
const newsletterRoutes = require("./newsletterRoutes");
const contactRoutes = require("./contactRoutes");
const likeRoutes = require("./likeRoutes");
const sitemapRoutes = require("./sitemapRoutes");
const authorApplicationRoutes = require("./authorApplicationRoutes");
const forumRoutes = require("./forumRoutes");
const adminForumRoutes = require("./adminForumRoutes");

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
      "/maintenance",
      "/features",
      "/newsletter",
      "/contact",
      "/likes",
      "/health",
      "/debug",
      "/sitemap",
      "/author-applications",
      "/forum",
      "/admin/forum",
    ],
  });
});

// Mount route groups
router.use("/auth", authRoutes);
router.use("/articles", articleRoutes);
router.use("/comments", commentRoutes);
router.use("/tags", tagRoutes);
router.use("/admin", adminRoutes);
router.use("/maintenance", maintenanceRoutes);
router.use("/site-settings", maintenanceRoutes); // Backward compatibility
router.use("/features", featureRoutes);
router.use("/newsletter", newsletterRoutes);
router.use("/contact", contactRoutes);
router.use("/likes", likeRoutes);
router.use("/author-applications", authorApplicationRoutes);
router.use("/forum", forumRoutes);
router.use("/admin/forum", adminForumRoutes);
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

// Debug endpoint (only available in development)
router.get("/debug", (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({
      success: false,
      message: "Debug endpoint only available in development mode"
    });
  }

  const { sequelize } = require('../models');
  
  res.status(200).json({
    success: true,
    environment: process.env.NODE_ENV,
    server: {
      time: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    },
    database: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      connected: sequelize.connectionManager.pool ? true : false,
      dialect: sequelize.getDialect(),
    },
    headers: req.headers,
    requestInfo: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }
  });
});

module.exports = router;
