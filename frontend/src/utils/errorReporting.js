// frontend/src/utils/errorReporting.js

/**
 * Error Reporting Utilities
 * 
 * Centralized error reporting and logging functionality
 * for consistent error handling across the application.
 */

/**
 * Report error to external monitoring service
 */
export const reportError = (error, context = {}) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    buildVersion: process.env.REACT_APP_VERSION || 'unknown',
  };

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Error Reporter');
    console.error('Error:', error);
    console.error('Context:', context);
    console.error('Full Data:', errorData);
    console.groupEnd();
  }

  // Store locally for debugging
  storeErrorLocally(errorData);

  // Send to monitoring service in production
  if (process.env.NODE_ENV === 'production') {
    sendToMonitoringService(errorData);
  }

  return errorData;
};

/**
 * Store error in localStorage for debugging
 */
const storeErrorLocally = (errorData) => {
  try {
    const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
    errors.push(errorData);
    
    // Keep only last 20 errors
    const recentErrors = errors.slice(-20);
    localStorage.setItem('app_errors', JSON.stringify(recentErrors));
  } catch (e) {
    // localStorage might be full or unavailable
  }
};

/**
 * Send error to external monitoring service
 */
const sendToMonitoringService = async (errorData) => {
  try {
    // Example integration with error monitoring service
    // Replace with your actual service (Sentry, LogRocket, etc.)
    
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify(errorData),
    // });

    // For now, just log that we would send it
    console.info('Error would be sent to monitoring service:', errorData.message);
  } catch (e) {
    // Silently fail - don't cause more errors
  }
};

/**
 * Get stored errors for debugging
 */
export const getStoredErrors = () => {
  try {
    return JSON.parse(localStorage.getItem('app_errors') || '[]');
  } catch (e) {
    return [];
  }
};

/**
 * Clear stored errors
 */
export const clearStoredErrors = () => {
  try {
    localStorage.removeItem('app_errors');
  } catch (e) {
    // Silently fail
  }
};

/**
 * Get error summary for analytics
 */
export const getErrorSummary = () => {
  const errors = getStoredErrors();
  
  const summary = {
    total: errors.length,
    byType: {},
    byComponent: {},
    recent: errors.slice(-5).map(e => ({
      message: e.message,
      timestamp: e.timestamp,
      component: e.context?.component || 'Unknown',
    })),
  };

  // Group by error type
  errors.forEach(error => {
    const type = error.type || 'unknown';
    summary.byType[type] = (summary.byType[type] || 0) + 1;
  });

  // Group by component
  errors.forEach(error => {
    const component = error.context?.component || error.component || 'Unknown';
    summary.byComponent[component] = (summary.byComponent[component] || 0) + 1;
  });

  return summary;
};

/**
 * Create error reporting function for specific context
 */
export const createErrorReporter = (context) => {
  return (error, additionalContext = {}) => {
    return reportError(error, { ...context, ...additionalContext });
  };
};

export default {
  reportError,
  getStoredErrors,
  clearStoredErrors,
  getErrorSummary,
  createErrorReporter,
};