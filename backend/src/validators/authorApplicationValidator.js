// backend/src/validators/authorApplicationValidator.js
const { body } = require('express-validator');

/**
 * Validation rules for submitting author applications
 */
const validateSubmitApplication = [
  body('application_text')
    .trim()
    .notEmpty()
    .withMessage('Application text is required')
    .isLength({ min: 50, max: 2000 })
    .withMessage('Application text must be between 50 and 2000 characters')
    .escape(),

  body('writing_experience')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Writing experience must be less than 1000 characters')
    .escape(),

  body('beekeeping_experience')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Beekeeping experience must be less than 1000 characters')
    .escape(),

  body('topics_of_interest')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Topics of interest must be less than 500 characters')
    .escape()
];

/**
 * Validation rules for reviewing applications (admin)
 */
const validateReviewApplication = [
  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['approve', 'reject'])
    .withMessage('Action must be either "approve" or "reject"'),

  body('admin_notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Admin notes must be less than 1000 characters')
    .escape()
];

module.exports = {
  validateSubmitApplication,
  validateReviewApplication
};