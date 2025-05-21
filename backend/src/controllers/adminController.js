// backend/src/controllers/adminController.js
const os = require("os");
const { sequelize } = require("../models");

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
      // This is an approximation since getting exact CPU usage in Node.js
      // without additional modules is complex
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
        // Never return password
      },
      env: {
        // Only include non-sensitive environment variables
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        // Add other safe environment variables here
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
    // This is a placeholder. In a real application, you would implement
    // a way to read logs from your logging system (files, database, etc.)
    // For simplicity, we're returning mock logs

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
        message: "User john.doe logged in",
        timestamp: new Date(Date.now() - 20000).toISOString(),
      },
      {
        level: "info",
        message: 'Article created: "Introduction to Beekeeping"',
        timestamp: new Date(Date.now() - 15000).toISOString(),
      },
      {
        level: "debug",
        message: "Cache hit for article #1234",
        timestamp: new Date(Date.now() - 5000).toISOString(),
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
    // This is a placeholder. In a real application, you would implement
    // a way to collect and return API metrics (requests per minute, etc.)
    // For simplicity, we're returning mock metrics

    const mockMetrics = {
      requestsPerMinute: 42,
      averageResponseTime: 120, // ms
      errorRate: 0.02, // 2%
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
    // Test database connection
    let connected = false;
    let tableStats = null;
    let errorMessage = null;

    try {
      // Check connection
      await sequelize.authenticate();
      connected = true;

      // Get table stats (simplified example)
      // In a real application, you would get actual stats from the database
      tableStats = {
        users: { count: await sequelize.models.User.count() },
        articles: { count: await sequelize.models.Article.count() },
        comments: { count: await sequelize.models.Comment.count() },
        tags: { count: await sequelize.models.Tag.count() },
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

    // We're using axios in the frontend, so we don't need this endpoint
    // Just returning mock success to demonstrate
    res.status(200).json({
      success: true,
      message: "Endpoint testing should be done from the frontend",
      request: { url, method, headers },
    });
  } catch (error) {
    next(error);
  }
};
