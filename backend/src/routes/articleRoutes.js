// backend/src/routes/articleRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const articleController = require("../controllers/articleController");

const router = express.Router();

// Public routes
router.get("/", articleController.getArticles);
router.get("/:slug", articleController.getArticle);
router.get('/byId/:id', articleController.getArticleById);

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
