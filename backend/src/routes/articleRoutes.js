// backend/src/routes/articleRoutes.js - WITH VALIDATION
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const {
  validateArticleCreate,
  validateArticleUpdate,
  validateArticleQuery,
  validateId,
  validateSlug,
} = require("../middleware/validation");
const articleController = require("../controllers/articleController");

const router = express.Router();

// Public routes
router.get("/", validateArticleQuery, articleController.getArticles);
router.get("/:slug", validateSlug, articleController.getArticle);
router.get("/byId/:id", validateId, articleController.getArticleById);

// Protected routes
router.post(
  "/",
  protect,
  authorize("author", "admin"),
  validateArticleCreate,
  articleController.createArticle
);

router.put(
  "/:id",
  protect,
  authorize("author", "admin"),
  validateId,
  validateArticleUpdate,
  articleController.updateArticle
);

router.delete(
  "/:id",
  protect,
  authorize("author", "admin"),
  validateId,
  articleController.deleteArticle
);

router.post("/:id/like", protect, validateId, articleController.toggleLike);

module.exports = router;
