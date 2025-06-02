// frontend/src/utils/errorReporting.js

import { isCategoryAllowed, COOKIE_CATEGORIES } from './cookieConsent';

/**
 * Enhanced Error Reporting Utilities
 * 
 * Comprehensive error reporting and logging functionality
 * with retry mechanisms, classification, and monitoring.
 * Similar to backend error handling patterns.
 * 
 * Respects user cookie consent for analytics and performance tracking.
 */

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Error types for classification
 */
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  CLIENT: 'client',
  UNKNOWN: 'unknown'
};

/**
 * Classify error based on its properties
 */
export const classifyError = (error) => {
  if (error.type) return error.type;
  
  if (error.code === 'NETWORK_ERROR' || !error.response) {
    return ERROR_TYPES.NETWORK;
  }
  
  const status = error.response?.status || error.status;
  switch (status) {
    case 400:
    case 422:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTHENTICATION;
    case 403:
      return ERROR_TYPES.AUTHORIZATION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
};

/**
 * Determine error severity
 */
export const getErrorSeverity = (error) => {
  const type = classifyError(error);
  const status = error.response?.status || error.status;
  
  switch (type) {
    case ERROR_TYPES.AUTHENTICATION:
    case ERROR_TYPES.SERVER:
      return ERROR_SEVERITY.HIGH;
    case ERROR_TYPES.AUTHORIZATION:
    case ERROR_TYPES.NETWORK:
      return ERROR_SEVERITY.MEDIUM;
    case ERROR_TYPES.VALIDATION:
    case ERROR_TYPES.NOT_FOUND:
      return ERROR_SEVERITY.LOW;
    default:
      return status >= 500 ? ERROR_SEVERITY.HIGH : ERROR_SEVERITY.MEDIUM;
  }
};

/**
 * Enhanced error reporting with classification and severity
 */
export const reportError = (error, context = {}) => {
  const errorType = classifyError(error);
  const severity = getErrorSeverity(error);
  
  // Check cookie consent for analytics data collection
  const canCollectAnalytics = isCategoryAllowed(COOKIE_CATEGORIES.ANALYTICS);
  const canCollectPerformance = isCategoryAllowed(COOKIE_CATEGORIES.PERFORMANCE);
  
  const errorData = {
    id: generateErrorId(),
    message: error.message || 'Unknown error',
    stack: error.stack,
    type: errorType,
    severity,
    status: error.response?.status || error.status,
    context: {
      ...context,
      component: context.component || 'Unknown',
      action: context.action || 'Unknown',
      userId: canCollectAnalytics ? context.userId : null, // Only include userId if analytics allowed
    },
    metadata: {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      // Only collect detailed metadata if performance cookies are allowed
      userAgent: canCollectPerformance ? navigator.userAgent : null,
      buildVersion: process.env.REACT_APP_VERSION || 'unknown',
      sessionId: canCollectPerformance ? getSessionId() : null,
      viewport: canCollectPerformance ? {
        width: window.innerWidth,
        height: window.innerHeight,
      } : null,
    },
    apiData: error.response?.data || null,
  };

  // Enhanced logging in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = getSeverityEmoji(severity);
    console.group(`${emoji} Error Reporter [${severity.toUpperCase()}]`);
    console.error('Error:', error);
    console.error('Type:', errorType);
    console.error('Severity:', severity);
    console.error('Context:', context);
    console.error('Full Data:', errorData);
    console.error('Cookie Consent - Analytics:', canCollectAnalytics, 'Performance:', canCollectPerformance);
    console.groupEnd();
  }

  // Always store critical errors locally for debugging, regardless of consent
  if (severity === ERROR_SEVERITY.CRITICAL || severity === ERROR_SEVERITY.HIGH) {
    storeErrorLocally(errorData);
  } else if (canCollectAnalytics) {
    // Only store non-critical errors if analytics consent is given
    storeErrorLocally(errorData);
  }

  // Send to monitoring service in production only with consent
  if (process.env.NODE_ENV === 'production' && canCollectAnalytics) {
    sendToMonitoringService(errorData);
  }

  // Trigger error handlers based on severity
  if (severity === ERROR_SEVERITY.CRITICAL) {
    handleCriticalError(errorData);
  }
  
  return errorData;
};

/**
 * Generate unique error ID
 */
const generateErrorId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

/**
 * Get or create session ID
 */
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('error_session_id');
  if (!sessionId) {
    sessionId = generateErrorId();
    sessionStorage.setItem('error_session_id', sessionId);
  }
  return sessionId;
};

/**
 * Get emoji for severity level
 */
const getSeverityEmoji = (severity) => {
  switch (severity) {
    case ERROR_SEVERITY.LOW: return '🟡';
    case ERROR_SEVERITY.MEDIUM: return '🟠';
    case ERROR_SEVERITY.HIGH: return '🔴';
    case ERROR_SEVERITY.CRITICAL: return '💀';
    default: return '🚨';
  }
};

/**
 * Handle critical errors
 */
const handleCriticalError = (errorData) => {
  // Store critical error flag
  sessionStorage.setItem('critical_error_occurred', 'true');
  
  // Could trigger emergency actions like:
  // - Save user data
  // - Clear corrupted cache
  // - Redirect to safe page
};

/**
 * Enhanced error storage with rotation and compression
 */
const storeErrorLocally = (errorData) => {
  try {
    const key = 'app_errors';
    const maxErrors = 50;
    const criticalKey = 'critical_errors';
    
    // Store all errors
    const errors = JSON.parse(localStorage.getItem(key) || '[]');
    errors.push(errorData);
    
    // Keep only recent errors
    const recentErrors = errors.slice(-maxErrors);
    localStorage.setItem(key, JSON.stringify(recentErrors));
    
    // Store critical errors separately
    if (errorData.severity === ERROR_SEVERITY.CRITICAL || errorData.severity === ERROR_SEVERITY.HIGH) {
      const criticalErrors = JSON.parse(localStorage.getItem(criticalKey) || '[]');
      criticalErrors.push(errorData);
      const recentCritical = criticalErrors.slice(-20);
      localStorage.setItem(criticalKey, JSON.stringify(recentCritical));
    }
    
    // Store error summary for quick access
    updateErrorSummary(errorData);
  } catch (e) {
    // localStorage might be full - try to clear old data
    try {
      localStorage.removeItem('app_errors');
      localStorage.setItem('app_errors', JSON.stringify([errorData]));
    } catch (e2) {
      // Still failing - localStorage might be disabled
      console.warn('Unable to store error data locally');
    }
  }
};

/**
 * Update error summary statistics
 */
const updateErrorSummary = (errorData) => {
  try {
    const summary = JSON.parse(localStorage.getItem('error_summary') || '{}');
    const today = new Date().toISOString().split('T')[0];
    
    if (!summary[today]) {
      summary[today] = {
        total: 0,
        byType: {},
        bySeverity: {},
        byComponent: {},
      };
    }
    
    const dayStats = summary[today];
    dayStats.total++;
    dayStats.byType[errorData.type] = (dayStats.byType[errorData.type] || 0) + 1;
    dayStats.bySeverity[errorData.severity] = (dayStats.bySeverity[errorData.severity] || 0) + 1;
    dayStats.byComponent[errorData.context.component] = (dayStats.byComponent[errorData.context.component] || 0) + 1;
    
    // Keep only last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = sevenDaysAgo.toISOString().split('T')[0];
    
    Object.keys(summary).forEach(date => {
      if (date < cutoff) {
        delete summary[date];
      }
    });
    
    localStorage.setItem('error_summary', JSON.stringify(summary));
  } catch (e) {
    // Silently fail
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
 * Get comprehensive error analytics
 */
export const getErrorAnalytics = () => {
  const errors = getStoredErrors();
  const criticalErrors = getCriticalErrors();
  const summary = JSON.parse(localStorage.getItem('error_summary') || '{}');
  
  const analytics = {
    overview: {
      total: errors.length,
      critical: criticalErrors.length,
      lastError: errors[errors.length - 1]?.metadata?.timestamp,
      errorRate: calculateErrorRate(errors),
    },
    breakdown: {
      byType: {},
      bySeverity: {},
      byComponent: {},
      byStatus: {},
    },
    trends: {
      daily: summary,
      recent: errors.slice(-10).map(e => ({
        id: e.id,
        message: e.message,
        type: e.type,
        severity: e.severity,
        component: e.context?.component,
        timestamp: e.metadata?.timestamp,
      })),
    },
    patterns: detectErrorPatterns(errors),
  };

  // Calculate breakdowns
  errors.forEach(error => {
    const type = error.type || 'unknown';
    const severity = error.severity || 'unknown';
    const component = error.context?.component || 'Unknown';
    const status = error.status || 'unknown';
    
    analytics.breakdown.byType[type] = (analytics.breakdown.byType[type] || 0) + 1;
    analytics.breakdown.bySeverity[severity] = (analytics.breakdown.bySeverity[severity] || 0) + 1;
    analytics.breakdown.byComponent[component] = (analytics.breakdown.byComponent[component] || 0) + 1;
    analytics.breakdown.byStatus[status] = (analytics.breakdown.byStatus[status] || 0) + 1;
  });

  return analytics;
};

/**
 * Calculate error rate (errors per hour)
 */
const calculateErrorRate = (errors) => {
  if (errors.length === 0) return 0;
  
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const recentErrors = errors.filter(error => {
    const errorTime = new Date(error.metadata?.timestamp);
    return errorTime > oneHourAgo;
  });
  
  return recentErrors.length;
};

/**
 * Detect error patterns and anomalies
 */
const detectErrorPatterns = (errors) => {
  const patterns = {
    repeatingErrors: {},
    componentHotspots: {},
    timePatterns: {},
    cascadingErrors: [],
  };
  
  // Find repeating errors
  errors.forEach(error => {
    const key = `${error.type}:${error.context?.component}:${error.message}`;
    patterns.repeatingErrors[key] = (patterns.repeatingErrors[key] || 0) + 1;
  });
  
  // Find component hotspots (components with many errors)
  errors.forEach(error => {
    const component = error.context?.component || 'Unknown';
    patterns.componentHotspots[component] = (patterns.componentHotspots[component] || 0) + 1;
  });
  
  // Detect cascading errors (multiple errors in short timespan)
  for (let i = 0; i < errors.length - 1; i++) {
    const current = errors[i];
    const next = errors[i + 1];
    
    const currentTime = new Date(current.metadata?.timestamp);
    const nextTime = new Date(next.metadata?.timestamp);
    
    if (nextTime - currentTime < 5000) { // Within 5 seconds
      patterns.cascadingErrors.push({
        first: current.id,
        second: next.id,
        timeDiff: nextTime - currentTime,
      });
    }
  }
  
  return patterns;
};

/**
 * Get critical errors
 */
export const getCriticalErrors = () => {
  try {
    return JSON.parse(localStorage.getItem('critical_errors') || '[]');
  } catch (e) {
    return [];
  }
};

/**
 * Legacy method for backward compatibility
 */
export const getErrorSummary = () => {
  const analytics = getErrorAnalytics();
  return {
    total: analytics.overview.total,
    byType: analytics.breakdown.byType,
    byComponent: analytics.breakdown.byComponent,
    recent: analytics.trends.recent.slice(0, 5),
  };
};

/**
 * Create error reporting function for specific context
 */
export const createErrorReporter = (context) => {
  return (error, additionalContext = {}) => {
    return reportError(error, { ...context, ...additionalContext });
  };
};

/**
 * Check if error should be retried
 */
export const shouldRetryError = (error, retryCount = 0) => {
  const maxRetries = 3;
  const retryableTypes = [ERROR_TYPES.NETWORK, ERROR_TYPES.SERVER];
  const retryableStatuses = [500, 502, 503, 504, 408, 429];
  
  if (retryCount >= maxRetries) return false;
  
  const errorType = classifyError(error);
  const status = error.response?.status || error.status;
  
  return retryableTypes.includes(errorType) || retryableStatuses.includes(status);
};

/**
 * Calculate retry delay with exponential backoff
 */
export const getRetryDelay = (retryCount, baseDelay = 1000) => {
  return Math.min(baseDelay * Math.pow(2, retryCount), 10000); // Max 10 seconds
};

/**
 * Enhanced error reporter with context validation
 */
export const withErrorReporting = (component) => {
  return createErrorReporter({
    component: component.name || component.constructor?.name || 'Anonymous',
    module: 'frontend',
  });
};

/**
 * Clear all error data
 */
export const clearAllErrors = () => {
  try {
    localStorage.removeItem('app_errors');
    localStorage.removeItem('critical_errors');
    localStorage.removeItem('error_summary');
    sessionStorage.removeItem('error_session_id');
    sessionStorage.removeItem('critical_error_occurred');
  } catch (e) {
    // Silently fail
  }
};

/**
 * Check if app is in error recovery mode
 */
export const isInErrorRecoveryMode = () => {
  return sessionStorage.getItem('critical_error_occurred') === 'true';
};

/**
 * Exit error recovery mode
 */
export const exitErrorRecoveryMode = () => {
  sessionStorage.removeItem('critical_error_occurred');
};

export default {
  reportError,
  getStoredErrors,
  getCriticalErrors,
  clearStoredErrors,
  clearAllErrors,
  getErrorSummary,
  getErrorAnalytics,
  createErrorReporter,
  withErrorReporting,
  shouldRetryError,
  getRetryDelay,
  classifyError,
  getErrorSeverity,
  isInErrorRecoveryMode,
  exitErrorRecoveryMode,
  ERROR_SEVERITY,
  ERROR_TYPES,
};