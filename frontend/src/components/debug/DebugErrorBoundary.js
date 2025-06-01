// frontend/src/components/debug/DebugErrorBoundary.js

import React from 'react';
import { Alert, Button, Card } from 'react-bootstrap';
import { BsExclamationTriangle } from 'react-icons/bs';

class DebugErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error for debugging
    console.error('Debug component error:', error);
    console.error('Error info:', errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="border-danger">
          <Card.Body>
            <Alert variant="danger">
              <div className="d-flex align-items-center mb-3">
                <BsExclamationTriangle className="me-2" size={24} />
                <Alert.Heading className="mb-0">Debug Component Error</Alert.Heading>
              </div>
              
              <p>
                The cache monitor encountered an error. This is usually due to:
              </p>
              
              <ul>
                <li>Missing React Query setup</li>
                <li>Component import issues</li>
                <li>Browser compatibility problems</li>
              </ul>

              <hr />
              
              <div className="mb-3">
                <strong>Error Details:</strong>
                <pre className="mt-2 p-2 bg-light border rounded small">
                  {this.state.error && this.state.error.toString()}
                </pre>
              </div>

              <div className="d-flex gap-2">
                <Button variant="outline-danger" onClick={this.handleRetry}>
                  Try Again
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </Alert>

            <Card className="mt-3">
              <Card.Header>
                <h6 className="mb-0">Alternative: Manual Cache Inspection</h6>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  You can still inspect the cache manually using browser console:
                </p>
                <pre className="bg-light p-2 border rounded small">
{`// Open browser console (F12) and run:
console.log('React Query Cache:', window.__REACT_QUERY_CACHE__);

// Or check if QueryClient is available:
if (window.queryClient) {
  console.log('Cache stats:', window.queryClient.getQueryCache().getAll());
}`}
                </pre>
              </Card.Body>
            </Card>
          </Card.Body>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default DebugErrorBoundary;