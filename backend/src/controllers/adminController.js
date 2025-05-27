// backend/src/controllers/adminController.js
const os = require("os");
const { sequelize, User, Article, Comment, Tag, Like } = require("../models");
const { Op } = require("sequelize");
const moment = require("moment");

/**
 * Get real dashboard statistics from the database
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    // Get current date for time-based queries
    const today = moment().startOf("day");
    const weekAgo = moment().subtract(7, "days").startOf("day");
    const monthAgo = moment().subtract(30, "days").startOf("day");

    // Fetch article statistics
    const [totalArticles, publishedArticles, draftArticles, blockedArticles] =
      await Promise.all([
        Article.count(),
        Article.count({ where: { status: "published", blocked: false } }),
        Article.count({ where: { status: "draft" } }),
        Article.count({ where: { blocked: true } }),
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

    // Fetch view statistics
    const [totalViews, todayViews, weekViews, monthViews] = await Promise.all([
      // Total views
      Article.sum("view_count") || 0,

      // Today's views (would need a view tracking table for accuracy)
      // For now, we'll estimate based on recent articles
      Article.sum("view_count", {
        where: {
          updated_at: {
            [Op.gte]: today.toDate(),
          },
        },
      }) || 0,

      // This week's views (estimate)
      Article.sum("view_count", {
        where: {
          updated_at: {
            [Op.gte]: weekAgo.toDate(),
          },
        },
      }) || 0,

      // This month's views (estimate)
      Article.sum("view_count", {
        where: {
          updated_at: {
            [Op.gte]: monthAgo.toDate(),
          },
        },
      }) || 0,
    ]);

    // Calculate growth (comparing this month to last month)
    const lastMonthStart = moment().subtract(60, "days").startOf("day");
    const lastMonthEnd = moment().subtract(30, "days").endOf("day");

    const [thisMonthArticles, lastMonthArticles] = await Promise.all([
      Article.count({
        where: {
          created_at: {
            [Op.gte]: monthAgo.toDate(),
          },
        },
      }),
      Article.count({
        where: {
          created_at: {
            [Op.between]: [lastMonthStart.toDate(), lastMonthEnd.toDate()],
          },
        },
      }),
    ]);

    const growthPercentage =
      lastMonthArticles > 0
        ? Math.round(
            ((thisMonthArticles - lastMonthArticles) / lastMonthArticles) * 100
          )
        : 0;

    // Prepare response data
    const stats = {
      articles: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
        blocked: blockedArticles,
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
        total: totalViews,
        today: todayViews,
        thisWeek: weekViews,
        thisMonth: monthViews,
      },
      growth: {
        percentage: growthPercentage,
        thisMonth: thisMonthArticles,
        lastMonth: lastMonthArticles,
      },
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    next(error);
  }
};

/**
 * Get recent activity (articles, comments, users)
 * @route   GET /api/admin/activity
 * @access  Private (Admin only)
 */
exports.getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Fetch recent articles
    const recentArticles = await Article.findAll({
      limit: limit,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username", "first_name", "last_name"],
        },
      ],
      attributes: ["id", "title", "status", "created_at", "published_at"],
    });

    // Fetch recent comments
    const recentComments = await Comment.findAll({
      limit: limit,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["username"],
        },
        {
          model: Article,
          as: "article",
          attributes: ["title", "slug"],
        },
      ],
      attributes: ["id", "content", "status", "created_at"],
    });

    // Fetch recent user registrations
    const recentUsers = await User.findAll({
      limit: limit,
      order: [["created_at", "DESC"]],
      attributes: ["id", "username", "email", "role", "created_at"],
    });

    // Combine and format activities
    const activities = [];

    // Add articles to activities
    recentArticles.forEach((article) => {
      activities.push({
        id: `article-${article.id}`,
        type: "article",
        action: article.published_at ? "published" : "created",
        title: article.title,
        user: article.author
          ? `${article.author.first_name || ""} ${
              article.author.last_name || ""
            }`.trim() || article.author.username
          : "Unknown",
        timestamp: article.published_at || article.created_at,
        details: article.title,
      });
    });

    // Add comments to activities
    recentComments.forEach((comment) => {
      activities.push({
        id: `comment-${comment.id}`,
        type: "comment",
        action: comment.status,
        title: comment.article
          ? `Comment on "${comment.article.title}"`
          : "Comment",
        user: comment.author?.username || "Anonymous",
        timestamp: comment.created_at,
        details:
          comment.content.substring(0, 100) +
          (comment.content.length > 100 ? "..." : ""),
      });
    });

    // Add user registrations to activities
    recentUsers.forEach((user) => {
      activities.push({
        id: `user-${user.id}`,
        type: "user",
        action: "registered",
        title: `New ${user.role} registered`,
        user: user.username,
        timestamp: user.created_at,
        details: user.email,
      });
    });

    // Sort activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Limit to requested number
    const limitedActivities = activities.slice(0, limit);

    res.status(200).json({
      success: true,
      data: limitedActivities,
    });
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    next(error);
  }
};

/**
 * Get all users with pagination and filtering
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { search, role } = req.query;

    // Build where clause
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
      ];
    }

    if (role && role !== "all") {
      whereClause.role = role;
    }

    // Get users with article count
    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      attributes: [
        "id",
        "username",
        "email",
        "first_name",
        "last_name",
        "role",
        "is_active",
        "avatar",
        "created_at",
        "last_login",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM Articles
            WHERE Articles.user_id = User.id
          )`),
          "article_count",
        ],
      ],
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

/**
 * Update user role
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (Admin only)
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ["user", "author", "admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be one of: user, author, admin",
      });
    }

    // Prevent admin from changing their own role
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own role",
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

    res.status(200).json({
      success: true,
      data: user,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    next(error);
  }
};

/**
 * Get comments for moderation
 * @route   GET /api/admin/comments
 * @access  Private (Admin only)
 */
exports.getCommentsForModeration = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { status, search } = req.query;

    // Build where clause
    const whereClause = {};

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.content = { [Op.like]: `%${search}%` };
    }

    // Get comments with related data
    const { count, rows: comments } = await Comment.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "email", "avatar"],
        },
        {
          model: Article,
          as: "article",
          attributes: ["id", "title", "slug"],
        },
      ],
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

/**
 * Update comment status
 * @route   PUT /api/admin/comments/:id/status
 * @access  Private (Admin only)
 */
exports.updateCommentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, approved, rejected",
      });
    }

    // Find and update comment
    const comment = await Comment.findByPk(id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    comment.status = status;
    await comment.save();

    // Reload with associations
    await comment.reload({
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "username", "email", "avatar"],
        },
        {
          model: Article,
          as: "article",
          attributes: ["id", "title", "slug"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: comment,
      message: `Comment ${status}`,
    });
  } catch (error) {
    console.error("Error updating comment status:", error);
    next(error);
  }
};

/**
 * Block/unblock an article
 * @route   PUT /api/admin/articles/:id/block
 * @route   PUT /api/admin/articles/:id/unblock
 * @access  Private (Admin only)
 */
exports.toggleArticleBlock = async (req, res, next) => {
  try {
    const { id } = req.params;
    const isBlocking = req.path.includes("/block");
    const { reason } = req.body;

    // Find article
    const article = await Article.findByPk(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    if (isBlocking) {
      article.blocked = true;
      article.blocked_reason = reason || "No reason provided";
      article.blocked_by = req.user.id;
      article.blocked_at = new Date();
    } else {
      article.blocked = false;
      article.blocked_reason = null;
      article.blocked_by = null;
      article.blocked_at = null;
    }

    await article.save();

    res.status(200).json({
      success: true,
      data: article,
      message: `Article ${isBlocking ? "blocked" : "unblocked"} successfully`,
    });
  } catch (error) {
    console.error("Error toggling article block status:", error);
    next(error);
  }
};

/**
 * Get system diagnostic information
 * @route   GET /api/admin/diagnostics/system
 * @access  Private (Admin only)
 */
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
      // Spin the CPU for 100ms
      const now = Date.now();
      while (Date.now() - now < 100) {}
      const endUsage = process.cpuUsage(startUsage);
      cpuUsage = (endUsage.user + endUsage.system) / 1000000 / 0.1; // Usage over 100ms
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

/**
 * Get application logs
 * @route   GET /api/admin/diagnostics/logs
 * @access  Private (Admin only)
 */
exports.getLogs = async (req, res, next) => {
  try {
    // In a real application, you would read from your logging system
    // For now, we'll create some sample logs based on recent activity

    const recentActivity = [];

    // Get recent errors from comments
    const failedComments = await Comment.findAll({
      where: { status: "rejected" },
      limit: 5,
      order: [["created_at", "DESC"]],
      attributes: ["created_at"],
    });

    failedComments.forEach((comment) => {
      recentActivity.push({
        level: "warn",
        message: "Comment rejected by moderation",
        timestamp: comment.created_at,
      });
    });

    // Get recent logins
    const recentLogins = await User.findAll({
      where: {
        last_login: {
          [Op.gte]: moment().subtract(24, "hours").toDate(),
        },
      },
      limit: 5,
      attributes: ["username", "last_login"],
    });

    recentLogins.forEach((user) => {
      recentActivity.push({
        level: "info",
        message: `User ${user.username} logged in`,
        timestamp: user.last_login,
      });
    });

    // Sort by timestamp
    recentActivity.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.status(200).json({
      logs: recentActivity,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get API metrics
 * @route   GET /api/admin/diagnostics/metrics
 * @access  Private (Admin only)
 */
exports.getApiMetrics = async (req, res, next) => {
  try {
    // In a real application, you would track these metrics
    // For now, we'll calculate some basic metrics from the database

    const [
      articleCount,
      commentCount,
      userCount,
      recentArticles,
      recentComments,
    ] = await Promise.all([
      Article.count(),
      Comment.count(),
      User.count(),
      Article.count({
        where: {
          created_at: {
            [Op.gte]: moment().subtract(1, "hour").toDate(),
          },
        },
      }),
      Comment.count({
        where: {
          created_at: {
            [Op.gte]: moment().subtract(1, "hour").toDate(),
          },
        },
      }),
    ]);

    const metrics = {
      requestsPerMinute: Math.floor(Math.random() * 50) + 10, // Simulated
      averageResponseTime: Math.floor(Math.random() * 100) + 50, // Simulated
      errorRate: (Math.random() * 5).toFixed(2), // Simulated
      endpoints: {
        "/api/articles": {
          hits: Math.floor(Math.random() * 200) + 50,
          avgTime: Math.floor(Math.random() * 50) + 30,
        },
        "/api/auth/login": {
          hits: Math.floor(Math.random() * 100) + 20,
          avgTime: Math.floor(Math.random() * 150) + 100,
        },
        "/api/comments": {
          hits: Math.floor(Math.random() * 150) + 30,
          avgTime: Math.floor(Math.random() * 80) + 40,
        },
      },
      database: {
        totalRecords: {
          articles: articleCount,
          comments: commentCount,
          users: userCount,
        },
        recentActivity: {
          articlesLastHour: recentArticles,
          commentsLastHour: recentComments,
        },
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(metrics);
  } catch (error) {
    next(error);
  }
};

/**
 * Get database diagnostics
 * @route   GET /api/admin/diagnostics/database
 * @access  Private (Admin only)
 */
exports.getDatabaseDiagnostics = async (req, res, next) => {
  try {
    // Test database connection
    let connected = false;
    let tableStats = null;
    let errorMessage = null;

    try {
      // Check connection
      await sequelize.authenticate();
      connected = true;

      // Get actual table stats
      tableStats = {
        users: {
          count: await User.count(),
          lastCreated: await User.max("created_at"),
        },
        articles: {
          count: await Article.count(),
          published: await Article.count({ where: { status: "published" } }),
          lastCreated: await Article.max("created_at"),
        },
        comments: {
          count: await Comment.count(),
          pending: await Comment.count({ where: { status: "pending" } }),
          lastCreated: await Comment.max("created_at"),
        },
        tags: {
          count: await Tag.count(),
          lastCreated: await Tag.max("created_at"),
        },
        likes: {
          count: await Like.count(),
        },
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

/**
 * Test an endpoint directly
 * @route   POST /api/admin/diagnostics/test-endpoint
 * @access  Private (Admin only)
 */
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
