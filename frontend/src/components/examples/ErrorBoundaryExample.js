// frontend/src/components/examples/ErrorBoundaryExample.js
import React, { useState } from 'react';
import { Button, Card, Container, Row, Col } from 'react-bootstrap';
import ComponentErrorBoundary from '../common/ComponentErrorBoundary';
import { useErrorHandler } from '../../hooks/useErrorHandler';

/**
 * ErrorBoundaryExample - Demonstrates error boundary usage
 * 
 * Shows how to use different types of error boundaries and
 * error handling patterns throughout the application.
 */

// Component that can throw errors for testing
const ProblematicComponent = ({ shouldThrow }) => {
  const { handleError } = useErrorHandler();

  if (shouldThrow === 'render') {
    throw new Error('Render error - component failed to render');
  }

  const handleAsyncError = async () => {
    try {
      // Simulate async operation that fails
      throw new Error('Async operation failed');
    } catch (error) {
      const message = handleError(error, { 
        operation: 'fetch data',
        component: 'ProblematicComponent' 
      });
      alert(`Handled error: ${message}`);
    }
  };

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>Test Component</Card.Title>
        <Card.Text>
          This component is working normally.
        </Card.Text>
        <Button variant="danger" onClick={handleAsyncError}>
          Trigger Async Error
        </Button>
      </Card.Body>
    </Card>
  );
};

const ErrorBoundaryExample = () => {
  const [errorType, setErrorType] = useState(null);

  return (
    <Container className="py-4">
      <h2 className="mb-4">Error Boundary Examples</h2>
      
      <Row>
        <Col md={6}>
          <h4>Component Error Boundary</h4>
          <p>Wraps individual components to prevent errors from breaking the page.</p>
          
          <ComponentErrorBoundary 
            componentName="ProblematicComponent"
            fallback={(error, retry) => (
              <Card className="border-danger">
                <Card.Body className="text-center">
                  <h6 className="text-danger">Custom Error UI</h6>
                  <p>Error: {error.message}</p>
                  <Button variant="outline-danger" size="sm" onClick={retry}>
                    Try Again
                  </Button>
                </Card.Body>
              </Card>
            )}
          >
            <ProblematicComponent shouldThrow={errorType} />
          </ComponentErrorBoundary>

          <div className="mt-3">
            <h6>Test Error Types:</h6>
            <div className="d-flex gap-2 flex-wrap">
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => setErrorType('render')}
              >
                Render Error
              </Button>
              <Button 
                variant="outline-success" 
                size="sm"
                onClick={() => setErrorType(null)}
              >
                Reset
              </Button>
            </div>
          </div>
        </Col>

        <Col md={6}>
          <h4>Error Handling Best Practices</h4>
          
          <Card>
            <Card.Body>
              <Card.Title className="h6">Hierarchy</Card.Title>
              <ul className="small mb-0">
                <li><strong>App Level:</strong> Catches all unhandled errors</li>
                <li><strong>Layout Level:</strong> Catches page/section errors</li>
                <li><strong>Component Level:</strong> Catches specific component errors</li>
              </ul>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Body>
              <Card.Title className="h6">Error Types</Card.Title>
              <ul className="small mb-0">
                <li><strong>Render Errors:</strong> Caught by Error Boundaries</li>
                <li><strong>Async Errors:</strong> Handled by useErrorHandler hook</li>
                <li><strong>Global Errors:</strong> Caught by window event listeners</li>
                <li><strong>Promise Rejections:</strong> Caught by unhandledrejection</li>
              </ul>
            </Card.Body>
          </Card>

          <Card className="mt-3">
            <Card.Body>
              <Card.Title className="h6">Error Storage</Card.Title>
              <p className="small mb-2">
                Errors are stored in localStorage for debugging:
              </p>
              <Button 
                variant="outline-info" 
                size="sm"
                onClick={() => {
                  const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
                  console.table(errors);
                  alert(`Found ${errors.length} stored errors. Check console for details.`);
                }}
              >
                View Stored Errors
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Card className="bg-light">
            <Card.Body>
              <Card.Title className="h6">Development Notes</Card.Title>
              <ul className="small mb-0">
                <li>Error boundaries only catch errors during rendering, in lifecycle methods, and in constructors</li>
                <li>They do NOT catch errors in event handlers, async code, or errors thrown in the error boundary itself</li>
                <li>Use the useErrorHandler hook for async operations and event handlers</li>
                <li>In development, you'll see the React error overlay - in production, users see the fallback UI</li>
                <li>All errors are logged to localStorage for debugging purposes</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ErrorBoundaryExample;