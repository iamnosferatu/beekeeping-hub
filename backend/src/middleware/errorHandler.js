// backend/src/middleware/errorHandler.js
const { ValidationError } = require("sequelize");

// Global error handler middleware
exports.errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err.stack);

  // Sequelize validation error
  if (err instanceof ValidationError) {
    const messages = err.errors.map((e) => e.message);
    error.message = messages.join(", ");

    return res.status(400).json({
      success: false,
      message: error.message,
      errors: err.errors,
    });
  }

  // JWT Error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // JWT Expired
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error response
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};
