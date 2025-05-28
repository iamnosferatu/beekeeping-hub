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
 * @param {string} size - Size of the spinner ('sm' or default)
 * @param {string} variant - Bootstrap color variant for the spinner
 * @param {string} className - Additional CSS classes
 */
const LoadingSpinner = ({
  message = "Loading...",
  size = "border",
  variant = "primary",
  className = "",
}) => {
  return (
    <div className={`text-center py-5 ${className}`}>
      <Spinner
        animation={size}
        variant={variant}
        role="status"
        aria-label={message}
      >
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <p className="mt-3 text-muted">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
