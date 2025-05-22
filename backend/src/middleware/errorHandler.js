// backend/src/middleware/errorHandler.js - ENHANCED ERROR HANDLING
const {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
} = require("sequelize");
const { logger } = require("../utils/logger");
const { ApiResponse } = require("../utils/responseHelpers");

/**
 * Custom error classes for better error handling
 */
class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationErrorApp extends AppError {
  constructor(message = "Validation failed", errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Access forbidden") {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
  }
}

/**
 * Enhanced error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log the error
  logger.errorWithStack(err, req);

  // Sequelize Validation Error
  if (err instanceof ValidationError) {
    const errors = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value,
    }));

    return ApiResponse.validationError(res, errors, "Validation failed");
  }

  // Sequelize Unique Constraint Error
  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path || "field";
    const message = `${field} already exists`;

    return ApiResponse.conflict(res, message);
  }

  // Sequelize Foreign Key Constraint Error
  if (err instanceof ForeignKeyConstraintError) {
    const message = "Referenced resource does not exist";
    return ApiResponse.badRequest(res, message);
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return ApiResponse.unauthorized(res, "Invalid authentication token");
  }

  if (err.name === "TokenExpiredError") {
    return ApiResponse.unauthorized(res, "Authentication token has expired");
  }

  // Custom App Errors
  if (err instanceof AppError) {
    if (err instanceof ValidationErrorApp) {
      return ApiResponse.validationError(res, err.errors, err.message);
    }
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // MongoDB/Mongoose-like ObjectId errors (if you ever switch to MongoDB)
  if (err.name === "CastError") {
    return ApiResponse.badRequest(res, "Invalid resource ID format");
  }

  // File upload errors (if using multer)
  if (err.code === "LIMIT_FILE_SIZE") {
    return ApiResponse.badRequest(res, "File size too large");
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return ApiResponse.badRequest(res, "Too many files uploaded");
  }

  // Rate limiting errors
  if (err.statusCode === 429) {
    return ApiResponse.rateLimit(
      res,
      "Too many requests, please try again later"
    );
  }

  // Default to 500 server error
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  // Don't leak error details in production unless it's an operational error
  const shouldShowDetails =
    process.env.NODE_ENV === "development" || err.isOperational;

  return ApiResponse.error(
    res,
    message,
    statusCode,
    shouldShowDetails
      ? {
          stack: err.stack,
          details: err.details,
        }
      : undefined
  );
};

/**
 * Async error handler wrapper
 * Wraps async route handlers to catch and pass errors to error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 handler for unmatched routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(
    `Route not found: ${req.method} ${req.originalUrl}`
  );
  next(error);
};

/**
 * Global uncaught exception handler
 */
const uncaughtExceptionHandler = () => {
  process.on("uncaughtException", (err) => {
    logger.error("Uncaught Exception! Shutting down...", null, {
      error: err.message,
      stack: err.stack,
    });

    process.exit(1);
  });
};

/**
 * Global unhandled rejection handler
 */
const unhandledRejectionHandler = () => {
  process.on("unhandledRejection", (err) => {
    logger.error("Unhandled Rejection! Shutting down...", null, {
      error: err.message,
      stack: err.stack,
    });

    process.exit(1);
  });
};

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (server) => {
  const shutdown = (signal) => {
    logger.info(`Received ${signal}. Graceful shutdown starting...`);

    server.close((err) => {
      if (err) {
        logger.error("Error during server close", null, { error: err.message });
        process.exit(1);
      }

      logger.info("Server closed successfully");
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      logger.error(
        "Could not close connections in time, forcefully shutting down"
      );
      process.exit(1);
    }, 30000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  uncaughtExceptionHandler,
  unhandledRejectionHandler,
  gracefulShutdown,
  // Custom error classes
  AppError,
  ValidationErrorApp,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
};
