// frontend/src/components/articles/ArticleList/LoadingState.js
import React from "react";
import { Spinner } from "react-bootstrap";
import { ARIA_LABELS } from "../../../constants/ui";

/**
 * LoadingState Component
 *
 * Displays a loading spinner with customizable message and styling.
 * Used specifically for the ArticleList component loading state.
 */
const LoadingState = ({
  message = "Loading articles...",
  variant = "primary",
  size = "border",
  showMessage = true,
  className = "",
}) => {
  return (
    <div className={`text-center py-5 ${className}`}>
      {/* Bootstrap Spinner */}
      <Spinner
        animation={size}
        variant={variant}
        role="status"
        className="mb-3"
        aria-label={ARIA_LABELS.loadingArticles}
      >
        <span className="visually-hidden">{message}</span>
      </Spinner>

      {/* Loading Message */}
      {showMessage && <p className="mt-3 text-muted mb-0">{message}</p>}
    </div>
  );
};

export default LoadingState;
