// frontend/src/components/common/ComponentErrorBoundary.js
import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { BsExclamationTriangle, BsArrowCounterclockwise } from 'react-icons/bs';

/**
 * ComponentErrorBoundary - Lightweight error boundary for individual components
 * 
 * Provides minimal error UI for component-level errors without
 * affecting the rest of the page layout.
 */
class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Component Error: ${this.props.componentName || 'Unknown'}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // Store error for debugging
    try {
      const errorData = {
        type: 'component',
        component: this.props.componentName || 'Unknown',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      };

      const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      errors.push(errorData);
      localStorage.setItem('app_errors', JSON.stringify(errors.slice(-10)));
    } catch (e) {
      // Silently fail
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const { fallback, componentName, showRetry = true } = this.props;

      // Custom fallback UI
      if (fallback) {
        return typeof fallback === 'function' 
          ? fallback(this.state.error, this.handleRetry)
          : fallback;
      }

      // Default minimal error UI
      return (
        <Alert variant="warning" className="m-2">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <BsExclamationTriangle className="me-2" />
              <span>
                {componentName ? `${componentName} error` : 'Component error'}
              </span>
            </div>
            {showRetry && (
              <Button 
                variant="outline-warning" 
                size="sm" 
                onClick={this.handleRetry}
                className="d-flex align-items-center gap-1"
              >
                <BsArrowCounterclockwise size={12} />
                Retry
              </Button>
            )}
          </div>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ComponentErrorBoundary;