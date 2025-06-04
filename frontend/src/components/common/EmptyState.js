// components/common/EmptyState.js
/**
 * EmptyState Component
 * 
 * This file exports both the basic and enhanced versions of EmptyState
 * for backward compatibility during migration.
 * 
 * @deprecated The basic EmptyState is deprecated. Use EmptyStateEnhanced instead.
 */
import React from "react";
import { Card } from "react-bootstrap";

// Import enhanced version
export { default as EmptyStateEnhanced } from "./EmptyState.enhanced";
export { default as EnhancedEmptyState } from "./EmptyState.enhanced";

/**
 * Basic EmptyState Component (Legacy)
 * @deprecated Use EmptyStateEnhanced for new implementations
 */
const EmptyStateBasic = ({ icon: Icon, title, message, action, className = "" }) => {
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

// Export basic as default for backward compatibility
export default EmptyStateBasic;

// Also export as named export
export { EmptyStateBasic };
