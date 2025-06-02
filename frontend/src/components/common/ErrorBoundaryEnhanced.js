// frontend/src/components/common/ErrorBoundaryEnhanced.js
import React from 'react';
import { Card, Button, Alert, Container, Row, Col, Spinner } from 'react-bootstrap';
import { BsExclamationTriangle, BsArrowCounterclockwise, BsHouse, BsBug, BsShield } from 'react-icons/bs';
import { reportError, shouldRetryError, getRetryDelay, ERROR_SEVERITY, ERROR_TYPES } from '../../utils/errorReporting';

/**
 * Enhanced Error Boundary with retry mechanisms and better error handling
 * 
 * Features:
 * - Automatic retry for transient errors
 * - Fallback UI based on error severity
 * - Integration with error reporting system
 * - Recovery mechanisms
 * - Development debugging tools
 */
class ErrorBoundaryEnhanced extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRetrying: false,
      lastRetryTime: null,
    };

    this.retryTimeout = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorId = this.generateErrorId();
    
    this.setState({
      error,
      errorInfo,
      errorId,
    });

    // Report error with enhanced context
    const reportContext = {
      component: this.props.name || 'ErrorBoundary',
      level: this.props.level || 'component',
      action: 'componentDidCatch',
      boundary: {
        retryCount: this.state.retryCount,
        fallbackType: this.props.fallback || 'default',
        isolate: this.props.isolate || false,
      },
      props: this.sanitizeProps(this.props),
    };

    reportError(error, reportContext);

    // Auto-retry for recoverable errors
    if (this.props.autoRetry !== false && shouldRetryError(error, this.state.retryCount)) {
      this.scheduleRetry();
    }

    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      this.logDetailedError(error, errorInfo, reportContext);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  generateErrorId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  sanitizeProps = (props) => {
    // Remove functions and complex objects for logging
    const sanitized = {};
    Object.keys(props).forEach(key => {
      const value = props[key];
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (value === null || value === undefined) {
        sanitized[key] = value;
      } else {
        sanitized[key] = `[${typeof value}]`;
      }
    });
    return sanitized;
  };

  logDetailedError = (error, errorInfo, context) => {
    console.group('🛡️ Enhanced Error Boundary');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Context:', context);
    console.error('State:', this.state);
    console.error('Component Stack:', errorInfo.componentStack);
    if (error.stack) {
      console.error('Error Stack:', error.stack);
    }
    console.groupEnd();
  };

  scheduleRetry = () => {
    const delay = getRetryDelay(this.state.retryCount);
    
    this.setState({ 
      isRetrying: true,
      lastRetryTime: Date.now(),
    });

    this.retryTimeout = setTimeout(() => {
      this.handleRetry();
    }, delay);
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: false,
      lastRetryTime: null,
    }));

    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  };

  handleManualRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    this.handleRetry();
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReport = () => {
    // Allow user to report the error
    if (this.props.onReport) {
      this.props.onReport(this.state.error, this.state.errorInfo);
    }
  };

  getErrorSeverity = () => {
    const { error } = this.state;
    if (!error) return ERROR_SEVERITY.LOW;

    // Check if it's a network error
    if (error.name === 'NetworkError' || error.message?.includes('fetch')) {
      return ERROR_SEVERITY.MEDIUM;
    }

    // Check if it's a critical rendering error
    if (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk')) {
      return ERROR_SEVERITY.HIGH;
    }

    // Default based on props
    return this.props.severity || ERROR_SEVERITY.MEDIUM;
  };

  renderRetryingState = () => {
    const delay = getRetryDelay(this.state.retryCount);
    
    return (
      <Alert variant="info" className="text-center">
        <Spinner animation="border" size="sm" className="me-2" />
        Attempting to recover... (Retry {this.state.retryCount + 1})
        <div className="mt-2">
          <Button 
            variant="outline-info" 
            size="sm" 
            onClick={this.handleManualRetry}
          >
            Retry Now
          </Button>
        </div>
      </Alert>
    );
  };

  renderErrorUI = () => {
    const { error, errorInfo, errorId, retryCount } = this.state;
    const { level = 'component', fallback } = this.props;
    const severity = this.getErrorSeverity();

    // Show retry state
    if (this.state.isRetrying) {
      return this.renderRetryingState();
    }

    // Custom fallback component
    if (fallback && typeof fallback === 'function') {
      return fallback({ error, errorInfo, retry: this.handleManualRetry });
    }

    // App-level error boundary
    if (level === 'app') {
      return (
        <div className="min-vh-100 d-flex align-items-center bg-light">
          <Container>
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <Card className="shadow">
                  <Card.Body className="text-center p-4">
                    <div className="mb-4">
                      <BsExclamationTriangle size={64} className="text-danger mb-3" />
                      <h2 className="h4 mb-2">Application Error</h2>
                      <p className="text-muted">
                        The application encountered an unexpected error and needs to be restarted.
                      </p>
                    </div>

                    <Alert variant="light" className="text-start mb-4">
                      <div className="small">
                        <strong>Error ID:</strong> {errorId}<br />
                        <strong>Message:</strong> {error?.message || 'Unknown error'}<br />
                        <strong>Severity:</strong> <span className={`text-${severity === ERROR_SEVERITY.HIGH ? 'danger' : 'warning'}`}>
                          {severity.toUpperCase()}
                        </span>
                        {retryCount > 0 && (
                          <>
                            <br />
                            <strong>Retry Attempts:</strong> {retryCount}
                          </>
                        )}
                      </div>
                    </Alert>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                      <Button 
                        variant="primary" 
                        onClick={this.handleReload}
                        className="d-flex align-items-center gap-2"
                      >
                        <BsArrowCounterclockwise />
                        Reload App
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        onClick={this.handleGoHome}
                        className="d-flex align-items-center gap-2"
                      >
                        <BsHouse />
                        Go Home
                      </Button>
                      {this.props.onReport && (
                        <Button 
                          variant="outline-info" 
                          onClick={this.handleReport}
                          className="d-flex align-items-center gap-2"
                        >
                          <BsBug />
                          Report Issue
                        </Button>
                      )}
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                      <details className="mt-4 text-start">
                        <summary className="btn btn-link p-0">
                          <BsBug className="me-1" />
                          Developer Information
                        </summary>
                        <div className="mt-2">
                          <div className="small mb-2">
                            <strong>Component Stack:</strong>
                            <pre className="small mt-1 p-2 bg-light rounded">
                              {errorInfo?.componentStack}
                            </pre>
                          </div>
                          <div className="small">
                            <strong>Error Stack:</strong>
                            <pre className="small mt-1 p-2 bg-light rounded text-danger">
                              {error?.stack}
                            </pre>
                          </div>
                        </div>
                      </details>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      );
    }

    // Layout-level error boundary
    if (level === 'layout') {
      return (
        <Container className="py-5">
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <Alert variant="danger" className="text-center">
                <BsShield size={32} className="mb-2" />
                <Alert.Heading className="h5">Page Error</Alert.Heading>
                <p className="mb-3">
                  This page encountered an error and couldn't be displayed properly.
                </p>
                
                {severity === ERROR_SEVERITY.HIGH && (
                  <Alert variant="warning" className="mb-3">
                    <small>
                      This appears to be a critical error. Please reload the page or contact support.
                    </small>
                  </Alert>
                )}

                <div className="d-flex gap-2 justify-content-center flex-wrap">
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={this.handleManualRetry}
                    className="d-flex align-items-center gap-1"
                  >
                    <BsArrowCounterclockwise size={14} />
                    Try Again
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={this.handleReload}
                    className="d-flex align-items-center gap-1"
                  >
                    <BsArrowCounterclockwise size={14} />
                    Reload Page
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={this.handleGoHome}
                    className="d-flex align-items-center gap-1"
                  >
                    <BsHouse size={14} />
                    Go Home
                  </Button>
                </div>
                
                <div className="mt-3">
                  <small className="text-muted">
                    Error ID: {errorId} | Attempts: {retryCount}
                  </small>
                </div>
              </Alert>
            </Col>
          </Row>
        </Container>
      );
    }

    // Component-level error boundary (minimal)
    return (
      <Alert variant="warning" className="m-2">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <BsExclamationTriangle className="me-2" />
            <div>
              <div className="fw-bold">Component Error</div>
              <small className="text-muted">
                {error?.message || 'An error occurred in this component'}
              </small>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-warning" 
              size="sm" 
              onClick={this.handleManualRetry}
            >
              Retry
            </Button>
            {retryCount > 2 && (
              <Button 
                variant="warning" 
                size="sm" 
                onClick={this.handleReload}
              >
                Reload
              </Button>
            )}
          </div>
        </div>
        {retryCount > 0 && (
          <div className="mt-2">
            <small className="text-muted">
              Retry attempts: {retryCount} | Error ID: {errorId}
            </small>
          </div>
        )}
      </Alert>
    );
  };

  render() {
    if (this.state.hasError) {
      return this.renderErrorUI();
    }

    return this.props.children;
  }
}

export default ErrorBoundaryEnhanced;