// backend/src/routes/authorApplicationRoutes.js
const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { 
  submitApplication, 
  getMyApplication, 
  canApply,
  getAllApplications,
  getPendingCount,
  reviewApplication,
  getApplicationById
} = require('../controllers/authorApplicationController');
const { 
  validateSubmitApplication, 
  validateReviewApplication 
} = require('../validators/authorApplicationValidator');

// Routes for regular users
/**
 * @route   POST /api/author-applications
 * @desc    Submit author application
 * @access  Private (authenticated users only)
 */
router.post('/', 
  protect, 
  validateSubmitApplication, 
  submitApplication
);

/**
 * @route   GET /api/author-applications/my-application
 * @desc    Get current user's author application status
 * @access  Private (authenticated users only)
 */
router.get('/my-application', 
  protect, 
  getMyApplication
);

/**
 * @route   GET /api/author-applications/can-apply
 * @desc    Check if user can apply for author status
 * @access  Private (authenticated users only)
 */
router.get('/can-apply', 
  protect, 
  canApply
);

// Admin routes
/**
 * @route   GET /api/author-applications/admin/all
 * @desc    Get all author applications with pagination and filtering
 * @access  Private (admin only)
 */
router.get('/admin/all', 
  protect, 
  authorize('admin'), 
  getAllApplications
);

/**
 * @route   GET /api/author-applications/admin/pending-count
 * @desc    Get count of pending author applications
 * @access  Private (admin only)
 */
router.get('/admin/pending-count', 
  protect, 
  authorize('admin'), 
  getPendingCount
);

/**
 * @route   GET /api/author-applications/admin/:id
 * @desc    Get specific author application by ID
 * @access  Private (admin only)
 */
router.get('/admin/:id', 
  protect, 
  authorize('admin'), 
  getApplicationById
);

/**
 * @route   PUT /api/author-applications/admin/:id/review
 * @desc    Review author application (approve/reject)
 * @access  Private (admin only)
 */
router.put('/admin/:id/review', 
  protect, 
  authorize('admin'), 
  validateReviewApplication, 
  reviewApplication
);

module.exports = router;