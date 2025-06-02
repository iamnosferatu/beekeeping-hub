// frontend/src/hooks/useErrorHandlerEnhanced.js
import { useCallback, useState, useRef } from 'react';
import { reportError, shouldRetryError, getRetryDelay, withErrorReporting, ERROR_TYPES, ERROR_SEVERITY } from '../utils/errorReporting';

/**
 * Enhanced error handling hook with retry mechanisms and fallbacks
 * 
 * Provides comprehensive error handling capabilities similar to backend patterns:
 * - Automatic retry for transient errors
 * - Error classification and reporting
 * - Fallback mechanisms
 * - Recovery strategies
 */
export const useErrorHandlerEnhanced = (context = {}) => {
  const [errors, setErrors] = useState([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const retryTimeoutRef = useRef(null);
  const reportErrorRef = useRef(withErrorReporting(context));

  /**
   * Handle error with automatic retry logic
   */
  const handleError = useCallback(async (error, options = {}) => {
    const {
      enableRetry = true,
      maxRetries = 3,
      customRetryLogic = null,
      fallback = null,
      severity = null,
      context: errorContext = {},
    } = options;

    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Enhanced error object
    const enhancedError = {
      ...error,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      context: {
        ...context,
        ...errorContext,
        retryCount,
      },
      severity: severity || getSeverityFromError(error),
    };

    // Add to errors list
    setErrors(prev => [...prev.slice(-9), enhancedError]); // Keep last 10 errors

    // Report error
    reportErrorRef.current(enhancedError, enhancedError.context);

    // Check if we should retry
    const shouldRetry = customRetryLogic ? 
      customRetryLogic(enhancedError, retryCount) : 
      shouldRetryError(enhancedError, retryCount);

    if (enableRetry && shouldRetry && retryCount < maxRetries) {
      const delay = getRetryDelay(retryCount);
      
      setIsRetrying(true);
      setRetryCount(prev => prev + 1);

      return new Promise((resolve, reject) => {
        retryTimeoutRef.current = setTimeout(() => {
          setIsRetrying(false);
          resolve({ retry: true, delay });
        }, delay);
      });
    }

    // No retry - reset retry count and check for fallback
    setRetryCount(0);
    setIsRetrying(false);

    if (fallback && typeof fallback === 'function') {
      try {
        const fallbackResult = await fallback(enhancedError);
        return { fallbackResult, error: enhancedError };
      } catch (fallbackError) {
        reportErrorRef.current(fallbackError, {
          ...context,
          action: 'fallback_failed',
          originalError: enhancedError.message,
        });
      }
    }

    return { error: enhancedError };
  }, [context, retryCount]);

  /**
   * Execute function with error handling and retry
   */
  const executeWithRetry = useCallback(async (fn, options = {}) => {
    const {
      maxRetries = 3,
      enableRetry = true,
      onRetry = null,
      onSuccess = null,
      onFailure = null,
    } = options;

    let currentRetryCount = 0;
    let lastError = null;

    while (currentRetryCount <= maxRetries) {
      try {
        setIsRetrying(currentRetryCount > 0);
        const result = await fn();
        
        // Success
        setIsRetrying(false);
        setRetryCount(0);
        
        if (onSuccess) {
          onSuccess(result, currentRetryCount);
        }
        
        return { success: true, data: result, retryCount: currentRetryCount };
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        if (enableRetry && currentRetryCount < maxRetries && shouldRetryError(error, currentRetryCount)) {
          const delay = getRetryDelay(currentRetryCount);
          
          if (onRetry) {
            onRetry(error, currentRetryCount, delay);
          }
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delay));
          currentRetryCount++;
          setRetryCount(currentRetryCount);
        } else {
          break;
        }
      }
    }

    // All retries failed
    setIsRetrying(false);
    setRetryCount(0);
    
    const errorResult = await handleError(lastError, {
      ...options,
      enableRetry: false, // Don't retry again in handleError
    });
    
    if (onFailure) {
      onFailure(lastError, currentRetryCount);
    }
    
    return { success: false, error: errorResult.error, retryCount: currentRetryCount };
  }, [handleError]);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
    setRetryCount(0);
    setIsRetrying(false);
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  /**
   * Clear specific error
   */
  const clearError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  /**
   * Get error statistics
   */
  const getErrorStats = useCallback(() => {
    const stats = {
      total: errors.length,
      byType: {},
      bySeverity: {},
      recent: errors.slice(-5),
      hasErrors: errors.length > 0,
      hasCriticalErrors: errors.some(e => e.severity === ERROR_SEVERITY.HIGH || e.severity === ERROR_SEVERITY.CRITICAL),
    };

    errors.forEach(error => {
      const type = error.type || 'unknown';
      const severity = error.severity || 'unknown';
      
      stats.byType[type] = (stats.byType[type] || 0) + 1;
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;
    });

    return stats;
  }, [errors]);

  /**
   * Create error boundary handler
   */
  const createErrorBoundaryHandler = useCallback((componentName) => {
    return (error, errorInfo) => {
      handleError(error, {
        context: {
          component: componentName,
          action: 'componentDidCatch',
          componentStack: errorInfo.componentStack,
        },
        severity: ERROR_SEVERITY.HIGH,
        enableRetry: false,
      });
    };
  }, [handleError]);

  return {
    // Error state
    errors,
    isRetrying,
    retryCount,
    hasErrors: errors.length > 0,
    
    // Error handling methods
    handleError,
    executeWithRetry,
    clearErrors,
    clearError,
    getErrorStats,
    createErrorBoundaryHandler,
    
    // Utility methods
    reportError: reportErrorRef.current,
  };
};

/**
 * Get error severity from error object
 */
const getSeverityFromError = (error) => {
  if (error.severity) return error.severity;
  
  if (error.type) {
    switch (error.type) {
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
        return ERROR_SEVERITY.MEDIUM;
    }
  }
  
  // Check status code
  const status = error.status || error.response?.status;
  if (status >= 500) return ERROR_SEVERITY.HIGH;
  if (status >= 400) return ERROR_SEVERITY.MEDIUM;
  
  return ERROR_SEVERITY.LOW;
};

/**
 * Hook for API operations with error handling
 */
export const useApiError = (apiFunction, context = {}) => {
  const { handleError, executeWithRetry, isRetrying, retryCount } = useErrorHandlerEnhanced(context);
  
  const execute = useCallback(async (...args) => {
    return executeWithRetry(() => apiFunction(...args), {
      context: {
        ...context,
        action: 'api_call',
        function: apiFunction.name,
      },
    });
  }, [apiFunction, executeWithRetry, context]);
  
  return {
    execute,
    isRetrying,
    retryCount,
    handleError,
  };
};

/**
 * Hook for component-level error boundaries
 */
export const useComponentErrorHandler = (componentName) => {
  const { handleError, createErrorBoundaryHandler, errors, clearErrors } = useErrorHandlerEnhanced({
    component: componentName,
  });
  
  return {
    handleError,
    onError: createErrorBoundaryHandler(componentName),
    errors: errors.filter(e => e.context?.component === componentName),
    clearErrors,
  };
};

export default useErrorHandlerEnhanced;