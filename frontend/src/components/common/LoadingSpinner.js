// frontend/src/components/common/LoadingSpinner.js
import React from "react";
import { Spinner, Container } from "react-bootstrap";

/**
 * LoadingSpinner Component
 *
 * A reusable loading spinner component with customizable message and styling.
 * Used throughout the application for consistent loading states.
 *
 * @param {string} message - Loading message to display
 * @param {string} variant - Bootstrap color variant for the spinner
 * @param {string} size - Size of the spinner ('sm' or default)
 * @param {boolean} fullHeight - Whether to use full viewport height
 * @param {string} className - Additional CSS classes
 */
const LoadingSpinner = ({
  message = "Loading...",
  variant = "primary",
  size,
  fullHeight = false,
  className = "",
}) => {
  // Determine container classes based on props
  const containerClasses = `text-center py-5 ${
    fullHeight
      ? "min-vh-100 d-flex align-items-center justify-content-center"
      : ""
  } ${className}`;

  return (
    <Container className={containerClasses}>
      <div>
        <Spinner
          animation="border"
          variant={variant}
          size={size}
          role="status"
          aria-label={message}
        >
          <span className="visually-hidden">{message}</span>
        </Spinner>

        {/* Loading message */}
        <p className="mt-3 text-muted mb-0">{message}</p>
      </div>
    </Container>
  );
};

export default LoadingSpinner;
