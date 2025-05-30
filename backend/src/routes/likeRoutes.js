// backend/src/routes/likeRoutes.js
const express = require("express");
const router = express.Router();
const likeController = require("../controllers/likeController");
const { protect } = require("../middleware/auth");

// All like routes require authentication
router.use(protect);

// Toggle like on an article
router.post("/articles/:articleId/toggle", likeController.toggleLike);

// Get like status for a specific article
router.get("/articles/:articleId/status", likeController.getLikeStatus);

// Get all articles liked by the current user
router.get("/user/liked-articles", likeController.getUserLikedArticles);

// Get users who liked a specific article (public info)
router.get("/articles/:articleId/likers", likeController.getArticleLikers);

module.exports = router;