const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  toggleCategoryBlock,
  toggleThreadBlock,
  toggleCommentBlock,
  toggleThreadLock,
  toggleThreadPin,
  moveThread,
  toggleUserBan,
  getForumStats,
  getBlockedContent,
  getBannedUsers
} = require('../controllers/adminForumController');

// All routes require admin authentication
router.use(protect, authorize('admin'));

/**
 * @swagger
 * /admin/forum/stats:
 *   get:
 *     summary: Get forum statistics
 *     tags: [Forum Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Forum statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         categories:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             blocked:
 *                               type: integer
 *                         threads:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             blocked:
 *                               type: integer
 *                         comments:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                             blocked:
 *                               type: integer
 *                         bannedUsers:
 *                           type: integer
 *                     recentActivity:
 *                       type: object
 *                       properties:
 *                         threads:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ForumThread'
 *                         comments:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ForumComment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /admin/forum/blocked:
 *   get:
 *     summary: Get all blocked content
 *     tags: [Forum Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Blocked content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ForumCategory'
 *                     threads:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ForumThread'
 *                     comments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ForumComment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /admin/forum/banned-users:
 *   get:
 *     summary: Get all banned users
 *     tags: [Forum Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banned users list
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
 *                     $ref: '#/components/schemas/UserForumBan'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */

/**
 * @swagger
 * /admin/forum/categories/{id}/block:
 *   put:
 *     summary: Block or unblock a category
 *     tags: [Forum Admin]
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
 *             required:
 *               - block
 *             properties:
 *               block:
 *                 type: boolean
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category block status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ForumCategory'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /admin/forum/threads/{id}/block:
 *   put:
 *     summary: Block or unblock a thread
 *     tags: [Forum Admin]
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
 *             required:
 *               - block
 *             properties:
 *               block:
 *                 type: boolean
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Thread block status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ForumThread'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /admin/forum/comments/{id}/block:
 *   put:
 *     summary: Block or unblock a comment
 *     tags: [Forum Admin]
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
 *               - block
 *             properties:
 *               block:
 *                 type: boolean
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment block status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ForumComment'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// Block/unblock content
router.put('/categories/:id/block', toggleCategoryBlock);
router.put('/threads/:id/block', toggleThreadBlock);
router.put('/comments/:id/block', toggleCommentBlock);

/**
 * @swagger
 * /admin/forum/threads/{id}/lock:
 *   put:
 *     summary: Lock or unlock a thread
 *     tags: [Forum Admin]
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
 *             required:
 *               - lock
 *             properties:
 *               lock:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Thread lock status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ForumThread'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /admin/forum/threads/{id}/pin:
 *   put:
 *     summary: Pin or unpin a thread
 *     tags: [Forum Admin]
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
 *             required:
 *               - pin
 *             properties:
 *               pin:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Thread pin status updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ForumThread'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

/**
 * @swagger
 * /admin/forum/threads/{id}/move:
 *   put:
 *     summary: Move thread to a different category
 *     tags: [Forum Admin]
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
 *             required:
 *               - categoryId
 *             properties:
 *               categoryId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Thread moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ForumThread'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */

// Thread management
router.put('/threads/:id/lock', toggleThreadLock);
router.put('/threads/:id/pin', toggleThreadPin);
router.put('/threads/:id/move', moveThread);

/**
 * @swagger
 * /admin/forum/users/{userId}/ban:
 *   post:
 *     summary: Ban or unban a user from the forum
 *     tags: [Forum Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ban
 *             properties:
 *               ban:
 *                 type: boolean
 *               reason:
 *                 type: string
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *     responses:
 *       200:
 *         description: User ban status updated
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

// User bans
router.post('/users/:userId/ban', toggleUserBan);
router.get('/banned-users', getBannedUsers);

// Forum statistics and monitoring
router.get('/stats', getForumStats);
router.get('/blocked', getBlockedContent);

module.exports = router;