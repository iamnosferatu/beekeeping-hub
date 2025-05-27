// backend/src/routes/articleRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const articleController = require("../controllers/articleController");

const router = express.Router();

/**
 * Optional authentication middleware
 * Attaches user to request if authenticated, but doesn't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1].trim();
    }

    // If no token, just continue without user
    if (!token) {
      return next();
    }

    // Try to verify token
    const jwt = require("jsonwebtoken");
    const { User } = require("../models");
    const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token verification failed, but we'll still allow the request
      console.log("Optional auth token verification failed:", error.message);
    }

    next();
  } catch (error) {
    // If anything goes wrong, just continue without user
    console.error("Optional auth error:", error);
    next();
  }
};

// Public routes with optional authentication
// This allows the controller to check if user is admin to show blocked articles
router.get("/", optionalAuth, articleController.getArticles);
router.get("/:slug", optionalAuth, articleController.getArticle);

// Protected route for editing - requires authentication
router.get("/byId/:id", protect, articleController.getArticleById);

// Protected routes
router.post(
  "/",
  protect,
  authorize("author", "admin"),
  articleController.createArticle
);

router.put(
  "/:id",
  protect,
  authorize("author", "admin"),
  articleController.updateArticle
);

router.delete(
  "/:id",
  protect,
  authorize("author", "admin"),
  articleController.deleteArticle
);

router.post("/:id/like", protect, articleController.toggleLike);

module.exports = router;
