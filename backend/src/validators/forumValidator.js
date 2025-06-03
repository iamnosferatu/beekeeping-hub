const { body, validationResult } = require('express-validator');

// Validation rules for forum categories
const validateForumCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 3, max: 100 }).withMessage('Category name must be between 3 and 100 characters')
    .matches(/^[a-zA-Z0-9\s\-&]+$/).withMessage('Category name can only contain letters, numbers, spaces, hyphens, and ampersands'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for forum threads
const validateForumThread = [
  body('title')
    .trim()
    .notEmpty().withMessage('Thread title is required')
    .isLength({ min: 5, max: 255 }).withMessage('Thread title must be between 5 and 255 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Thread content is required')
    .isLength({ min: 10 }).withMessage('Thread content must be at least 10 characters long')
    .isLength({ max: 10000 }).withMessage('Thread content must not exceed 10000 characters'),
  
  body('categoryId')
    .notEmpty().withMessage('Category is required')
    .isInt({ min: 1 }).withMessage('Invalid category ID'),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for updating forum threads
const validateForumThreadUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 255 }).withMessage('Thread title must be between 5 and 255 characters'),
  
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 }).withMessage('Thread content must be at least 10 characters long')
    .isLength({ max: 10000 }).withMessage('Thread content must not exceed 10000 characters'),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for forum comments
const validateForumComment = [
  body('content')
    .trim()
    .notEmpty().withMessage('Comment content is required')
    .isLength({ min: 1 }).withMessage('Comment content must be at least 1 character long')
    .isLength({ max: 5000 }).withMessage('Comment content must not exceed 5000 characters'),
  
  body('threadId')
    .notEmpty().withMessage('Thread ID is required')
    .isInt({ min: 1 }).withMessage('Invalid thread ID'),
  
  body('parentCommentId')
    .optional()
    .isInt({ min: 1 }).withMessage('Invalid parent comment ID'),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for updating forum comments
const validateForumCommentUpdate = [
  body('content')
    .trim()
    .notEmpty().withMessage('Comment content is required')
    .isLength({ min: 1 }).withMessage('Comment content must be at least 1 character long')
    .isLength({ max: 5000 }).withMessage('Comment content must not exceed 5000 characters'),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for moving threads
const validateThreadMove = [
  body('categoryId')
    .notEmpty().withMessage('Target category is required')
    .isInt({ min: 1 }).withMessage('Invalid category ID'),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for blocking content
const validateBlock = [
  body('block')
    .notEmpty().withMessage('Block status is required')
    .isBoolean().withMessage('Block must be a boolean value'),
  
  body('reason')
    .if(body('block').equals('true'))
    .trim()
    .notEmpty().withMessage('Reason is required when blocking content')
    .isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

// Validation rules for user bans
const validateUserBan = [
  body('ban')
    .notEmpty().withMessage('Ban status is required')
    .isBoolean().withMessage('Ban must be a boolean value'),
  
  body('reason')
    .if(body('ban').equals('true'))
    .trim()
    .notEmpty().withMessage('Reason is required when banning a user')
    .isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
  
  body('expiresAt')
    .optional()
    .isISO8601().withMessage('Invalid expiration date format'),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateForumCategory,
  validateForumThread,
  validateForumThreadUpdate,
  validateForumComment,
  validateForumCommentUpdate,
  validateThreadMove,
  validateBlock,
  validateUserBan
};