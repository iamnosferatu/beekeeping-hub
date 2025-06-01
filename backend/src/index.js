// Load environment variables first
require("dotenv").config();

// Validate environment variables
const { validateEnvironment } = require("./config/validateEnv");
validateEnvironment();

// Backend entry point
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const { setupErrorHandlers } = require("./middleware/enhancedErrorHandler");
const { sanitizeInput } = require("./middleware/sanitizer");
const { sequelize, connectWithRetry } = require("./config/database");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource sharing for images
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "http://localhost:3000", "http://localhost:8080"],
    },
  },
})); // Security headers
// Configure CORS properly
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' })); // Parse JSON requests with increased limit
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Parse URL-encoded requests with increased limit
app.use(sanitizeInput); // Sanitize all inputs to prevent XSS

// Serve static files from uploads directory with caching
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  maxAge: '7d', // Cache images for 7 days
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif')) {
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    }
  }
}));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BeeKeeper's Blog API Server",
    apiEndpoint: "/api",
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Swagger API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Beekeeping Hub API Documentation"
}));

// Debug route for backend
app.use("/debug", (req, res) => {
  res.json({
    environment: process.env.NODE_ENV,
    database: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      connected: sequelize
        .authenticate()
        .then(() => true)
        .catch(() => false),
    },
    headers: req.headers,
    server: {
      time: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
    },
  });
});

// Static debug UI in development
if (process.env.NODE_ENV === "development") {
  app.use("/debug-ui", express.static(path.join(__dirname, "public/debug")));
}

// Start server
const startServer = async () => {
  try {
    // Database connection with retry
    await connectWithRetry();
    console.log("Database connection established.");

    // Import routes after DB connection is established
    const routes = require("./routes");

    // Mount API routes
    app.use("/api", routes);

    // Setup enhanced error handling (includes 404 handler)
    setupErrorHandlers(app);

    // Sync models with database - only in development and only if DB_SYNC is true
    if (process.env.NODE_ENV === "development") {
      if (process.env.DB_SYNC === "true") {
        await sequelize.sync({ alter: true });
        console.log("Database models synchronized.");
      }
    }

    // Start server
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
      );
      const apiUrl = process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api` : `http://localhost:${PORT}/api`;
      console.log(`API available at ${apiUrl}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
});

module.exports = app; // Export for testing
