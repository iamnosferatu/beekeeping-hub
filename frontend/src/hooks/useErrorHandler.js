// frontend/src/hooks/useErrorHandler.js
import { useCallback } from 'react';

/**
 * useErrorHandler - Hook for consistent error handling in functional components
 * 
 * Provides standardized error handling, logging, and user feedback
 * for async operations and event handlers.
 */
export const useErrorHandler = () => {
  const handleError = useCallback((error, context = {}) => {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Handler');
      console.error('Error:', error);
      console.error('Context:', context);
      console.groupEnd();
    }

    // Store error for reporting
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorInfo);
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('app_errors', JSON.stringify(recentErrors));
    } catch (e) {
      // Silently fail
    }

    // Return user-friendly error message
    return getErrorMessage(error, context);
  }, []);

  const getErrorMessage = (error, context) => {
    // Network errors
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      return 'Network connection error. Please check your internet connection.';
    }

    // API errors
    if (error.response) {
      const status = error.response.status;
      switch (status) {
        case 401:
          return 'Authentication required. Please log in again.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return error.response.data?.message || 'An error occurred. Please try again.';
      }
    }

    // Validation errors
    if (error.name === 'ValidationError') {
      return error.message || 'Please check your input and try again.';
    }

    // Generic errors
    if (context.operation) {
      return `Failed to ${context.operation}. Please try again.`;
    }

    return error.message || 'An unexpected error occurred. Please try again.';
  };

  const createAsyncHandler = useCallback((asyncFn, context = {}) => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        const message = handleError(error, context);
        throw new Error(message);
      }
    };
  }, [handleError]);

  return {
    handleError,
    createAsyncHandler,
  };
};

export default useErrorHandler;