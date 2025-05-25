// frontend/src/components/articles/ArticleListError.js
import React from "react";
import { Alert, Button } from "react-bootstrap";
import { BsExclamationTriangle, BsArrowRepeat } from "react-icons/bs";

/**
 * ArticleListError Component
 *
 * Displays error messages when article loading fails.
 * Provides context-aware error messages and retry functionality.
 *
 * @param {Object} error - Error object from API call
 * @param {string} search - Current search term (if any)
 * @param {string} tag - Current tag filter (if any)
 */
const ArticleListError = ({ error, search, tag }) => {
  /**
   * Get user-friendly error message based on error type
   * @param {Object} error - Error object
   * @returns {string} User-friendly error message
   */
  const getErrorMessage = (error) => {
    if (error.type === "NETWORK_ERROR") {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    if (error.status === 404) {
      return "The requested articles could not be found.";
    }

    if (error.status >= 500) {
      return "Server error occurred. Please try again later.";
    }

    if (error.status === 403) {
      return "You don't have permission to view these articles.";
    }

    return (
      error.message || "An unexpected error occurred while loading articles."
    );
  };

  /**
   * Get contextual error title based on filters
   * @returns {string} Contextual error title
   */
  const getErrorTitle = () => {
    if (search && tag) {
      return `Error Loading Articles for "${search}" in "${tag}"`;
    }
    if (search) {
      return `Error Loading Search Results for "${search}"`;
    }
    if (tag) {
      return `Error Loading Articles Tagged "${tag}"`;
    }
    return "Error Loading Articles";
  };

  /**
   * Handle retry action
   */
  const handleRetry = () => {
    // Force page reload to retry the request
    window.location.reload();
  };

  /**
   * Get appropriate alert variant based on error type
   * @param {Object} error - Error object
   * @returns {string} Bootstrap alert variant
   */
  const getAlertVariant = (error) => {
    if (error.type === "NETWORK_ERROR") {
      return "warning";
    }
    if (error.status >= 500) {
      return "danger";
    }
    return "danger";
  };

  return (
    <Alert variant={getAlertVariant(error)} className="mb-4">
      <div className="d-flex align-items-start">
        <BsExclamationTriangle className="flex-shrink-0 me-3 mt-1" size={24} />
        <div className="flex-grow-1">
          <Alert.Heading className="h5 mb-2">{getErrorTitle()}</Alert.Heading>

          <p className="mb-3">{getErrorMessage(error)}</p>

          {/* Error Details for Development */}
          {process.env.NODE_ENV === "development" && (
            <details className="mb-3">
              <summary
                className="text-muted small"
                style={{ cursor: "pointer" }}
              >
                Technical Details (Development Only)
              </summary>
              <pre className="mt-2 p-2 bg-light rounded small">
                {JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={handleRetry}>
              <BsArrowRepeat className="me-1" />
              Try Again
            </Button>

            {(search || tag) && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => (window.location.href = "/articles")}
              >
                View All Articles
              </Button>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
};

export default ArticleListError;
