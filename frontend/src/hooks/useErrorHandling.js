// frontend/src/hooks/useErrorHandling.js
import { useCallback } from "react";

/**
 * Custom hook for error handling utilities
 * Provides standardized error processing and user-friendly messages
 *
 * @returns {Object} Error handling utilities
 */
export const useErrorHandling = () => {
  /**
   * Convert API error to user-friendly message
   */
  const getErrorMessage = useCallback((error) => {
    // Network errors
    if (error.type === "NETWORK_ERROR") {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    // HTTP status codes
    const statusMessages = {
      400: "Invalid request. Please check your input.",
      401: "You need to log in to access this content.",
      403: "You don't have permission to view this content.",
      404: "The requested content could not be found.",
      408: "Request timeout. Please try again.",
      429: "Too many requests. Please wait a moment and try again.",
      500: "Server error. Please try again later.",
      502: "Bad gateway. The server is temporarily unavailable.",
      503: "Service unavailable. Please try again later.",
      504: "Gateway timeout. The server is taking too long to respond.",
    };

    if (error.status && statusMessages[error.status]) {
      return statusMessages[error.status];
    }

    // Fallback to error message or generic message
    return error.message || "An unexpected error occurred. Please try again.";
  }, []);

  /**
   * Get appropriate alert variant for error type
   */
  const getErrorVariant = useCallback((error) => {
    if (error.type === "NETWORK_ERROR") return "warning";
    if (error.status >= 500) return "danger";
    if (error.status === 404) return "info";
    if (error.status === 401 || error.status === 403) return "warning";
    return "danger";
  }, []);

  /**
   * Check if error is retryable
   */
  const isRetryableError = useCallback((error) => {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return (
      error.type === "NETWORK_ERROR" || retryableStatuses.includes(error.status)
    );
  }, []);

  return {
    getErrorMessage,
    getErrorVariant,
    isRetryableError,
  };
};
