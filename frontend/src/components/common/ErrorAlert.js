// components/common/ErrorAlert.js
/**
 * Reusable error alert component
 * Consistent error display across the application
 */
import React from "react";
import { Alert, Button } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";

const ErrorAlert = ({ 
  error, 
  title = "Error", 
  variant = "danger",
  onRetry, 
  onDismiss,
  dismissible = true,
  className = "",
  showIcon = true 
}) => {
  if (!error) return null;

  return (
    <Alert 
      variant={variant} 
      className={className}
      dismissible={dismissible}
      onClose={onDismiss}
    >
      <div className="d-flex align-items-start">
        {showIcon && (
          <BsExclamationTriangle className="flex-shrink-0 me-3 mt-1" size={20} />
        )}
        <div className="flex-grow-1">
          {title && title !== "Error" && (
            <Alert.Heading className="h6 mb-2">{title}</Alert.Heading>
          )}
          <p className="mb-0">{error}</p>
          {onRetry && (
            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant={variant === "danger" ? "outline-danger" : `outline-${variant}`} 
                size="sm"
                onClick={onRetry}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

export default ErrorAlert;
