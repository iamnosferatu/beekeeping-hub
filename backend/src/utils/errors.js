// backend/src/utils/errors.js
const { logError } = require('./logger');

/**
 * Base API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, errorCode = null, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      error: {
        type: this.name,
        message: this.message,
        code: this.errorCode,
        statusCode: this.statusCode,
        details: this.details
      }
    };
  }
}

/**
 * Validation Error - 400
 */
class ValidationError extends APIError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Authentication Error - 401
 */
class AuthenticationError extends APIError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization Error - 403
 */
class AuthorizationError extends APIError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not Found Error - 404
 */
class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
  }
}

/**
 * Conflict Error - 409
 */
class ConflictError extends APIError {
  constructor(message) {
    super(message, 409, 'CONFLICT_ERROR');
  }
}

/**
 * Rate Limit Error - 429
 */
class RateLimitError extends APIError {
  constructor(message = 'Too many requests', retryAfter = null) {
    super(message, 429, 'RATE_LIMIT_ERROR', { retryAfter });
  }
}

/**
 * File Upload Error - 400
 */
class FileUploadError extends APIError {
  constructor(message, details = null) {
    super(message, 400, 'FILE_UPLOAD_ERROR', details);
  }
}

/**
 * Database Error - 500
 */
class DatabaseError extends APIError {
  constructor(message = 'Database operation failed') {
    super(message, 500, 'DATABASE_ERROR');
  }
}

/**
 * External Service Error - 502
 */
class ExternalServiceError extends APIError {
  constructor(service, message = 'External service unavailable') {
    super(message, 502, 'EXTERNAL_SERVICE_ERROR', { service });
  }
}

/**
 * Configuration Error - 500
 */
class ConfigurationError extends APIError {
  constructor(message) {
    super(message, 500, 'CONFIGURATION_ERROR');
  }
}

/**
 * Transform various error types to APIError
 */
const transformError = (error) => {
  // Already an APIError
  if (error instanceof APIError) {
    return error;
  }

  // Sequelize Validation Error
  if (error.name === 'SequelizeValidationError') {
    const details = error.errors.map(err => ({
      field: err.path,
      message: err.message,
      value: err.value
    }));
    return new ValidationError('Validation failed', details);
  }

  // Sequelize Unique Constraint Error
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors?.[0]?.path || 'field';
    return new ConflictError(`${field} already exists`);
  }

  // Sequelize Foreign Key Constraint Error
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    return new ValidationError('Referenced resource does not exist');
  }

  // Sequelize Database Connection Error
  if (error.name === 'SequelizeConnectionError') {
    return new DatabaseError('Database connection failed');
  }

  // JWT Errors
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }

  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }

  // Multer Errors
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new FileUploadError('File too large');
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return new FileUploadError('Too many files');
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new FileUploadError('Unexpected file field');
  }

  // Joi Validation Errors
  if (error.name === 'ValidationError' && error.details) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    return new ValidationError('Input validation failed', details);
  }

  // MongoDB/Mongoose Errors
  if (error.name === 'CastError') {
    return new ValidationError(`Invalid ${error.path}: ${error.value}`);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return new ConflictError(`${field} already exists`);
  }

  // Default: Unknown error
  return new APIError(
    process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    500,
    'INTERNAL_ERROR'
  );
};

/**
 * Error response formatter
 */
const formatErrorResponse = (error, req) => {
  const apiError = transformError(error);
  
  // Base response
  const response = {
    success: false,
    error: {
      message: apiError.message,
      code: apiError.errorCode,
      statusCode: apiError.statusCode
    }
  };

  // Add details if available
  if (apiError.details) {
    response.error.details = apiError.details;
  }

  // Add request info for debugging (development only)
  if (process.env.NODE_ENV === 'development') {
    response.debug = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
  }

  // Add correlation ID if available
  if (req.correlationId) {
    response.correlationId = req.correlationId;
  }

  return response;
};

/**
 * Async error handler wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Error severity levels
 */
const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Get error severity based on status code and type
 */
const getErrorSeverity = (error) => {
  if (error.statusCode >= 500) {
    return ERROR_SEVERITY.CRITICAL;
  }
  
  if (error.statusCode === 429) {
    return ERROR_SEVERITY.HIGH;
  }
  
  if (error.statusCode >= 400 && error.statusCode < 500) {
    return ERROR_SEVERITY.MEDIUM;
  }
  
  return ERROR_SEVERITY.LOW;
};

/**
 * Check if error should be reported to monitoring
 */
const shouldReport = (error) => {
  // Don't report client errors (4xx) except rate limiting
  if (error.statusCode >= 400 && error.statusCode < 500 && error.statusCode !== 429) {
    return false;
  }
  
  // Report all server errors (5xx)
  if (error.statusCode >= 500) {
    return true;
  }
  
  // Report rate limiting errors
  if (error.statusCode === 429) {
    return true;
  }
  
  return false;
};

module.exports = {
  // Error classes
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  FileUploadError,
  DatabaseError,
  ExternalServiceError,
  ConfigurationError,
  
  // Utility functions
  transformError,
  formatErrorResponse,
  asyncHandler,
  getErrorSeverity,
  shouldReport,
  
  // Constants
  ERROR_SEVERITY
};