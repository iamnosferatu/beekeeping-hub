// backend/src/routes/adminArticleRoutes.js

const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  blockArticle,
  unblockArticle,
  getBlockedArticles,
} = require("../controllers/adminArticleController");

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(authorize("admin"));

// Article blocking/unblocking routes
router.put("/articles/:id/block", blockArticle);
router.put("/articles/:id/unblock", unblockArticle);
router.get("/articles/blocked", getBlockedArticles);

module.exports = router;
