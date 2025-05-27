// backend/src/routes/adminRoutes.js
const express = require("express");
const { protect, authorize } = require("../middleware/auth");
const diagnosticsRoutes = require("./adminDiagnosticsRoutes");
const adminArticleRoutes = require("./adminArticleRoutes");

const router = express.Router();

// Apply middleware to all admin routes
router.use(protect);
router.use(authorize("admin"));

// Mount diagnostics routes
router.use("/diagnostics", diagnosticsRoutes);

// Mount article management routes (for blocking/unblocking)
router.use("/", adminArticleRoutes);

// Define controller functions
const adminController = {
  getDashboardStats: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          articles: {
            total: 15,
            published: 10,
            draft: 3,
            archived: 2,
          },
          comments: {
            total: 25,
            approved: 18,
            pending: 5,
            rejected: 2,
          },
          users: {
            total: 45,
            admin: 1,
            author: 3,
            user: 41,
          },
          tags: {
            total: 8,
          },
          views: {
            total: 1250,
            today: 135,
            thisWeek: 650,
            thisMonth: 1250,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getUsers: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            username: "admin",
            email: "admin@example.com",
            role: "admin",
            is_active: true,
          },
          {
            id: 2,
            username: "author",
            email: "author@example.com",
            role: "author",
            is_active: true,
          },
          {
            id: 3,
            username: "user",
            email: "user@example.com",
            role: "user",
            is_active: true,
          },
        ],
        count: 3,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  updateUserRole: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          id: req.params.id,
          username: "user",
          email: "user@example.com",
          role: req.body.role,
          is_active: true,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getCommentsForModeration: async (req, res, next) => {
    try {
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            content: "Comment content",
            status: "pending",
            user: { id: 3, username: "user" },
            article: { id: 1, title: "Article Title" },
          },
        ],
        count: 1,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

// Admin dashboard routes
router.get("/dashboard", adminController.getDashboardStats);
router.get("/users", adminController.getUsers);
router.put("/users/:id/role", adminController.updateUserRole);
router.get("/comments", adminController.getCommentsForModeration);

module.exports = router;
