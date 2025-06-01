// backend/src/utils/logger.js
const winston = require('winston');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'beekeeper-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Sanitize function to remove sensitive data from logs
const sanitizeLogData = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'jwt', 'secret', 'authorization', 'cookie'];
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  }
  
  return sanitized;
};

// Enhanced logging methods
const logInfo = (message, meta = {}) => {
  logger.info(message, sanitizeLogData(meta));
};

const logError = (message, error = null, meta = {}) => {
  const errorData = error ? {
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code
    }
  } : {};
  
  logger.error(message, { ...sanitizeLogData(meta), ...errorData });
};

const logWarn = (message, meta = {}) => {
  logger.warn(message, sanitizeLogData(meta));
};

const logDebug = (message, meta = {}) => {
  logger.debug(message, sanitizeLogData(meta));
};

module.exports = {
  logger,
  logInfo,
  logError,
  logWarn,
  logDebug,
  sanitizeLogData
};