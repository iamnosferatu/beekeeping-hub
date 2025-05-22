// backend/src/utils/logger.js - STRUCTURED LOGGING
const winston = require("winston");
const path = require("path");

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

// Tell winston about the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define different log formats for different environments
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }

    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format:
      process.env.NODE_ENV === "development"
        ? developmentFormat
        : productionFormat,
  }),

  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "error.log"),
    level: "error",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),

  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), "logs", "combined.log"),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

// Only add file transports in production or if LOG_TO_FILE is true
if (
  process.env.NODE_ENV === "production" ||
  process.env.LOG_TO_FILE === "true"
) {
  // Ensure logs directory exists
  const fs = require("fs");
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

// Create the logger
const logger = winston.createLogger({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "development" ? "debug" : "info"),
  levels,
  format:
    process.env.NODE_ENV === "development"
      ? developmentFormat
      : productionFormat,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), "logs", "rejections.log"),
    }),
  ],
});

// Enhanced logger with request context
class EnhancedLogger {
  constructor(baseLogger) {
    this.logger = baseLogger;
  }

  // Helper to add request context
  addRequestContext(message, req = null, extra = {}) {
    const context = {
      ...extra,
    };

    if (req) {
      context.requestId = req.id || req.headers["x-request-id"];
      context.method = req.method;
      context.url = req.url;
      context.userAgent = req.get("User-Agent");
      context.ip = req.ip || req.connection.remoteAddress;

      if (req.user) {
        context.userId = req.user.id;
        context.userRole = req.user.role;
      }
    }

    return { message, ...context };
  }

  // Logging methods
  error(message, req = null, extra = {}) {
    this.logger.error(this.addRequestContext(message, req, extra));
  }

  warn(message, req = null, extra = {}) {
    this.logger.warn(this.addRequestContext(message, req, extra));
  }

  info(message, req = null, extra = {}) {
    this.logger.info(this.addRequestContext(message, req, extra));
  }

  http(message, req = null, extra = {}) {
    this.logger.http(this.addRequestContext(message, req, extra));
  }

  debug(message, req = null, extra = {}) {
    this.logger.debug(this.addRequestContext(message, req, extra));
  }

  // Specific logging methods for common scenarios
  loginAttempt(email, success, req = null) {
    const level = success ? "info" : "warn";
    const message = `Login attempt for ${email}: ${
      success ? "SUCCESS" : "FAILED"
    }`;
    this.logger[level](
      this.addRequestContext(message, req, { email, success })
    );
  }

  apiCall(req, res, duration) {
    const message = `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`;
    const level = res.statusCode >= 400 ? "warn" : "http";
    this.logger[level](
      this.addRequestContext(message, req, {
        statusCode: res.statusCode,
        duration,
      })
    );
  }

  databaseQuery(query, duration, req = null) {
    this.debug(`Database query executed in ${duration}ms`, req, {
      query,
      duration,
    });
  }

  securityEvent(event, details, req = null) {
    this.warn(`Security event: ${event}`, req, { event, details });
  }

  errorWithStack(error, req = null) {
    this.error(error.message, req, {
      stack: error.stack,
      name: error.name,
    });
  }
}

// Create enhanced logger instance
const enhancedLogger = new EnhancedLogger(logger);

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Generate request ID if not present
  if (!req.id && !req.headers["x-request-id"]) {
    req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Log request start
  enhancedLogger.http(`${req.method} ${req.url} - Request started`, req);

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    enhancedLogger.apiCall(req, res, duration);
    originalEnd.apply(this, args);
  };

  next();
};

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  enhancedLogger.errorWithStack(err, req);
  next(err);
};

module.exports = {
  logger: enhancedLogger,
  requestLogger,
  errorLogger,
};
