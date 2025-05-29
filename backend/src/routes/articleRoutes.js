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

/**
 * @swagger
 * /articles:
 *   get:
 *     summary: Get all articles
 *     tags: [Articles]
 *     security:
 *       - {}
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag slug
 *       - in: query
 *         name: author
 *         schema:
 *           type: integer
 *         description: Filter by author ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: Filter by article status (admin only)
 *     responses:
 *       200:
 *         description: Articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 */
router.get("/", optionalAuth, articleController.getArticles);
/**
 * @swagger
 * /articles/{slug}:
 *   get:
 *     summary: Get single article by slug
 *     tags: [Articles]
 *     security:
 *       - {}
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Article slug
 *     responses:
 *       200:
 *         description: Article retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 article:
 *                   $ref: '#/components/schemas/Article'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:slug", optionalAuth, articleController.getArticle);

/**
 * @swagger
 * /articles/byId/{id}:
 *   get:
 *     summary: Get article by ID for editing
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Article retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 article:
 *                   $ref: '#/components/schemas/Article'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/byId/:id", protect, articleController.getArticleById);

/**
 * @swagger
 * /articles:
 *   post:
 *     summary: Create a new article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: Introduction to Beekeeping
 *               content:
 *                 type: string
 *                 example: Beekeeping is a fascinating hobby...
 *               excerpt:
 *                 type: string
 *                 example: Learn the basics of beekeeping
 *               featured_image:
 *                 type: string
 *                 example: https://example.com/bee-image.jpg
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *                 default: draft
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [beginner, equipment, hive-management]
 *     responses:
 *       201:
 *         description: Article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 article:
 *                   $ref: '#/components/schemas/Article'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  "/",
  protect,
  authorize("author", "admin"),
  articleController.createArticle
);

/**
 * @swagger
 * /articles/{id}:
 *   put:
 *     summary: Update an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Article ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Title
 *               content:
 *                 type: string
 *                 example: Updated content...
 *               excerpt:
 *                 type: string
 *                 example: Updated excerpt
 *               featured_image:
 *                 type: string
 *                 example: https://example.com/new-image.jpg
 *               status:
 *                 type: string
 *                 enum: [draft, published]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: [advanced, honey-production]
 *     responses:
 *       200:
 *         description: Article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 article:
 *                   $ref: '#/components/schemas/Article'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put(
  "/:id",
  protect,
  authorize("author", "admin"),
  articleController.updateArticle
);

/**
 * @swagger
 * /articles/{id}:
 *   delete:
 *     summary: Delete an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Article deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Article deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  "/:id",
  protect,
  authorize("author", "admin"),
  articleController.deleteArticle
);

/**
 * @swagger
 * /articles/{id}/like:
 *   post:
 *     summary: Toggle like on an article
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Article ID
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Article liked
 *                 isLiked:
 *                   type: boolean
 *                   example: true
 *                 likes:
 *                   type: integer
 *                   example: 42
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post("/:id/like", protect, articleController.toggleLike);

// Alternative endpoint for article comments
router.get("/:articleId/comments", async (req, res) => {
  try {
    const { Comment, User } = require("../models");
    const { articleId } = req.params;
    
    const comments = await Comment.findAll({
      where: {
        article_id: articleId,
        status: "approved"
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name", "avatar"]
        }
      ],
      order: [["created_at", "DESC"]]
    });
    
    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
