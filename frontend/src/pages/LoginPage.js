// frontend/src/pages/LoginPage.js
import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Button, Card, Alert } from "react-bootstrap";
import AuthContext from "../contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validated, setValidated] = useState(false);

  const { login, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by AuthContext
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-page py-5">
      <Card className="mx-auto" style={{ maxWidth: "500px" }}>
        <Card.Header className="bg-primary text-white text-center">
          <h4 className="mb-0">Login to BeeKeeper's Blog</h4>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger" onClose={clearError} dismissible>
              {error}
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
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid email.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid password (minimum 8 characters).
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" size="lg">
                Login
              </Button>
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
