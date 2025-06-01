// frontend/src/components/common/ErrorBoundary.js
import React from 'react';
import { Card, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { BsExclamationTriangle, BsArrowCounterclockwise, BsHouse } from 'react-icons/bs';

/**
 * ErrorBoundary - Catches JavaScript errors in component tree
 * 
 * Provides graceful error handling with user-friendly fallback UI,
 * error reporting, and recovery options. Prevents app crashes.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Capture error details
    this.setState({
      error,
      errorInfo,
      eventId: this.generateEventId(),
    });

    // Log error for debugging (in development)
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // In production, you would send this to an error reporting service
    this.reportError(error, errorInfo);
  }

  generateEventId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  reportError = (error, errorInfo) => {
    // In a real application, send to error reporting service
    // Examples: Sentry, LogRocket, Bugsnag, etc.
    
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.props.userId || 'anonymous',
      buildVersion: process.env.REACT_APP_VERSION || 'unknown',
      eventId: this.state.eventId,
    };

    // Example: Send to analytics or error service
    if (process.env.NODE_ENV === 'production') {
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport),
      // }).catch(() => {
      //   // Silently fail - don't cause more errors
      // });
    }

    // Store in localStorage for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorReport);
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('app_errors', JSON.stringify(recentErrors));
    } catch (e) {
      // localStorage might be full or unavailable
    }
  };

  handleRetry = () => {
    // Reset error state to retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    });
  };

  handleReload = () => {
    // Reload the entire page
    window.location.reload();
  };

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, eventId } = this.state;
      const { level = 'page', children } = this.props;

      // Different fallback UIs based on error boundary level
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
                          Something went wrong and the application couldn't load properly.
                        </p>
                      </div>

                      <Alert variant="light" className="text-start mb-4">
                        <div className="small">
                          <strong>Error ID:</strong> {eventId}<br />
                          <strong>Message:</strong> {error?.message || 'Unknown error'}
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
                      </div>

                      {process.env.NODE_ENV === 'development' && (
                        <details className="mt-4 text-start">
                          <summary className="btn btn-link p-0">Show Error Details (Development)</summary>
                          <pre className="small mt-2 p-2 bg-light rounded text-danger">
                            {error?.stack}
                          </pre>
                          <pre className="small mt-2 p-2 bg-light rounded">
                            {errorInfo?.componentStack}
                          </pre>
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
              <Col md={8}>
                <Alert variant="danger" className="text-center">
                  <BsExclamationTriangle size={32} className="mb-2" />
                  <Alert.Heading className="h5">Page Error</Alert.Heading>
                  <p className="mb-3">
                    This page encountered an error and couldn't be displayed properly.
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={this.handleRetry}
                      className="d-flex align-items-center gap-1"
                    >
                      <BsArrowCounterclockwise size={14} />
                      Try Again
                    </Button>
                    <Button 
                      variant="danger" 
                      size="sm" 
                      onClick={this.handleGoHome}
                      className="d-flex align-items-center gap-1"
                    >
                      <BsHouse size={14} />
                      Go Home
                    </Button>
                  </div>
                  {eventId && (
                    <div className="mt-2">
                      <small className="text-muted">Error ID: {eventId}</small>
                    </div>
                  )}
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
            <div>
              <BsExclamationTriangle className="me-2" />
              Component error occurred
            </div>
            <Button 
              variant="outline-warning" 
              size="sm" 
              onClick={this.handleRetry}
            >
              Retry
            </Button>
          </div>
        </Alert>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;