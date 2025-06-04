// frontend/src/hooks/useErrorDisplay.examples.js
import React, { useState } from "react";
import { Container, Button, Card, Form, Row, Col } from "react-bootstrap";
import { useErrorDisplay, useApiErrorDisplay } from "./useErrorDisplay";
import ErrorAlert from "../components/common/ErrorAlert";
import apiService from "../services/api";

/**
 * useErrorDisplay Usage Examples
 * 
 * This file demonstrates various use cases for the useErrorDisplay hook
 * and ErrorAlert component integration
 */

// Example 1: Basic Error Display
export const BasicErrorExample = () => {
  const { error, setError, clearError } = useErrorDisplay();
  
  return (
    <Card className="mb-4">
      <Card.Header>Basic Error Display</Card.Header>
      <Card.Body>
        <ErrorAlert 
          error={error} 
          onDismiss={clearError}
        />
        
        <div className="d-flex gap-2">
          <Button 
            variant="danger" 
            onClick={() => setError("This is a simple error message")}
          >
            Show Error
          </Button>
          <Button 
            variant="secondary" 
            onClick={clearError}
          >
            Clear Error
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

// Example 2: Auto-dismiss Error
export const AutoDismissExample = () => {
  const { error, setError, clearError } = useErrorDisplay({
    autoDismissTimeout: 5000 // 5 seconds
  });
  
  return (
    <Card className="mb-4">
      <Card.Header>Auto-dismiss Error (5 seconds)</Card.Header>
      <Card.Body>
        <ErrorAlert 
          error={error} 
          onDismiss={clearError}
        />
        
        <Button 
          variant="warning" 
          onClick={() => setError("This error will auto-dismiss in 5 seconds")}
        >
          Show Auto-dismiss Error
        </Button>
      </Card.Body>
    </Card>
  );
};

// Example 3: Error with Retry
export const ErrorWithRetryExample = () => {
  const { error, setError, clearError, withRetry } = useErrorDisplay();
  const [attempts, setAttempts] = useState(0);
  
  const riskyOperation = async () => {
    setAttempts(prev => prev + 1);
    if (attempts < 2) {
      throw new Error(`Operation failed (attempt ${attempts + 1})`);
    }
    alert("Success!");
  };
  
  const handleRetry = withRetry(riskyOperation);
  
  return (
    <Card className="mb-4">
      <Card.Header>Error with Retry Function</Card.Header>
      <Card.Body>
        <ErrorAlert 
          error={error} 
          onDismiss={clearError}
          onRetry={handleRetry}
        />
        
        <div className="d-flex justify-content-between align-items-center">
          <Button 
            variant="primary" 
            onClick={handleRetry}
          >
            Try Risky Operation
          </Button>
          <small className="text-muted">Attempts: {attempts}</small>
        </div>
      </Card.Body>
    </Card>
  );
};

// Example 4: Multiple Errors
export const MultipleErrorsExample = () => {
  const { errors, setError, clearErrorById, clearErrors } = useErrorDisplay({
    maxErrors: 5
  });
  
  const addError = () => {
    const errorTypes = [
      { message: "Network connection failed", type: "network" },
      { message: "Invalid form data", type: "validation" },
      { message: "You don't have permission", type: "permission" },
      { message: "Server error occurred", type: "server" },
      { message: "Request timeout", type: "timeout" }
    ];
    
    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    setError(randomError);
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>Multiple Errors Display</Card.Header>
      <Card.Body>
        <ErrorAlert 
          errors={errors}
          onDismiss={clearErrorById}
          showIcon
          maxDisplay={3}
        />
        
        <div className="d-flex gap-2">
          <Button variant="danger" onClick={addError}>
            Add Random Error
          </Button>
          <Button variant="secondary" onClick={clearErrors}>
            Clear All
          </Button>
          <span className="ms-auto text-muted">
            Errors: {errors.length}
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

// Example 5: API Error Handling
export const ApiErrorExample = () => {
  const { error, setApiError, clearError } = useApiErrorDisplay();
  const [loading, setLoading] = useState(false);
  
  const simulateApiError = async (statusCode) => {
    setLoading(true);
    clearError();
    
    // Simulate API error
    setTimeout(() => {
      const error = {
        response: {
          status: statusCode,
          data: {
            message: getErrorMessageForStatus(statusCode),
            error: "Simulated error",
            details: {
              timestamp: new Date().toISOString(),
              path: "/api/test",
              method: "GET"
            }
          }
        }
      };
      
      setApiError(error);
      setLoading(false);
    }, 1000);
  };
  
  const getErrorMessageForStatus = (status) => {
    const messages = {
      400: "Bad request - Invalid input data",
      401: "Authentication required",
      403: "You don't have permission to access this resource",
      404: "The requested resource was not found",
      422: "Validation failed for the submitted data",
      429: "Too many requests - Please try again later",
      500: "Internal server error",
      503: "Service temporarily unavailable"
    };
    return messages[status] || "An error occurred";
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>API Error Handling</Card.Header>
      <Card.Body>
        <ErrorAlert.presets.api
          errorObject={error}
          onDismiss={clearError}
        />
        
        <div className="d-flex flex-wrap gap-2">
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => simulateApiError(400)}
            disabled={loading}
          >
            400 Bad Request
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => simulateApiError(401)}
            disabled={loading}
          >
            401 Unauthorized
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => simulateApiError(403)}
            disabled={loading}
          >
            403 Forbidden
          </Button>
          <Button 
            variant="outline-warning" 
            size="sm"
            onClick={() => simulateApiError(404)}
            disabled={loading}
          >
            404 Not Found
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => simulateApiError(500)}
            disabled={loading}
          >
            500 Server Error
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

// Example 6: Form Validation Errors
export const FormValidationExample = () => {
  const { errors, setError, clearErrors, replaceError } = useErrorDisplay({
    maxErrors: 10
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  
  const validateForm = () => {
    clearErrors();
    let hasErrors = false;
    
    if (!formData.email) {
      setError({ 
        message: "Email is required", 
        type: "validation",
        field: "email" 
      });
      hasErrors = true;
    } else if (!formData.email.includes('@')) {
      setError({ 
        message: "Invalid email format", 
        type: "validation",
        field: "email" 
      });
      hasErrors = true;
    }
    
    if (!formData.password) {
      setError({ 
        message: "Password is required", 
        type: "validation",
        field: "password" 
      });
      hasErrors = true;
    } else if (formData.password.length < 8) {
      setError({ 
        message: "Password must be at least 8 characters", 
        type: "validation",
        field: "password" 
      });
      hasErrors = true;
    }
    
    if (!formData.username) {
      setError({ 
        message: "Username is required", 
        type: "validation",
        field: "username" 
      });
      hasErrors = true;
    }
    
    return !hasErrors;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      replaceError({
        message: "Form submitted successfully!",
        type: "success",
        variant: "success"
      });
    }
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>Form Validation Errors</Card.Header>
      <Card.Body>
        <ErrorAlert.presets.validation
          errors={errors}
          onDismiss={() => {}}
          dismissible={false}
        />
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              isInvalid={errors.some(e => e.metadata?.field === 'email')}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              isInvalid={errors.some(e => e.metadata?.field === 'username')}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              isInvalid={errors.some(e => e.metadata?.field === 'password')}
            />
          </Form.Group>
          
          <Button type="submit" variant="primary">
            Validate & Submit
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

// Example 7: Error with Custom Actions
export const CustomActionsExample = () => {
  const { error, setError, clearError } = useErrorDisplay();
  
  const showErrorWithActions = () => {
    setError({
      message: "Your session has expired. Please log in again.",
      type: "auth",
      actions: [
        {
          label: "Go to Login",
          onClick: () => {
            alert("Redirecting to login...");
            clearError();
          },
          variant: "primary"
        },
        {
          label: "Stay Here",
          onClick: clearError,
          variant: "outline-secondary"
        }
      ]
    });
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>Error with Custom Actions</Card.Header>
      <Card.Body>
        <ErrorAlert 
          errorObject={error}
          onDismiss={clearError}
          showIcon
        />
        
        <Button variant="warning" onClick={showErrorWithActions}>
          Show Session Expired Error
        </Button>
      </Card.Body>
    </Card>
  );
};

// Example 8: Error History Tracking
export const ErrorHistoryExample = () => {
  const { 
    error, 
    errorHistory, 
    setError, 
    clearError, 
    clearHistory 
  } = useErrorDisplay({
    trackHistory: true,
    autoDismissTimeout: 3000
  });
  
  const errorMessages = [
    "Failed to load user data",
    "Network connection lost",
    "Invalid API response",
    "Permission denied",
    "Session timeout"
  ];
  
  const addRandomError = () => {
    const message = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    setError(message);
  };
  
  return (
    <Card className="mb-4">
      <Card.Header>Error History Tracking</Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <h6>Current Error</h6>
            <ErrorAlert 
              error={error}
              onDismiss={clearError}
            />
            
            <Button variant="danger" onClick={addRandomError}>
              Add Random Error
            </Button>
          </Col>
          
          <Col md={6}>
            <h6>Error History ({errorHistory.length})</h6>
            {errorHistory.length === 0 ? (
              <p className="text-muted">No errors recorded</p>
            ) : (
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {errorHistory.map((err, index) => (
                  <div key={err.id} className="mb-2 p-2 border rounded">
                    <small className="text-muted">
                      {new Date(err.timestamp).toLocaleTimeString()}
                    </small>
                    <div>{err.message}</div>
                  </div>
                ))}
              </div>
            )}
            
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={clearHistory}
              disabled={errorHistory.length === 0}
              className="mt-2"
            >
              Clear History
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Main examples component
export const UseErrorDisplayExamples = () => {
  return (
    <Container className="py-4">
      <h1 className="mb-4">useErrorDisplay Hook Examples</h1>
      
      <BasicErrorExample />
      <AutoDismissExample />
      <ErrorWithRetryExample />
      <MultipleErrorsExample />
      <ApiErrorExample />
      <FormValidationExample />
      <CustomActionsExample />
      <ErrorHistoryExample />
    </Container>
  );
};

export default UseErrorDisplayExamples;