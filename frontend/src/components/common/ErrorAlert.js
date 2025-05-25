// frontend/src/components/common/ErrorAlert.js
import React from "react";
import { Alert, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const ErrorAlert = ({
  title,
  message,
  variant = "danger",
  actionButton = null,
  onRetry = null,
}) => {
  const navigate = useNavigate();

  return (
    <Alert variant={variant}>
      <Alert.Heading>{title}</Alert.Heading>
      <p>{message}</p>
      <div className="d-flex justify-content-end gap-2">
        {onRetry && (
          <Button variant={`outline-${variant}`} onClick={onRetry}>
            Try Again
          </Button>
        )}
        {actionButton &&
          (actionButton.to ? (
            <Link to={actionButton.to}>
              <Button variant={`outline-${variant}`}>
                {actionButton.text}
              </Button>
            </Link>
          ) : (
            <Button
              variant={`outline-${variant}`}
              onClick={actionButton.onClick || (() => navigate(-1))}
            >
              {actionButton.text}
            </Button>
          ))}
      </div>
    </Alert>
  );
};

export default ErrorAlert;
