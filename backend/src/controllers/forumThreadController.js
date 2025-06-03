const { ForumThread, ForumCategory, ForumComment, User, UserForumBan, SiteSettings } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler } = require('../utils/errors');

// Check if user is banned from forum
const checkForumBan = async (userId) => {
  return await UserForumBan.isUserBanned(userId);
};

// @desc    Get threads for a category
// @route   GET /api/forum/threads?category=:categoryId
// @access  Private (logged in users)
exports.getThreads = asyncHandler(async (req, res) => {
  // Check if forum is enabled
  const settings = await SiteSettings.findOne();
  if (!settings?.forum_enabled) {
    return res.status(403).json({
      success: false,
      message: 'Forum feature is currently disabled'
    });
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to view forum threads'
    });
  }

  const { category, page = 1, limit = 20, sort = 'default' } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (category) {
    where.category_id = category;
  }

  // Non-admin users can't see blocked threads
  if (req.user.role !== 'admin') {
    where.is_blocked = false;
  }

  // Determine order based on sort parameter
  let order;
  if (sort === 'recent') {
    // For recent threads sidebar, just show by last activity
    order = [['last_activity_at', 'DESC']];
  } else {
    // Default ordering: pinned first, then by last activity
    order = [
      ['is_pinned', 'DESC'],
      ['last_activity_at', 'DESC']
    ];
  }

  const { count, rows: threads } = await ForumThread.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar']
      },
      {
        model: ForumCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      },
      {
        model: ForumComment,
        as: 'comments',
        attributes: ['id']
      }
    ],
    order,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  // Add comment count to each thread
  const threadsWithCount = threads.map(thread => {
    const threadData = thread.toJSON();
    threadData.commentCount = threadData.comments.length;
    delete threadData.comments;
    return threadData;
  });

  res.json({
    success: true,
    data: threadsWithCount,
    pagination: {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    }
  });
});

// @desc    Get single thread with comments
// @route   GET /api/forum/threads/:slug
// @access  Private (logged in users)
exports.getThread = asyncHandler(async (req, res) => {
  // Check if forum is enabled
  const settings = await SiteSettings.findOne();
  if (!settings?.forum_enabled) {
    return res.status(403).json({
      success: false,
      message: 'Forum feature is currently disabled'
    });
  }

  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to view forum threads'
    });
  }

  const where = { slug: req.params.slug };
  
  // Non-admin users can't see blocked threads
  if (req.user.role !== 'admin') {
    where.is_blocked = false;
  }

  const thread = await ForumThread.findOne({
    where,
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar', 'bio']
      },
      {
        model: ForumCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }
    ]
  });

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: 'Thread not found'
    });
  }

  // Increment view count
  await thread.incrementViewCount();

  // Get comments separately for better control
  const commentsWhere = { thread_id: thread.id };
  if (req.user.role !== 'admin') {
    commentsWhere.is_blocked = false;
  }

  const comments = await ForumComment.findAll({
    where: commentsWhere,
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar']
      },
      {
        model: ForumComment,
        as: 'parentComment',
        attributes: ['id', 'content'],
        include: [
          {
            model: User,
            as: 'author',
            attributes: ['id', 'username']
          }
        ]
      }
    ],
    order: [['created_at', 'ASC']]
  });

  res.json({
    success: true,
    data: {
      thread: thread.toJSON(),
      comments
    }
  });
});

// @desc    Create a new thread
// @route   POST /api/forum/threads
// @access  Author/Admin
exports.createThread = asyncHandler(async (req, res) => {
  // Check if forum is enabled
  const settings = await SiteSettings.findOne();
  if (!settings?.forum_enabled) {
    return res.status(403).json({
      success: false,
      message: 'Forum feature is currently disabled'
    });
  }

  // Check if user is banned
  if (await checkForumBan(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'You are banned from participating in the forum'
    });
  }

  // Only authors and admins can create threads
  if (req.user.role !== 'author' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only authors and admins can create forum threads'
    });
  }

  const { title, content, categoryId } = req.body;

  // Verify category exists and is not blocked
  const category = await ForumCategory.findByPk(categoryId);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  if (category.is_blocked && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Cannot create thread in a blocked category'
    });
  }

  const thread = await ForumThread.create({
    title,
    content,
    category_id: categoryId,
    user_id: req.user.id
  });

  const threadWithDetails = await ForumThread.findByPk(thread.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar']
      },
      {
        model: ForumCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: threadWithDetails
  });
});

// @desc    Update a thread
// @route   PUT /api/forum/threads/:id
// @access  Owner/Admin
exports.updateThread = asyncHandler(async (req, res) => {
  // Check if forum is enabled
  const settings = await SiteSettings.findOne();
  if (!settings?.forum_enabled) {
    return res.status(403).json({
      success: false,
      message: 'Forum feature is currently disabled'
    });
  }

  // Check if user is banned
  if (await checkForumBan(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: 'You are banned from participating in the forum'
    });
  }

  const thread = await ForumThread.findByPk(req.params.id);

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: 'Thread not found'
    });
  }

  // Check permissions
  if (!thread.canBeEditedBy(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to edit this thread'
    });
  }

  const { title, content } = req.body;

  await thread.update({
    title: title || thread.title,
    content: content || thread.content
  });

  const updatedThread = await ForumThread.findByPk(thread.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'avatar']
      },
      {
        model: ForumCategory,
        as: 'category',
        attributes: ['id', 'name', 'slug']
      }
    ]
  });

  res.json({
    success: true,
    data: updatedThread
  });
});

// @desc    Delete a thread
// @route   DELETE /api/forum/threads/:id
// @access  Owner/Admin
exports.deleteThread = asyncHandler(async (req, res) => {
  // Check if forum is enabled
  const settings = await SiteSettings.findOne();
  if (!settings?.forum_enabled) {
    return res.status(403).json({
      success: false,
      message: 'Forum feature is currently disabled'
    });
  }

  const thread = await ForumThread.findByPk(req.params.id);

  if (!thread) {
    return res.status(404).json({
      success: false,
      message: 'Thread not found'
    });
  }

  // Check permissions
  if (!thread.canBeDeletedBy(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this thread'
    });
  }

  await thread.destroy();

  res.json({
    success: true,
    message: 'Thread deleted successfully'
  });
});