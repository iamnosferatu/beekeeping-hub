// frontend/src/pages/LoginPage.js
import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { useResendVerification } from "../hooks/queries/useAuth";
import AuthContext from "../contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [validated, setValidated] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { login, clearError, loading } = useContext(AuthContext);
  
  // React Query mutations
  const resendVerificationMutation = useResendVerification();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      // This would be set after successful email verification
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError(null);
    setNeedsVerification(false);

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      await login(email, password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      // Check if it's an email verification error
      if (err.message?.includes('verify') || err.message?.includes('verification')) {
        setNeedsVerification(true);
      } else {
        setLocalError(err.message || 'Login failed. Please try again.');
      }
    }
  };

  const handleResendVerification = async () => {
    setLocalError(null);
    
    resendVerificationMutation.mutate(email, {
      onSuccess: () => {
        setVerificationSent(true);
        setTimeout(() => setVerificationSent(false), 5000);
      },
      onError: (error) => {
        setLocalError(error.message || 'Failed to resend verification email');
      },
    });
  };

  return (
    <div className="login-page py-5">
      <Card className="mx-auto" style={{ maxWidth: "500px" }}>
        <Card.Header className="bg-primary text-white text-center">
          <h4 className="mb-0">Login to BeeKeeper's Blog</h4>
        </Card.Header>

        <Card.Body>
          {/* Success message from email verification */}
          {location.state?.message && (
            <Alert variant="success">
              {location.state.message}
            </Alert>
          )}

          {/* Error messages */}

          {localError && (
            <Alert variant="danger" onClose={() => setLocalError(null)} dismissible>
              {localError}
            </Alert>
          )}

          {/* Email verification needed alert */}
          {needsVerification && (
            <Alert variant="warning">
              <Alert.Heading>Email Verification Required</Alert.Heading>
              <p>Please verify your email before logging in. Check your inbox for the verification link.</p>
              <hr />
              <div className="d-flex justify-content-between align-items-center">
                <span>Didn't receive the email?</span>
                <Button 
                  variant="warning" 
                  size="sm" 
                  onClick={handleResendVerification}
                  disabled={resendVerificationMutation.isPending}
                >
                  {resendVerificationMutation.isPending ? (
                    <>
                      <Spinner size="sm" animation="border" className="me-2" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </Button>
              </div>
            </Alert>
          )}

          {/* Verification sent confirmation */}
          {verificationSent && (
            <Alert variant="success">
              Verification email sent! Please check your inbox.
            </Alert>
          )}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid email.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                minLength={8}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid password (minimum 8 characters).
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="rememberMe">
              <Form.Check
                type="checkbox"
                id="rememberMe"
                label="Remember me for 30 days"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
            </Form.Group>

            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" animation="border" className="me-2" />
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </Button>
            </div>

            <div className="text-center mt-3">
              <Link to="/forgot-password" className="text-decoration-none">
                Forgot your password?
              </Link>
            </div>
          </Form>
        </Card.Body>

        <Card.Footer className="text-center">
          <p className="mb-0">
            Don't have an account? <Link to="/register">Register</Link>
          </p>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default LoginPage;
