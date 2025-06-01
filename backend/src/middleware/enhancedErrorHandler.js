// backend/src/middleware/enhancedErrorHandler.js
const { 
  formatErrorResponse, 
  getErrorSeverity, 
  shouldReport,
  APIError 
} = require('../utils/errors');
const { logError, logWarn, logInfo } = require('../utils/logger');

/**
 * Request correlation ID middleware
 * Adds a unique identifier to each request for tracking
 */
const addCorrelationId = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  res.setHeader('X-Correlation-ID', req.correlationId);
  next();
};

/**
 * Not Found (404) middleware
 * Handles routes that don't exist
 */
const notFoundHandler = (req, res, next) => {
  const error = new APIError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  
  next(error);
};

/**
 * Enhanced global error handler
 */
const errorHandler = (err, req, res, next) => {
  // Prevent double error handling
  if (res.headersSent) {
    return next(err);
  }

  // Format the error response
  const response = formatErrorResponse(err, req);
  const severity = getErrorSeverity(response.error);

  // Log the error based on severity
  const logData = {
    correlationId: req.correlationId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    statusCode: response.error.statusCode,
    errorCode: response.error.code,
    severity
  };

  // Server errors (5xx) - Log as error
  if (response.error.statusCode >= 500) {
    logError('Server error occurred', err, logData);
  }
  // Rate limiting (429) - Log as warning
  else if (response.error.statusCode === 429) {
    logWarn('Rate limit exceeded', logData);
  }
  // Client errors (4xx) - Log as info (except 401/403 which might be attacks)
  else if (response.error.statusCode >= 400) {
    if (response.error.statusCode === 401 || response.error.statusCode === 403) {
      logWarn('Authentication/Authorization failed', logData);
    } else {
      logInfo('Client error', logData);
    }
  }

  // Security headers for error responses
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block'
  });

  // Send the standardized error response
  res.status(response.error.statusCode).json(response);
};

/**
 * Async error handler wrapper
 * Catches async errors and passes them to error middleware
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Validation error middleware
 * Handles express-validator errors
 */
const handleValidationErrors = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const details = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value,
      location: error.location
    }));

    const apiError = new APIError(
      'Validation failed',
      400,
      'VALIDATION_ERROR',
      details
    );

    return next(apiError);
  }
  
  next();
};

/**
 * Database error transformer
 * Converts database errors to user-friendly messages
 */
const handleDatabaseErrors = (err, req, res, next) => {
  // Sequelize connection errors
  if (err.name === 'SequelizeConnectionError') {
    const apiError = new APIError(
      'Database temporarily unavailable',
      503,
      'DATABASE_UNAVAILABLE'
    );
    return next(apiError);
  }

  // Sequelize timeout errors
  if (err.name === 'SequelizeTimeoutError') {
    const apiError = new APIError(
      'Request timeout',
      408,
      'REQUEST_TIMEOUT'
    );
    return next(apiError);
  }

  // Pass through to main error handler
  next(err);
};

/**
 * Security error handler
 * Handles security-related errors with appropriate responses
 */
const handleSecurityErrors = (err, req, res, next) => {
  // Rate limiting errors
  if (err.statusCode === 429) {
    // Log potential attack
    logWarn('Potential rate limit attack detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      endpoint: req.originalUrl,
      correlationId: req.correlationId
    });
  }

  // Authentication errors - don't reveal too much info
  if (err.statusCode === 401) {
    const genericError = new APIError(
      'Authentication required',
      401,
      'AUTHENTICATION_REQUIRED'
    );
    return next(genericError);
  }

  // Authorization errors
  if (err.statusCode === 403) {
    const genericError = new APIError(
      'Insufficient permissions',
      403,
      'INSUFFICIENT_PERMISSIONS'
    );
    return next(genericError);
  }

  next(err);
};

/**
 * Development error handler
 * Provides detailed error information in development
 */
const developmentErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'development') {
    return next(err);
  }

  const response = formatErrorResponse(err, req);
  
  // Add stack trace and more details for development
  response.stack = err.stack;
  response.debug = {
    ...response.debug,
    originalError: {
      name: err.name,
      message: err.message,
      code: err.code,
      statusCode: err.statusCode
    }
  };

  res.status(response.error.statusCode).json(response);
};

/**
 * Production error handler
 * Sanitizes errors for production use
 */
const productionErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    return next(err);
  }

  const response = formatErrorResponse(err, req);
  
  // Remove any sensitive information
  delete response.debug;
  delete response.stack;
  
  // Sanitize error messages for 5xx errors
  if (response.error.statusCode >= 500) {
    response.error.message = 'Internal server error';
    delete response.error.details;
  }

  res.status(response.error.statusCode).json(response);
};

/**
 * Unhandled promise rejection handler
 */
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logError('Unhandled Promise Rejection', reason, {
      promise: promise.toString(),
      reason: reason?.message || reason
    });

    // In production, we might want to gracefully shut down
    if (process.env.NODE_ENV === 'production') {
      console.error('Unhandled Promise Rejection. Shutting down...');
      process.exit(1);
    }
  });
};

/**
 * Uncaught exception handler
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (error) => {
    logError('Uncaught Exception', error, {
      stack: error.stack
    });

    console.error('Uncaught Exception. Shutting down...');
    process.exit(1);
  });
};

/**
 * Setup all error handlers
 */
const setupErrorHandlers = (app) => {
  // Add correlation ID to all requests
  app.use(addCorrelationId);

  // Handle unhandled promise rejections and uncaught exceptions
  handleUnhandledRejection();
  handleUncaughtException();

  // 404 handler (must be after all routes)
  app.use(notFoundHandler);

  // Error handling middleware chain
  app.use(handleDatabaseErrors);
  app.use(handleSecurityErrors);
  app.use(developmentErrorHandler);
  app.use(productionErrorHandler);
  app.use(errorHandler);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  addCorrelationId,
  handleValidationErrors,
  handleDatabaseErrors,
  handleSecurityErrors,
  developmentErrorHandler,
  productionErrorHandler,
  setupErrorHandlers
};