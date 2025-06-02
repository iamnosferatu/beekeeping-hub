// frontend/src/components/common/ErrorMonitor.js
import React, { useEffect, useState, useCallback } from 'react';
import { Toast, ToastContainer, Alert, Button, Badge } from 'react-bootstrap';
import { BsExclamationTriangle, BsShield, BsWifi, BsX } from 'react-icons/bs';
import { 
  getErrorAnalytics, 
  getCriticalErrors, 
  clearStoredErrors, 
  isInErrorRecoveryMode,
  exitErrorRecoveryMode,
  ERROR_SEVERITY 
} from '../../utils/errorReporting';
import { offlineHandler } from '../../utils/errorFallbacks';

/**
 * Error Monitor Component
 * 
 * Provides real-time error monitoring and user notifications.
 * Shows error toasts, offline status, and recovery options.
 */
const ErrorMonitor = ({ 
  showToasts = true, 
  showOfflineIndicator = true,
  showErrorStats = false,
  position = 'top-end',
  autoHide = true 
}) => {
  const [errors, setErrors] = useState([]);
  const [criticalErrors, setCriticalErrors] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [showStats, setShowStats] = useState(false);
  const [errorAnalytics, setErrorAnalytics] = useState(null);
  const [inRecoveryMode, setInRecoveryMode] = useState(false);

  // Check for errors periodically
  useEffect(() => {
    const checkErrors = () => {
      try {
        const analytics = getErrorAnalytics();
        const critical = getCriticalErrors();
        const recovery = isInErrorRecoveryMode();
        
        setErrorAnalytics(analytics);
        setCriticalErrors(critical);
        setInRecoveryMode(recovery);
        
        // Show only recent errors as toasts
        const recentErrors = analytics.trends.recent.slice(-3);
        setErrors(recentErrors);
      } catch (error) {
        console.warn('Error monitoring failed:', error);
      }
    };

    // Initial check
    checkErrors();

    // Check every 30 seconds
    const interval = setInterval(checkErrors, 30000);

    return () => clearInterval(interval);
  }, []);

  // Listen for offline status changes
  useEffect(() => {
    const handleStatusChange = (status, online) => {
      setIsOffline(!online);
    };

    offlineHandler.addEventListener(handleStatusChange);

    return () => {
      offlineHandler.removeEventListener(handleStatusChange);
    };
  }, []);

  // Handle error dismissal
  const handleDismissError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  // Handle clear all errors
  const handleClearAllErrors = useCallback(() => {
    clearStoredErrors();
    setErrors([]);
    setCriticalErrors([]);
    setErrorAnalytics(null);
  }, []);

  // Handle exit recovery mode
  const handleExitRecoveryMode = useCallback(() => {
    exitErrorRecoveryMode();
    setInRecoveryMode(false);
  }, []);

  // Get toast variant based on error severity
  const getToastVariant = (severity) => {
    switch (severity) {
      case ERROR_SEVERITY.CRITICAL:
        return 'danger';
      case ERROR_SEVERITY.HIGH:
        return 'warning';
      case ERROR_SEVERITY.MEDIUM:
        return 'info';
      case ERROR_SEVERITY.LOW:
        return 'light';
      default:
        return 'secondary';
    }
  };

  // Get error icon based on type
  const getErrorIcon = (type) => {
    switch (type) {
      case 'network':
        return <BsWifi className="me-2" />;
      case 'authentication':
      case 'authorization':
        return <BsShield className="me-2" />;
      default:
        return <BsExclamationTriangle className="me-2" />;
    }
  };

  return (
    <>
      {/* Offline Indicator */}
      {showOfflineIndicator && isOffline && (
        <Alert 
          variant="warning" 
          className="position-fixed top-0 start-50 translate-middle-x mt-3 z-3"
          style={{ zIndex: 1060 }}
        >
          <BsWifi className="me-2" />
          You're offline. Some features may be limited.
        </Alert>
      )}

      {/* Recovery Mode Alert */}
      {inRecoveryMode && (
        <Alert 
          variant="danger" 
          className="position-fixed top-0 start-50 translate-middle-x mt-3 z-3"
          style={{ zIndex: 1061 }}
          dismissible
          onClose={handleExitRecoveryMode}
        >
          <BsExclamationTriangle className="me-2" />
          <strong>Error Recovery Mode:</strong> The application encountered critical errors.
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="ms-2"
            onClick={handleExitRecoveryMode}
          >
            Continue
          </Button>
        </Alert>
      )}

      {/* Error Statistics Badge */}
      {showErrorStats && errorAnalytics && errorAnalytics.overview.total > 0 && (
        <div 
          className="position-fixed bottom-0 end-0 m-3"
          style={{ zIndex: 1050 }}
        >
          <Badge 
            bg={errorAnalytics.overview.critical > 0 ? 'danger' : 'warning'}
            className="p-2 cursor-pointer"
            onClick={() => setShowStats(!showStats)}
            style={{ cursor: 'pointer' }}
          >
            <BsExclamationTriangle className="me-1" />
            {errorAnalytics.overview.total} errors
            {errorAnalytics.overview.critical > 0 && ` (${errorAnalytics.overview.critical} critical)`}
          </Badge>
          
          {showStats && (
            <div className="mt-2">
              <Alert variant="light" className="small">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <strong>Error Statistics</strong>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={handleClearAllErrors}
                  >
                    Clear All
                  </Button>
                </div>
                <div>
                  <div>Total: {errorAnalytics.overview.total}</div>
                  <div>Critical: {errorAnalytics.overview.critical}</div>
                  <div>Rate: {errorAnalytics.overview.errorRate}/hour</div>
                </div>
                <details className="mt-2">
                  <summary className="small text-muted">By Type</summary>
                  <div className="mt-1">
                    {Object.entries(errorAnalytics.breakdown.byType).map(([type, count]) => (
                      <div key={type} className="small">
                        {type}: {count}
                      </div>
                    ))}
                  </div>
                </details>
              </Alert>
            </div>
          )}
        </div>
      )}

      {/* Error Toasts */}
      {showToasts && (
        <ToastContainer position={position} className="p-3">
          {errors.map((error) => (
            <Toast
              key={error.id}
              show={true}
              onClose={() => handleDismissError(error.id)}
              delay={autoHide ? 5000 : undefined}
              autohide={autoHide}
              bg={getToastVariant(error.severity)}
              className="text-white"
            >
              <Toast.Header>
                {getErrorIcon(error.type)}
                <strong className="me-auto">
                  {error.severity === ERROR_SEVERITY.CRITICAL ? 'Critical Error' :
                   error.severity === ERROR_SEVERITY.HIGH ? 'Error' :
                   error.severity === ERROR_SEVERITY.MEDIUM ? 'Warning' : 'Notice'}
                </strong>
                <small className="text-muted">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </small>
                <Button 
                  variant="close" 
                  size="sm" 
                  onClick={() => handleDismissError(error.id)}
                  aria-label="Close"
                >
                  <BsX />
                </Button>
              </Toast.Header>
              <Toast.Body>
                <div className="small">
                  {error.message}
                </div>
                {error.component && (
                  <div className="small text-muted mt-1">
                    Component: {error.component}
                  </div>
                )}
              </Toast.Body>
            </Toast>
          ))}
        </ToastContainer>
      )}
    </>
  );
};

/**
 * Error Monitor Provider
 * 
 * Wraps the application with error monitoring capabilities
 */
export const ErrorMonitorProvider = ({ children, ...props }) => {
  return (
    <>
      {children}
      <ErrorMonitor {...props} />
    </>
  );
};

/**
 * Hook to access error monitoring functions
 */
export const useErrorMonitor = () => {
  const [analytics, setAnalytics] = useState(null);
  
  const refreshAnalytics = useCallback(() => {
    try {
      const data = getErrorAnalytics();
      setAnalytics(data);
      return data;
    } catch (error) {
      console.warn('Failed to get error analytics:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    analytics,
    refreshAnalytics,
    clearAllErrors: clearStoredErrors,
    getCriticalErrors,
    isInRecoveryMode,
    exitRecoveryMode: exitErrorRecoveryMode,
  };
};

export default ErrorMonitor;