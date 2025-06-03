const { 
  ForumCategory, 
  ForumThread, 
  ForumComment, 
  User, 
  UserForumBan,
  SiteSettings,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');
const { asyncHandler } = require('../utils/errors');

// @desc    Block/unblock a category
// @route   PUT /api/admin/forum/categories/:id/block
// @access  Admin only
exports.toggleCategoryBlock = asyncHandler(async (req, res) => {
  const { block, reason } = req.body;
  const category = await ForumCategory.findByPk(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  if (block) {
    await category.update({
      is_blocked: true,
      blocked_at: new Date(),
      blocked_by: req.user.id,
      blocked_reason: reason
    });
  } else {
    await category.update({
      is_blocked: false,
      blocked_at: null,
      blocked_by: null,
      blocked_reason: null
    });
  }

  res.json({
    success: true,
    message: `Category ${block ? 'blocked' : 'unblocked'} successfully`,
    data: category
  });
});

// @desc    Block/unblock a thread
// @route   PUT /api/admin/forum/threads/:id/block
// @access  Admin only
exports.toggleThreadBlock = asyncHandler(async (req, res) => {
  const { block, reason } = req.body;
  const thread = await ForumThread.findByPk(req.params.id);

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: 'Thread not found'
    });
  }

  if (block) {
    await thread.update({
      is_blocked: true,
      blocked_at: new Date(),
      blocked_by: req.user.id,
      blocked_reason: reason
    });
  } else {
    await thread.update({
      is_blocked: false,
      blocked_at: null,
      blocked_by: null,
      blocked_reason: null
    });
  }

  res.json({
    success: true,
    message: `Thread ${block ? 'blocked' : 'unblocked'} successfully`,
    data: thread
  });
});

// @desc    Block/unblock a comment
// @route   PUT /api/admin/forum/comments/:id/block
// @access  Admin only
exports.toggleCommentBlock = asyncHandler(async (req, res) => {
  const { block, reason } = req.body;
  const comment = await ForumComment.findByPk(req.params.id);

  if (!comment) {
    return res.status(404).json({
      success: false,
      message: 'Comment not found'
    });
  }

  if (block) {
    await comment.update({
      is_blocked: true,
      blocked_at: new Date(),
      blocked_by: req.user.id,
      blocked_reason: reason
    });
  } else {
    await comment.update({
      is_blocked: false,
      blocked_at: null,
      blocked_by: null,
      blocked_reason: null
    });
  }

  res.json({
    success: true,
    message: `Comment ${block ? 'blocked' : 'unblocked'} successfully`,
    data: comment
  });
});

// @desc    Lock/unlock a thread
// @route   PUT /api/admin/forum/threads/:id/lock
// @access  Admin only
exports.toggleThreadLock = asyncHandler(async (req, res) => {
  const { lock } = req.body;
  const thread = await ForumThread.findByPk(req.params.id);

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: 'Thread not found'
    });
  }

  await thread.update({ is_locked: lock });

  res.json({
    success: true,
    message: `Thread ${lock ? 'locked' : 'unlocked'} successfully`,
    data: thread
  });
});

// @desc    Pin/unpin a thread
// @route   PUT /api/admin/forum/threads/:id/pin
// @access  Admin only
exports.toggleThreadPin = asyncHandler(async (req, res) => {
  const { pin } = req.body;
  const thread = await ForumThread.findByPk(req.params.id);

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: 'Thread not found'
    });
  }

  await thread.update({ is_pinned: pin });

  res.json({
    success: true,
    message: `Thread ${pin ? 'pinned' : 'unpinned'} successfully`,
    data: thread
  });
});

// @desc    Move thread to different category
// @route   PUT /api/admin/forum/threads/:id/move
// @access  Admin only
exports.moveThread = asyncHandler(async (req, res) => {
  const { categoryId } = req.body;
  const thread = await ForumThread.findByPk(req.params.id);

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: 'Thread not found'
    });
  }

  // Verify target category exists
  const category = await ForumCategory.findByPk(categoryId);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Target category not found'
    });
  }

  await thread.update({ category_id: categoryId });

  const updatedThread = await ForumThread.findByPk(thread.id, {
    include: [
      {
        model: ForumCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }
    ]
  });

  res.json({
    success: true,
    message: 'Thread moved successfully',
    data: updatedThread
  });
});

// @desc    Ban/unban user from forum
// @route   POST /api/admin/forum/users/:userId/ban
// @access  Admin only
exports.toggleUserBan = asyncHandler(async (req, res) => {
  const { ban, reason, expiresAt } = req.body;
  const userId = req.params.userId;

  // Check if user exists
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  if (ban) {
    // Check if already banned
    const existingBan = await UserForumBan.findOne({
      where: { userId }
    });

    if (existingBan) {
      // Update existing ban
      await existingBan.update({
        bannedBy: req.user.id,
        reason,
        expiresAt,
        bannedAt: new Date()
      });
    } else {
      // Create new ban
      await UserForumBan.create({
        userId,
        bannedBy: req.user.id,
        reason,
        expiresAt
      });
    }

    res.json({
      success: true,
      message: 'User banned from forum successfully'
    });
  } else {
    // Remove ban
    await UserForumBan.destroy({
      where: { userId }
    });

    res.json({
      success: true,
      message: 'User unbanned from forum successfully'
    });
  }
});

// @desc    Get forum statistics
// @route   GET /api/admin/forum/stats
// @access  Admin only
exports.getForumStats = asyncHandler(async (req, res) => {
    const [
      categoriesCount,
      threadsCount,
      commentsCount,
      blockedCategoriesCount,
      blockedThreadsCount,
      blockedCommentsCount,
      bannedUsersCount
    ] = await Promise.all([
      ForumCategory.count(),
      ForumThread.count(),
      ForumComment.count(),
      ForumCategory.count({ where: { is_blocked: true } }),
      ForumThread.count({ where: { is_blocked: true } }),
      ForumComment.count({ where: { is_blocked: true } }),
      UserForumBan.count()
    ]);

    // Get recent activity
    const recentThreads = await ForumThread.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: ForumCategory,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    const recentComments = await ForumComment.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: ForumThread,
          as: 'thread',
          attributes: ['id', 'title', 'slug']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        stats: {
          categories: {
            total: categoriesCount || 0,
            blocked: blockedCategoriesCount || 0
          },
          threads: {
            total: threadsCount || 0,
            blocked: blockedThreadsCount || 0
          },
          comments: {
            total: commentsCount || 0,
            blocked: blockedCommentsCount || 0
          },
          bannedUsers: bannedUsersCount || 0
        },
        recentActivity: {
          threads: recentThreads || [],
          comments: recentComments || []
        }
      }
    });
});

// @desc    Get all blocked content
// @route   GET /api/admin/forum/blocked
// @access  Admin only
exports.getBlockedContent = asyncHandler(async (req, res) => {
  const [categories, threads, comments] = await Promise.all([
    ForumCategory.findAll({
      where: { is_blocked: true },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'blocker',
          attributes: ['id', 'username']
        }
      ]
    }),
    ForumThread.findAll({
      where: { is_blocked: true },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'blocker',
          attributes: ['id', 'username']
        },
        {
          model: ForumCategory,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    }),
    ForumComment.findAll({
      where: { is_blocked: true },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username']
        },
        {
          model: User,
          as: 'blocker',
          attributes: ['id', 'username']
        },
        {
          model: ForumThread,
          as: 'thread',
          attributes: ['id', 'title']
        }
      ]
    })
  ]);

  res.json({
    success: true,
    data: {
      categories,
      threads,
      comments
    }
  });
});

// @desc    Get all banned users
// @route   GET /api/admin/forum/banned-users
// @access  Admin only
exports.getBannedUsers = asyncHandler(async (req, res) => {
  const bannedUsers = await UserForumBan.findAll({
    include: [
      {
        model: User,
        as: 'bannedUser',
        attributes: ['id', 'username', 'email', 'role']
      },
      {
        model: User,
        as: 'bannedByUser',
        attributes: ['id', 'username']
      }
    ],
    order: [['banned_at', 'DESC']]
  });

  res.json({
    success: true,
    data: bannedUsers
  });
});