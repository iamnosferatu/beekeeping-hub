// frontend/src/pages/RegisterPage.js
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Card, Alert, Row, Col } from "react-bootstrap";
import { BsEnvelopeFill } from "react-icons/bs";
import AuthContext from "../contexts/AuthContext";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [validated, setValidated] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { register, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Check password match when either password field changes
    if (name === "password" || name === "confirmPassword") {
      if (name === "password") {
        setPasswordMatch(
          value === formData.confirmPassword || formData.confirmPassword === ""
        );
      } else {
        setPasswordMatch(formData.password === value || value === "");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      return;
    }

    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      // Show success message instead of redirecting
      setRegistrationSuccess(true);
    } catch (err) {
      // Error is handled by AuthContext
      // Registration error handled by AuthContext
    }
  };

  return (
    <div className="register-page py-5">
      <Card className="mx-auto" style={{ maxWidth: "800px" }}>
        {registrationSuccess ? (
          // Success message
          <Card.Body className="text-center py-5">
            <BsEnvelopeFill size={60} className="text-success mb-3" />
            <h3 className="text-success mb-3">Registration Successful!</h3>
            <p className="lead">
              We've sent a verification email to <strong>{formData.email}</strong>
            </p>
            <p>
              Please check your inbox and click the verification link to activate your account.
            </p>
            <hr className="my-4" />
            <p className="text-muted">
              Didn't receive the email? Check your spam folder or{" "}
              <Link to="/login">go to login</Link> to resend the verification email.
            </p>
          </Card.Body>
        ) : (
          <>
        <Card.Header className="bg-primary text-white text-center">
          <h4 className="mb-0">Register for BeeKeeper's Blog</h4>
        </Card.Header>

        <Card.Body>
          {error && (
            <Alert variant="danger" onClose={clearError} dismissible>
              {error}
            </Alert>
          )}

          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a valid email.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="username">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Choose a username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">
                    Username must be between 3 and 50 characters.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="firstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide your first name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="lastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide your last name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    isInvalid={validated && !passwordMatch}
                  />
                  <Form.Control.Feedback type="invalid">
                    Password must be at least 8 characters.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3" controlId="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                    isInvalid={validated && !passwordMatch}
                  />
                  <Form.Control.Feedback type="invalid">
                    Passwords do not match.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-grid mt-3">
              <Button variant="primary" type="submit" size="lg">
                Register
              </Button>
            </div>
          </Form>
        </Card.Body>

        <Card.Footer className="text-center">
          <p className="mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </Card.Footer>
        </>
        )}
      </Card>
    </div>
  );
};

export default RegisterPage;

