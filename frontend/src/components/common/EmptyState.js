// components/common/EmptyState.js
/**
 * Reusable empty state component
 * Can be used across different pages for consistent empty states
 */
import React from "react";
import { Card } from "react-bootstrap";

const EmptyState = ({ icon: Icon, title, message, action, className = "" }) => {
  return (
    <Card className={`shadow-sm ${className}`}>
      <Card.Body className="text-center py-5">
        {Icon && <Icon size={50} className="text-muted mb-3" />}
        {title && <h4>{title}</h4>}
        {message && <p className="text-muted">{message}</p>}
        {action && action}
      </Card.Body>
    </Card>
  );
};

export default EmptyState;
