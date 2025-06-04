const { ForumCategory, ForumThread, User } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler } = require('../utils/errors');

// @desc    Get all forum categories
// @route   GET /api/forum/categories
// @access  Public (but check if forum is enabled)
exports.getCategories = asyncHandler(async (req, res) => {
  // Build query conditions
  const where = {};
  
  // Non-admin users can't see blocked categories
  if (!req.user || req.user.role !== 'admin') {
    where.is_blocked = false;
  }

  const categories = await ForumCategory.findAll({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'first_name', 'last_name', 'avatar']
      },
      {
        model: ForumThread,
        as: 'threads',
        attributes: ['id'],
        where: { is_blocked: false },
        required: false
      }
    ],
    order: [['created_at', 'DESC']]
  });

  // Add thread count to each category
  const categoriesWithCount = categories.map(cat => {
    const categoryData = cat.toJSON();
    categoryData.threadCount = categoryData.threads.length;
    delete categoryData.threads;
    return categoryData;
  });

  res.json({
    success: true,
    data: categoriesWithCount
  });
});

// @desc    Get single category with threads
// @route   GET /api/forum/categories/:slug
// @access  Public (logged in users only)
exports.getCategory = asyncHandler(async (req, res) => {
  // Only logged in users can view category details
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to view forum categories'
    });
  }

  const where = { slug: req.params.slug };
  
  // Non-admin users can't see blocked categories
  if (req.user.role !== 'admin') {
    where.is_blocked = false;
  }

  const category = await ForumCategory.findOne({
    where,
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'first_name', 'last_name', 'avatar']
      }
    ]
  });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Get threads for this category
  const threadsWhere = { category_id: category.id };
  if (req.user.role !== 'admin') {
    threadsWhere.is_blocked = false;
  }

  const threads = await ForumThread.findAll({
    where: threadsWhere,
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'first_name', 'last_name', 'avatar']
      }
    ],
    order: [
      ['is_pinned', 'DESC'],
      ['last_activity_at', 'DESC']
    ],
    limit: 20,
    offset: req.query.offset || 0
  });

  res.json({
    success: true,
    data: {
      category: category.toJSON(),
      threads
    }
  });
});

// @desc    Create a new category
// @route   POST /api/forum/categories
// @access  Author/Admin
exports.createCategory = asyncHandler(async (req, res) => {
  // Only authors and admins can create categories
  if (!req.user || (req.user.role !== 'author' && req.user.role !== 'admin')) {
    return res.status(403).json({
      success: false,
      message: 'Only authors and admins can create forum categories'
    });
  }

  const { name, description } = req.body;

  const category = await ForumCategory.create({
    name,
    description,
    user_id: req.user.id
  });

  const categoryWithCreator = await ForumCategory.findByPk(category.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'first_name', 'last_name', 'avatar']
      }
    ]
  });

  res.status(201).json({
    success: true,
    data: categoryWithCreator
  });
});

// @desc    Update a category
// @route   PUT /api/forum/categories/:id
// @access  Owner/Admin
exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await ForumCategory.findByPk(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check permissions
  if (!category.canBeEditedBy(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to edit this category'
    });
  }

  const { name, description } = req.body;

  await category.update({
    name: name || category.name,
    description: description !== undefined ? description : category.description
  });

  const updatedCategory = await ForumCategory.findByPk(category.id, {
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'first_name', 'last_name', 'avatar']
      }
    ]
  });

  res.json({
    success: true,
    data: updatedCategory
  });
});

// @desc    Delete a category
// @route   DELETE /api/forum/categories/:id
// @access  Owner/Admin
exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await ForumCategory.findByPk(req.params.id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Check permissions
  if (!category.canBeDeletedBy(req.user)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to delete this category'
    });
  }

  // Check if category has threads
  const threadCount = await ForumThread.count({
    where: { category_id: category.id }
  });

  if (threadCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete category with existing threads. Please move or delete all threads first.'
    });
  }

  await category.destroy();

  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});