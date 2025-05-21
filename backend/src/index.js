// Backend entry point
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const { errorHandler } = require("./middleware/errorHandler");
const { sequelize, connectWithRetry } = require("./config/database");

// Load environment variables
require("dotenv").config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded requests

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "BeeKeeper Blog API Server",
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

    // Error handling middleware
    app.use(errorHandler);

    // Catch-all route for 404s
    app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`,
      });
    });

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
      console.log(`API available at http://localhost:${PORT}/api`);
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
