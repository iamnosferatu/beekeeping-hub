// frontend/src/components/common/LoadingIndicator.js
import React from "react";
import { Spinner, Container } from "react-bootstrap";

/**
 * LoadingIndicator Component
 *
 * A flexible loading component that can display various loading states:
 * - Simple spinner
 * - Spinner with message
 * - Full page loading
 * - Inline loading
 * - Custom sizes and variants
 *
 * @param {string} message - Loading message to display
 * @param {string} size - Size of the spinner ('sm', 'md', 'lg', or Bootstrap animation type)
 * @param {string} variant - Bootstrap color variant for the spinner
 * @param {boolean} showMessage - Whether to show the loading message
 * @param {boolean} fullScreen - Whether to center in full viewport
 * @param {boolean} inline - Whether to display inline (no padding)
 * @param {string} className - Additional CSS classes
 * @param {string} messageClassName - Additional CSS for message
 * @param {string} spinnerClassName - Additional CSS for spinner
 * @param {string} ariaLabel - Accessibility label
 */
const LoadingIndicator = ({
  message = "Loading...",
  size = "border",
  variant = "primary",
  showMessage = true,
  fullScreen = false,
  inline = false,
  className = "",
  messageClassName = "",
  spinnerClassName = "",
  ariaLabel,
}) => {
  // Determine the actual spinner size based on the size prop
  const getSpinnerProps = () => {
    const props = {
      animation: size === "sm" || size === "md" || size === "lg" ? "border" : size,
      variant,
      role: "status",
      "aria-label": ariaLabel || message,
      className: spinnerClassName,
    };

    // Add size class if using predefined sizes
    if (size === "sm") {
      props.size = "sm";
    } else if (size === "lg") {
      props.className = `${props.className} spinner-border-lg`;
      props.style = { width: "3rem", height: "3rem" };
    }

    return props;
  };

  // Determine container classes
  const containerClasses = [
    "d-flex",
    "flex-column",
    "align-items-center",
    "justify-content-center",
    inline ? "" : "py-5",
    fullScreen ? "min-vh-100" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <Spinner {...getSpinnerProps()}>
        <span className="visually-hidden">{message}</span>
      </Spinner>
      {showMessage && (
        <p className={`mt-3 mb-0 text-muted ${messageClassName}`}>{message}</p>
      )}
    </>
  );

  // For full screen, wrap in a container
  if (fullScreen) {
    return (
      <Container fluid className={containerClasses}>
        {content}
      </Container>
    );
  }

  // For regular display
  return <div className={containerClasses}>{content}</div>;
};

// Preset configurations for common use cases
LoadingIndicator.presets = {
  // Full page loading
  fullPage: (props = {}) => (
    <LoadingIndicator
      fullScreen
      size="lg"
      {...props}
    />
  ),
  
  // Inline small spinner (e.g., in buttons)
  inline: (props = {}) => (
    <LoadingIndicator
      inline
      showMessage={false}
      size="sm"
      {...props}
    />
  ),
  
  // Article list loading
  articleList: (props = {}) => (
    <LoadingIndicator
      message="Loading articles..."
      {...props}
    />
  ),
  
  // Form submission
  formSubmit: (props = {}) => (
    <LoadingIndicator
      message="Submitting..."
      size="sm"
      inline
      {...props}
    />
  ),
  
  // Data fetching
  dataFetch: (props = {}) => (
    <LoadingIndicator
      message="Fetching data..."
      {...props}
    />
  ),
};

export default LoadingIndicator;