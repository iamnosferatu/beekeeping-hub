// backend/src/routes/tagRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const tagController = require("../controllers/tagController");

const router = express.Router();

/**
 * @swagger
 * /tags:
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
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
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tags:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Tag'
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
router.get("/", tagController.getTags);
/**
 * @swagger
 * /tags/popular:
 *   get:
 *     summary: Get popular tags
 *     tags: [Tags]
 *     description: Returns tags sorted by usage count
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of tags to return
 *     responses:
 *       200:
 *         description: Popular tags retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tags:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Tag'
 *                       - type: object
 *                         properties:
 *                           articleCount:
 *                             type: integer
 *                             example: 15
 */
router.get("/popular", tagController.getPopularTags);
/**
 * @swagger
 * /tags/{slug}:
 *   get:
 *     summary: Get single tag by slug
 *     tags: [Tags]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag slug
 *         example: beginner-beekeeping
 *     responses:
 *       200:
 *         description: Tag retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tag:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Tag'
 *                     - type: object
 *                       properties:
 *                         articles:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Article'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/:slug", tagController.getTag);

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Create a new tag (admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Advanced Techniques
 *               description:
 *                 type: string
 *                 example: Articles about advanced beekeeping techniques
 *     responses:
 *       201:
 *         description: Tag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tag:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         description: Tag already exists or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/", protect, authorize("admin"), tagController.createTag);

/**
 * @swagger
 * /tags/{id}:
 *   put:
 *     summary: Update a tag (admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Updated Tag Name
 *               description:
 *                 type: string
 *                 example: Updated description for the tag
 *     responses:
 *       200:
 *         description: Tag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tag:
 *                   $ref: '#/components/schemas/Tag'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put("/:id", protect, authorize("admin"), tagController.updateTag);

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     summary: Delete a tag (admin only)
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Tag ID
 *     responses:
 *       200:
 *         description: Tag deleted successfully
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
 *                   example: Tag deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/:id", protect, authorize("admin"), tagController.deleteTag);

module.exports = router;
