// backend/src/controllers/adminController.js - REAL DATABASE STATS VERSION
const os = require("os");
const { sequelize, User, Article, Comment, Tag } = require("../models");
const { Op } = require("sequelize");

// @desc    Get system diagnostic information
// @route   GET /api/admin/diagnostics/system
// @access  Private (Admin only)
exports.getSystemDiagnostics = async (req, res, next) => {
  try {
    // Database connection check
    let dbConnected = false;
    try {
      await sequelize.authenticate();
      dbConnected = true;
    } catch (error) {
      console.error("Database connection error:", error);
    }

    // Get CPU usage
    let cpuUsage = null;
    try {
      const startUsage = process.cpuUsage();
      const now = Date.now();
      while (Date.now() - now < 100) {}
      const endUsage = process.cpuUsage(startUsage);
      cpuUsage = (endUsage.user + endUsage.system) / 1000000 / 0.1;
    } catch (error) {
      console.error("Error getting CPU usage:", error);
    }

    // Collect system information
    const systemInfo = {
      serverTime: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpuUsage,
      database: {
        connected: dbConnected,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
      },
      os: {
        platform: os.platform(),
        release: os.release(),
        type: os.type(),
        arch: os.arch(),
        uptime: os.uptime(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpus: os.cpus().length,
      },
    };

    res.status(200).json(systemInfo);
  } catch (error) {
    next(error);
  }
};

// @desc    Get application logs
// @route   GET /api/admin/diagnostics/logs
// @access  Private (Admin only)
exports.getLogs = async (req, res, next) => {
  try {
    // Mock logs for demo - in production, you'd read from actual log files
    const mockLogs = [
      {
        level: "info",
        message: "Server started",
        timestamp: new Date(Date.now() - 100000).toISOString(),
      },
      {
        level: "info",
        message: "Database connected",
        timestamp: new Date(Date.now() - 95000).toISOString(),
      },
      {
        level: "warn",
        message: "High memory usage detected",
        timestamp: new Date(Date.now() - 60000).toISOString(),
      },
      {
        level: "error",
        message: "Failed login attempt",
        timestamp: new Date(Date.now() - 30000).toISOString(),
      },
      {
        level: "info",
        message: "User logged in",
        timestamp: new Date(Date.now() - 20000).toISOString(),
      },
    ];

    res.status(200).json({
      logs: mockLogs,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get API metrics
// @route   GET /api/admin/diagnostics/metrics
// @access  Private (Admin only)
exports.getApiMetrics = async (req, res, next) => {
  try {
    // Mock metrics - in production, you'd collect real metrics
    const mockMetrics = {
      requestsPerMinute: 42,
      averageResponseTime: 120,
      errorRate: 0.02,
      endpoints: {
        "/api/articles": { hits: 156, avgTime: 85 },
        "/api/auth/login": { hits: 78, avgTime: 210 },
        "/api/comments": { hits: 112, avgTime: 95 },
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(mockMetrics);
  } catch (error) {
    next(error);
  }
};

// @desc    Get database diagnostics
// @route   GET /api/admin/diagnostics/database
// @access  Private (Admin only)
exports.getDatabaseDiagnostics = async (req, res, next) => {
  try {
    let connected = false;
    let tableStats = null;
    let errorMessage = null;

    try {
      await sequelize.authenticate();
      connected = true;

      // Get actual table stats from database
      tableStats = {
        users: { count: await User.count() },
        articles: { count: await Article.count() },
        comments: { count: await Comment.count() },
        tags: { count: await Tag.count() },
      };
    } catch (error) {
      errorMessage = error.message;
    }

    res.status(200).json({
      connected,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      error: errorMessage,
      tableStats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Test an endpoint directly
// @route   POST /api/admin/diagnostics/test-endpoint
// @access  Private (Admin only)
exports.testEndpoint = async (req, res, next) => {
  try {
    const { url, method, headers, body } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    res.status(200).json({
      success: true,
      message: "Endpoint testing should be done from the frontend",
      request: { url, method, headers },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics from real database
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    console.log("Fetching real dashboard statistics from database...");

    // Get current date boundaries for time-based stats
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch article statistics
    const [totalArticles, publishedArticles, draftArticles, archivedArticles] =
      await Promise.all([
        Article.count(),
        Article.count({ where: { status: "published" } }),
        Article.count({ where: { status: "draft" } }),
        Article.count({ where: { status: "archived" } }),
      ]);

    // Fetch comment statistics
    const [totalComments, approvedComments, pendingComments, rejectedComments] =
      await Promise.all([
        Comment.count(),
        Comment.count({ where: { status: "approved" } }),
        Comment.count({ where: { status: "pending" } }),
        Comment.count({ where: { status: "rejected" } }),
      ]);

    // Fetch user statistics
    const [totalUsers, adminUsers, authorUsers, regularUsers] =
      await Promise.all([
        User.count(),
        User.count({ where: { role: "admin" } }),
        User.count({ where: { role: "author" } }),
        User.count({ where: { role: "user" } }),
      ]);

    // Fetch tag count
    const totalTags = await Tag.count();

    // Fetch view statistics from articles
    const viewStats = await Article.findAll({
      attributes: [
        [sequelize.fn("SUM", sequelize.col("view_count")), "total_views"],
      ],
      raw: true,
    });

    // Get view stats by time period (this is simplified - in production you'd track views with timestamps)
    const totalViews = viewStats[0]?.total_views || 0;

    // For demo purposes, we'll calculate rough estimates for time-based views
    // In production, you'd have a separate views tracking table with timestamps
    const todayViews = Math.floor(totalViews * 0.1); // Rough estimate
    const weekViews = Math.floor(totalViews * 0.3); // Rough estimate
    const monthViews = Math.floor(totalViews * 0.8); // Rough estimate

    // Compile statistics
    const stats = {
      articles: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
        archived: archivedArticles,
      },
      comments: {
        total: totalComments,
        approved: approvedComments,
        pending: pendingComments,
        rejected: rejectedComments,
      },
      users: {
        total: totalUsers,
        admin: adminUsers,
        author: authorUsers,
        user: regularUsers,
      },
      tags: {
        total: totalTags,
      },
      views: {
        total: parseInt(totalViews) || 0,
        today: todayViews,
        thisWeek: weekViews,
        thisMonth: monthViews,
      },
    };

    console.log("Dashboard stats compiled:", stats);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    next(error);
  }
};

// @desc    Get users for admin management
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get users with pagination
    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ["password"] },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: users,
      count,
      pagination: {
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ["user", "author", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role specified",
      });
    }

    // Find and update user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.role = role;
    await user.save();

    // Return updated user without password
    const updatedUser = user.toJSON();
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    next(error);
  }
};

// @desc    Get comments for moderation
// @route   GET /api/admin/comments
// @access  Private (Admin only)
exports.getCommentsForModeration = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const status = req.query.status || "all";

    // Build where clause
    let whereClause = {};
    if (status !== "all") {
      whereClause.status = status;
    }

    // Get comments with user and article info
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "first_name", "last_name"],
        },
        {
          model: Article,
          as: "article",
          attributes: ["id", "title", "slug"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      data: comments,
      count,
      pagination: {
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching comments for moderation:", error);
    next(error);
  }
};
