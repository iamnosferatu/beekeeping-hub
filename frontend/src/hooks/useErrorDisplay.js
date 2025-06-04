// frontend/src/hooks/useErrorDisplay.js
import { useState, useCallback, useEffect, useRef } from "react";

/**
 * useErrorDisplay Hook
 *
 * A comprehensive hook for managing error display state with features like:
 * - Multiple error handling
 * - Auto-dismiss after timeout
 * - Error history tracking
 * - Retry functionality
 * - Error categorization
 *
 * @param {Object} options - Configuration options
 * @param {number} options.autoDismissTimeout - Auto dismiss timeout in ms (default: null - no auto dismiss)
 * @param {number} options.maxErrors - Maximum number of errors to display (default: 1)
 * @param {boolean} options.trackHistory - Whether to track error history (default: false)
 * @param {Function} options.onError - Callback when error is set
 * @param {Function} options.onClear - Callback when errors are cleared
 * 
 * @returns {Object} Error display utilities
 */
export const useErrorDisplay = (options = {}) => {
  const {
    autoDismissTimeout = null,
    maxErrors = 1,
    trackHistory = false,
    onError,
    onClear
  } = options;

  // State for current errors
  const [errors, setErrors] = useState([]);
  const [errorHistory, setErrorHistory] = useState([]);
  const timeoutRefs = useRef({});

  /**
   * Set a single error or multiple errors
   * @param {string|Object|Array} error - Error to display
   * @param {Object} errorOptions - Options for this specific error
   */
  const setError = useCallback((error, errorOptions = {}) => {
    if (!error) return;

    const errorEntry = createErrorEntry(error, errorOptions);
    
    setErrors(prev => {
      const newErrors = [...prev, errorEntry];
      // Limit to maxErrors
      if (maxErrors > 0 && newErrors.length > maxErrors) {
        return newErrors.slice(-maxErrors);
      }
      return newErrors;
    });

    // Track in history if enabled
    if (trackHistory) {
      setErrorHistory(prev => [...prev, errorEntry]);
    }

    // Set up auto-dismiss if configured
    const dismissTimeout = errorOptions.autoDismiss !== undefined 
      ? errorOptions.autoDismiss 
      : autoDismissTimeout;
      
    if (dismissTimeout) {
      timeoutRefs.current[errorEntry.id] = setTimeout(() => {
        clearError(errorEntry.id);
        delete timeoutRefs.current[errorEntry.id];
      }, dismissTimeout);
    }

    // Callback
    if (onError) {
      onError(errorEntry);
    }
  }, [autoDismissTimeout, maxErrors, trackHistory, onError]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Clear a specific error by ID
   * @param {string} errorId - ID of error to clear
   */
  const clearError = useCallback((errorId) => {
    setErrors(prev => prev.filter(e => e.id !== errorId));
    
    // Clear any pending timeout
    if (timeoutRefs.current[errorId]) {
      clearTimeout(timeoutRefs.current[errorId]);
      delete timeoutRefs.current[errorId];
    }
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setErrors([]);
    
    // Clear all timeouts
    Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current = {};
    
    if (onClear) {
      onClear();
    }
  }, [onClear]);

  /**
   * Replace all errors with a new error
   * @param {string|Object} error - Error to display
   * @param {Object} errorOptions - Options for this error
   */
  const replaceError = useCallback((error, errorOptions = {}) => {
    clearAllErrors();
    setError(error, errorOptions);
  }, [clearAllErrors, setError]);

  /**
   * Get the first error (for single error display)
   */
  const error = errors.length > 0 ? errors[0] : null;

  /**
   * Check if there are any errors
   */
  const hasError = errors.length > 0;

  /**
   * Get error count
   */
  const errorCount = errors.length;

  /**
   * Retry function wrapper
   * @param {Function} fn - Function to retry
   */
  const withRetry = useCallback((fn) => {
    return async (...args) => {
      clearAllErrors();
      try {
        return await fn(...args);
      } catch (err) {
        setError(err);
        throw err;
      }
    };
  }, [clearAllErrors, setError]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  return {
    // Single error (backward compatibility)
    error,
    setError,
    clearError: () => clearError(error?.id),
    
    // Multiple errors
    errors,
    clearErrors: clearAllErrors,
    clearErrorById: clearError,
    replaceError,
    
    // Utilities
    hasError,
    errorCount,
    errorHistory,
    withRetry,
    
    // Clear history
    clearHistory: () => setErrorHistory([])
  };
};

/**
 * Create a standardized error entry
 * @param {string|Object|Error} error - Raw error input
 * @param {Object} options - Additional options
 * @returns {Object} Standardized error entry
 */
function createErrorEntry(error, options = {}) {
  const id = options.id || `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date();
  
  // Handle different error types
  let message, title, type, details, code, statusCode;
  
  if (typeof error === 'string') {
    message = error;
    type = options.type || 'error';
  } else if (error instanceof Error) {
    message = error.message;
    type = error.name || 'Error';
    details = error.stack;
  } else if (error && typeof error === 'object') {
    // Handle API error responses
    message = error.message || error.error || 'An error occurred';
    title = error.title;
    type = error.type || options.type || 'error';
    details = error.details || error.data;
    code = error.code;
    statusCode = error.status || error.statusCode;
  }
  
  return {
    id,
    message,
    title: title || options.title,
    type,
    details,
    code,
    statusCode,
    timestamp,
    dismissible: options.dismissible !== false,
    variant: options.variant || getVariantForType(type),
    retry: options.retry,
    actions: options.actions,
    metadata: options.metadata
  };
}

/**
 * Get Bootstrap variant based on error type
 * @param {string} type - Error type
 * @returns {string} Bootstrap variant
 */
function getVariantForType(type) {
  const typeMap = {
    error: 'danger',
    warning: 'warning',
    info: 'info',
    success: 'success',
    network: 'danger',
    validation: 'warning',
    permission: 'danger',
    auth: 'danger',
    notfound: 'warning',
    server: 'danger',
    timeout: 'warning'
  };
  
  return typeMap[type?.toLowerCase()] || 'danger';
}

/**
 * Hook for handling API errors specifically
 * @param {Object} options - Options for useErrorDisplay
 * @returns {Object} Error display utilities with API error handling
 */
export const useApiErrorDisplay = (options = {}) => {
  const errorDisplay = useErrorDisplay(options);
  
  /**
   * Set error from API response
   * @param {Object} error - API error response
   */
  const setApiError = useCallback((error) => {
    if (!error) return;
    
    // Extract meaningful error message from API response
    let message = 'An error occurred';
    let type = 'error';
    let title;
    
    if (error.response) {
      // Axios error with response
      const data = error.response.data;
      message = data?.message || data?.error || error.message;
      type = getErrorTypeFromStatus(error.response.status);
      title = data?.title;
    } else if (error.request) {
      // Network error
      message = 'Network error. Please check your connection.';
      type = 'network';
    } else if (error.message) {
      // General error
      message = error.message;
    }
    
    errorDisplay.setError({
      message,
      type,
      title,
      statusCode: error.response?.status,
      details: error.response?.data
    });
  }, [errorDisplay]);
  
  return {
    ...errorDisplay,
    setApiError
  };
};

/**
 * Get error type from HTTP status code
 * @param {number} status - HTTP status code
 * @returns {string} Error type
 */
function getErrorTypeFromStatus(status) {
  if (status >= 500) return 'server';
  if (status === 404) return 'notfound';
  if (status === 403) return 'permission';
  if (status === 401) return 'auth';
  if (status === 422 || status === 400) return 'validation';
  if (status === 429) return 'ratelimit';
  if (status === 408) return 'timeout';
  return 'error';
}

export default useErrorDisplay;