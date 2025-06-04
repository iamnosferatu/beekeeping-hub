const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Feature } = require('../models');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/forumCategoryController');
const {
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread
} = require('../controllers/forumThreadController');
const {
  createComment,
  updateComment,
  deleteComment
} = require('../controllers/forumCommentController');

// Middleware to check if forum feature is enabled
const checkForumEnabled = async (req, res, next) => {
  try {
    const isEnabled = await Feature.getFeatureStatus('forum');
    if (!isEnabled) {
      return res.status(403).json({
        success: false,
        message: 'Forum feature is currently disabled'
      });
    }
    next();
  } catch (error) {
    console.error('Error checking forum feature status:', error);
    next(error);
  }
};

// Apply forum check to all routes
router.use(checkForumEnabled);

// Validation middleware
const { 
  validateForumCategory, 
  validateForumThread, 
  validateForumThreadUpdate, 
  validateForumComment,
  validateForumCommentUpdate 
} = require('../validators/forumValidator');

/**
 * @swagger
 * /forum/categories:
 *   get:
 *     summary: Get all forum categories
 *     tags: [Forum]
 *     security: []
 *     responses:
 *       200:
 *         description: List of forum categories
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
 *                     $ref: '#/components/schemas/ForumCategory'
 *   post:
 *     summary: Create a new forum category
 *     tags: [Forum]
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
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ForumCategory'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

// Category routes
router.route('/categories')
  .get(getCategories) // Public route to view category list
  .post(protect, authorize('author', 'admin'), validateForumCategory, createCategory);

/**
 * @swagger
 * /forum/categories/{slug}:
 *   get:
 *     summary: Get a specific forum category with threads
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Category slug
 *     responses:
 *       200:
 *         description: Forum category details with threads
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/ForumCategory'
 *                     - type: object
 *                       properties:
 *                         threads:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ForumThread'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route('/categories/:slug')
  .get(protect, getCategory); // Only logged in users can view category details

/**
 * @swagger
 * /forum/categories/{id}:
 *   put:
 *     summary: Update a forum category
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ForumCategory'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete a forum category
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route('/categories/:id')
  .put(protect, authorize('author', 'admin'), validateForumCategory, updateCategory)
  .delete(protect, authorize('author', 'admin'), deleteCategory);

/**
 * @swagger
 * /forum/threads:
 *   get:
 *     summary: Get all forum threads
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of threads
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
 *                     $ref: '#/components/schemas/ForumThread'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     summary: Create a new thread
 *     tags: [Forum]
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
 *               - categoryId
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 255
 *               content:
 *                 type: string
 *                 minLength: 10
 *               categoryId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Thread created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ForumThread'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Thread routes
router.route('/threads')
  .get(protect, getThreads) // Only logged in users can view threads
  .post(protect, authorize('author', 'admin'), validateForumThread, createThread);

/**
 * @swagger
 * /forum/threads/{slug}:
 *   get:
 *     summary: Get a specific thread with comments
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Thread slug
 *     responses:
 *       200:
 *         description: Thread details with comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/ForumThread'
 *                     - type: object
 *                       properties:
 *                         comments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ForumComment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route('/threads/:slug')
  .get(protect, getThread); // Only logged in users can view thread details

/**
 * @swagger
 * /forum/threads/{id}:
 *   put:
 *     summary: Update a thread
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Thread ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 255
 *               content:
 *                 type: string
 *                 minLength: 10
 *     responses:
 *       200:
 *         description: Thread updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ForumThread'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete a thread
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Thread ID
 *     responses:
 *       200:
 *         description: Thread deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route('/threads/:id')
  .put(protect, authorize('author', 'admin'), validateForumThreadUpdate, updateThread)
  .delete(protect, authorize('author', 'admin'), deleteThread);

/**
 * @swagger
 * /forum/comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - threadId
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *               threadId:
 *                 type: integer
 *               parentCommentId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ForumComment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
// Comment routes
router.route('/comments')
  .post(protect, authorize('author', 'admin'), validateForumComment, createComment);

/**
 * @swagger
 * /forum/comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ForumComment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete a comment
 *     tags: [Forum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.route('/comments/:id')
  .put(protect, authorize('author', 'admin'), validateForumCommentUpdate, updateComment)
  .delete(protect, authorize('author', 'admin'), deleteComment);

module.exports = router;