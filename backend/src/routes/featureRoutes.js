// backend/src/routes/featureRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const featureController = require("../controllers/featureController");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Feature:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         enabled:
 *           type: boolean
 *         last_modified:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/features:
 *   get:
 *     summary: Get all features
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all features
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Feature'
 */
router.get("/", protect, authorize("admin"), featureController.getAllFeatures);

/**
 * @swagger
 * /api/features/{name}:
 *   get:
 *     summary: Get feature status
 *     tags: [Features]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature name
 *     responses:
 *       200:
 *         description: Feature status
 */
router.get("/:name", featureController.getFeatureStatus);

/**
 * @swagger
 * /api/features:
 *   post:
 *     summary: Create a new feature
 *     tags: [Features]
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
 *               enabled:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       201:
 *         description: Feature created successfully
 */
router.post("/", protect, authorize("admin"), featureController.createFeature);

/**
 * @swagger
 * /api/features/{name}:
 *   put:
 *     summary: Toggle a feature
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature name
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enabled
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Feature toggled successfully
 */
router.put("/:name", protect, authorize("admin"), featureController.toggleFeature);

/**
 * @swagger
 * /api/features/{name}:
 *   delete:
 *     summary: Delete a feature
 *     tags: [Features]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Feature name
 *     responses:
 *       200:
 *         description: Feature deleted successfully
 */
router.delete("/:name", protect, authorize("admin"), featureController.deleteFeature);

module.exports = router;