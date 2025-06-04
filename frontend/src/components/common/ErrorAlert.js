// components/common/ErrorAlert.js
/**
 * ErrorAlert Component
 * 
 * A flexible error alert component that works seamlessly with useErrorDisplay hook
 * Provides consistent error display across the application
 */
import React from "react";
import { Alert, Button, Stack } from "react-bootstrap";
import { 
  BsExclamationTriangle, 
  BsExclamationCircle,
  BsInfoCircle,
  BsCheckCircle,
  BsWifiOff,
  BsShieldExclamation,
  BsClock
} from "react-icons/bs";
import PropTypes from "prop-types";

/**
 * Get appropriate icon for error type
 */
const getErrorIcon = (variant, type) => {
  const iconProps = { className: "flex-shrink-0 me-3 mt-1", size: 20 };
  
  // Map error types to icons
  const typeIcons = {
    network: <BsWifiOff {...iconProps} />,
    permission: <BsShieldExclamation {...iconProps} />,
    auth: <BsShieldExclamation {...iconProps} />,
    timeout: <BsClock {...iconProps} />,
  };
  
  if (type && typeIcons[type]) {
    return typeIcons[type];
  }
  
  // Default icons by variant
  switch (variant) {
    case 'danger':
      return <BsExclamationCircle {...iconProps} />;
    case 'warning':
      return <BsExclamationTriangle {...iconProps} />;
    case 'info':
      return <BsInfoCircle {...iconProps} />;
    case 'success':
      return <BsCheckCircle {...iconProps} />;
    default:
      return <BsExclamationTriangle {...iconProps} />;
  }
};

const ErrorAlert = ({ 
  // Basic props
  error,
  title,
  variant = "danger",
  
  // Actions
  onRetry, 
  onDismiss,
  actions = [],
  
  // Display options
  dismissible = true,
  className = "",
  showIcon = true,
  showDetails = false,
  showTimestamp = false,
  
  // Error object support (from useErrorDisplay)
  errorObject,
  
  // Multiple errors support
  errors = [],
  maxDisplay = 3,
  
  // Custom content
  children
}) => {
  // Handle different input formats
  const errorData = React.useMemo(() => {
    if (errorObject) {
      return {
        message: errorObject.message,
        title: errorObject.title || title,
        variant: errorObject.variant || variant,
        type: errorObject.type,
        details: errorObject.details,
        code: errorObject.code,
        statusCode: errorObject.statusCode,
        timestamp: errorObject.timestamp,
        actions: errorObject.actions || actions,
        retry: errorObject.retry || onRetry
      };
    }
    
    if (typeof error === 'object' && error !== null && !(error instanceof Error)) {
      return {
        message: error.message || error.error || String(error),
        title: error.title || title,
        variant: error.variant || variant,
        type: error.type,
        details: error.details,
        code: error.code,
        statusCode: error.statusCode,
        actions: error.actions || actions,
        retry: error.retry || onRetry
      };
    }
    
    return {
      message: error instanceof Error ? error.message : String(error || ''),
      title,
      variant,
      actions,
      retry: onRetry
    };
  }, [error, errorObject, title, variant, actions, onRetry]);
  
  // Don't render if no error
  if (!error && !errorObject && errors.length === 0) return null;
  
  // Render multiple errors
  if (errors.length > 0) {
    const displayErrors = errors.slice(0, maxDisplay);
    const remainingCount = errors.length - maxDisplay;
    
    return (
      <Stack gap={2} className={className}>
        {displayErrors.map((err, index) => (
          <ErrorAlert
            key={err.id || index}
            errorObject={err}
            onDismiss={() => onDismiss?.(err.id || index)}
            dismissible={dismissible}
            showIcon={showIcon}
            showDetails={showDetails}
            showTimestamp={showTimestamp}
          />
        ))}
        {remainingCount > 0 && (
          <Alert variant="secondary" className="py-2">
            <small>And {remainingCount} more error{remainingCount > 1 ? 's' : ''}...</small>
          </Alert>
        )}
      </Stack>
    );
  }
  
  // Format timestamp if needed
  const formattedTimestamp = errorData.timestamp && showTimestamp
    ? new Date(errorData.timestamp).toLocaleTimeString()
    : null;
  
  return (
    <Alert 
      variant={errorData.variant} 
      className={className}
      dismissible={dismissible}
      onClose={() => onDismiss?.(errorData.id)}
    >
      <div className="d-flex align-items-start">
        {showIcon && getErrorIcon(errorData.variant, errorData.type)}
        
        <div className="flex-grow-1">
          {/* Title */}
          {errorData.title && (
            <Alert.Heading className="h6 mb-2 d-flex justify-content-between align-items-center">
              <span>{errorData.title}</span>
              {formattedTimestamp && (
                <small className="text-muted fw-normal">{formattedTimestamp}</small>
              )}
            </Alert.Heading>
          )}
          
          {/* Main message */}
          <p className="mb-0">{errorData.message}</p>
          
          {/* Error code/status */}
          {(errorData.code || errorData.statusCode) && (
            <p className="mb-0 mt-1">
              <small className="text-muted">
                {errorData.code && `Code: ${errorData.code}`}
                {errorData.code && errorData.statusCode && ' • '}
                {errorData.statusCode && `Status: ${errorData.statusCode}`}
              </small>
            </p>
          )}
          
          {/* Details (collapsible) */}
          {showDetails && errorData.details && (
            <details className="mt-2">
              <summary className="cursor-pointer text-muted small">
                Show details
              </summary>
              <pre className="mt-2 p-2 bg-light rounded small mb-0" style={{ maxHeight: '200px', overflow: 'auto' }}>
                {typeof errorData.details === 'string' 
                  ? errorData.details 
                  : JSON.stringify(errorData.details, null, 2)
                }
              </pre>
            </details>
          )}
          
          {/* Custom children content */}
          {children && <div className="mt-2">{children}</div>}
          
          {/* Actions */}
          {(errorData.retry || errorData.actions?.length > 0) && (
            <div className="d-flex justify-content-end gap-2 mt-3">
              {errorData.retry && (
                <Button 
                  variant={`outline-${errorData.variant}`} 
                  size="sm"
                  onClick={errorData.retry}
                >
                  Try Again
                </Button>
              )}
              {errorData.actions?.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || `outline-${errorData.variant}`}
                  size="sm"
                  onClick={action.onClick}
                  disabled={action.disabled}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
};

ErrorAlert.propTypes = {
  // Basic error display
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
    PropTypes.instanceOf(Error)
  ]),
  title: PropTypes.string,
  variant: PropTypes.oneOf(['danger', 'warning', 'info', 'success', 'primary', 'secondary']),
  
  // Actions
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  actions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    variant: PropTypes.string,
    disabled: PropTypes.bool
  })),
  
  // Display options
  dismissible: PropTypes.bool,
  className: PropTypes.string,
  showIcon: PropTypes.bool,
  showDetails: PropTypes.bool,
  showTimestamp: PropTypes.bool,
  
  // Enhanced error object
  errorObject: PropTypes.shape({
    id: PropTypes.string,
    message: PropTypes.string,
    title: PropTypes.string,
    type: PropTypes.string,
    variant: PropTypes.string,
    details: PropTypes.any,
    code: PropTypes.string,
    statusCode: PropTypes.number,
    timestamp: PropTypes.instanceOf(Date),
    retry: PropTypes.func,
    actions: PropTypes.array
  }),
  
  // Multiple errors
  errors: PropTypes.array,
  maxDisplay: PropTypes.number,
  
  // Custom content
  children: PropTypes.node
};

// Export preset configurations for common use cases
ErrorAlert.presets = {
  // Network error with retry
  network: (props) => (
    <ErrorAlert
      title="Connection Error"
      variant="danger"
      showIcon
      {...props}
      errorObject={{
        type: 'network',
        ...props.errorObject
      }}
    />
  ),
  
  // Form validation error
  validation: (props) => (
    <ErrorAlert
      title="Validation Error"
      variant="warning"
      dismissible={false}
      {...props}
    />
  ),
  
  // Permission denied
  permission: (props) => (
    <ErrorAlert
      title="Access Denied"
      variant="danger"
      {...props}
      errorObject={{
        type: 'permission',
        ...props.errorObject
      }}
    />
  ),
  
  // API error with details
  api: (props) => (
    <ErrorAlert
      showDetails
      showTimestamp
      {...props}
    />
  )
};

export default ErrorAlert;
