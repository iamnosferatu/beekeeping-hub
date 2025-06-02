// backend/src/controllers/authorApplicationController.js
const { AuthorApplication, User } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

/**
 * Submit a new author application
 * POST /api/author-applications
 */
const submitApplication = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const userId = req.user.id;
    const {
      application_text,
      writing_experience,
      beekeeping_experience,
      topics_of_interest
    } = req.body;

    // Check if user already has a pending application
    const existingPendingApplication = await AuthorApplication.findOne({
      where: {
        user_id: userId,
        status: 'pending'
      }
    });

    if (existingPendingApplication) {
      return res.status(409).json({
        success: false,
        error: {
          message: 'You already have a pending author application. Please wait for review.',
          code: 'APPLICATION_PENDING'
        }
      });
    }

    // Check if user is already an author or admin
    if (req.user.role === 'author' || req.user.role === 'admin') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'You are already an author or admin.',
          code: 'ALREADY_AUTHOR'
        }
      });
    }

    // Create the application
    const application = await AuthorApplication.create({
      user_id: userId,
      application_text,
      writing_experience: writing_experience || null,
      beekeeping_experience: beekeeping_experience || null,
      topics_of_interest: topics_of_interest || null,
      status: 'pending'
    });

    // Fetch the created application with user details
    const createdApplication = await AuthorApplication.findByPk(application.id, {
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'first_name', 'last_name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdApplication,
      message: 'Author application submitted successfully. You will be notified when your application is reviewed.'
    });

  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to submit author application',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }
    });
  }
};

/**
 * Get current user's author application status
 * GET /api/author-applications/my-application
 */
const getMyApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    const application = await AuthorApplication.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'No author application found',
          code: 'NO_APPLICATION'
        }
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Get my application error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch application status'
      }
    });
  }
};

/**
 * Check if user can apply for author status
 * GET /api/author-applications/can-apply
 */
const canApply = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is already an author or admin
    if (req.user.role === 'author' || req.user.role === 'admin') {
      return res.json({
        success: true,
        data: {
          canApply: false,
          reason: 'already_author',
          message: 'You are already an author or admin.'
        }
      });
    }

    // Check if user has a pending application
    const pendingApplication = await AuthorApplication.findOne({
      where: {
        user_id: userId,
        status: 'pending'
      }
    });

    if (pendingApplication) {
      return res.json({
        success: true,
        data: {
          canApply: false,
          reason: 'pending_application',
          message: 'You have a pending author application.',
          applicationDate: pendingApplication.createdAt
        }
      });
    }

    res.json({
      success: true,
      data: {
        canApply: true,
        message: 'You can apply for author status.'
      }
    });

  } catch (error) {
    console.error('Can apply check error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check application eligibility'
      }
    });
  }
};

/**
 * Get all author applications (Admin only)
 * GET /api/admin/author-applications
 */
const getAllApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      whereClause.status = status;
    }

    const { count, rows: applications } = await AuthorApplication.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'role']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'username', 'first_name', 'last_name'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch author applications'
      }
    });
  }
};

/**
 * Get pending author applications count (Admin only)
 * GET /api/admin/author-applications/pending-count
 */
const getPendingCount = async (req, res) => {
  try {
    const count = await AuthorApplication.count({
      where: { status: 'pending' }
    });

    res.json({
      success: true,
      data: { pendingCount: count }
    });

  } catch (error) {
    console.error('Get pending count error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch pending applications count'
      }
    });
  }
};

/**
 * Review author application (Admin only)
 * PUT /api/admin/author-applications/:id/review
 */
const reviewApplication = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          details: errors.array()
        }
      });
    }

    const { id } = req.params;
    const { action, admin_notes } = req.body; // action: 'approve' or 'reject'
    const adminUserId = req.user.id;

    // Find the application
    const application = await AuthorApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'role']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Author application not found'
        }
      });
    }

    // Check if application is still pending
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          message: `Application has already been ${application.status}`
        }
      });
    }

    // Perform the review action
    if (action === 'approve') {
      // Approve the application
      await application.approve(adminUserId, admin_notes);

      // Update user role to author
      await User.update(
        { role: 'author' },
        { where: { id: application.user_id } }
      );

      res.json({
        success: true,
        data: application,
        message: `Author application approved. ${application.applicant.username} is now an author.`
      });

    } else if (action === 'reject') {
      // Reject the application
      await application.reject(adminUserId, admin_notes);

      res.json({
        success: true,
        data: application,
        message: 'Author application rejected.'
      });

    } else {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid action. Use "approve" or "reject".'
        }
      });
    }

  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to review author application'
      }
    });
  }
};

/**
 * Get application by ID (Admin only)
 * GET /api/admin/author-applications/:id
 */
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await AuthorApplication.findByPk(id, {
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'created_at']
        },
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'username', 'first_name', 'last_name'],
          required: false // Make reviewer optional for pending applications
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Author application not found'
        }
      });
    }

    res.json({
      success: true,
      data: application
    });

  } catch (error) {
    console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to fetch author application'
      }
    });
  }
};

module.exports = {
  submitApplication,
  getMyApplication,
  canApply,
  getAllApplications,
  getPendingCount,
  reviewApplication,
  getApplicationById
};