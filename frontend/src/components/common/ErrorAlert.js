// components/common/ErrorAlert.js
/**
 * Reusable error alert component
 * Consistent error display across the application
 */
import React from "react";
import { Alert, Button } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";

const ErrorAlert = ({ error, title = "Error", onRetry, className = "" }) => {
  return (
    <Alert variant="danger" className={className}>
      <div className="d-flex align-items-start">
        <BsExclamationTriangle className="flex-shrink-0 me-3 mt-1" size={24} />
        <div className="flex-grow-1">
          <Alert.Heading className="h5 mb-2">{title}</Alert.Heading>
          <p className="mb-0">{error}</p>
          {onRetry && (
            <div className="d-flex justify-content-end mt-3">
              <Button variant="outline-danger" onClick={onRetry}>
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
