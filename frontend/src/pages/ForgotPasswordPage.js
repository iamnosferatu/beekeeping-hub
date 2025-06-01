// frontend/src/pages/ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { BsEnvelopeFill, BsArrowLeft } from 'react-icons/bs';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.client.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="shadow">
            <Card.Header className="bg-primary text-white text-center">
              <h4 className="mb-0">Reset Your Password</h4>
            </Card.Header>
            
            <Card.Body>
              {success ? (
                // Success message
                <div className="text-center py-4">
                  <BsEnvelopeFill size={60} className="text-success mb-3" />
                  <h5 className="text-success">Check Your Email</h5>
                  <p className="mb-4">
                    If an account exists with <strong>{email}</strong>, we've sent you 
                    instructions to reset your password.
                  </p>
                  <p className="text-muted">
                    Please check your email and follow the link to reset your password. 
                    The link will expire in 1 hour.
                  </p>
                  <hr />
                  <Link to="/login" className="btn btn-primary">
                    Back to Login
                  </Link>
                </div>
              ) : (
                // Form
                <>
                  <p className="text-muted mb-4">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>

                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                      {error}
                    </Alert>
                  )}

                  <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                      />
                      <Form.Control.Feedback type="invalid">
                        Please provide a valid email address.
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid gap-2">
                      <Button 
                        variant="primary" 
                        type="submit" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" animation="border" className="me-2" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Instructions'
                        )}
                      </Button>
                    </div>
                  </Form>

                  <hr className="my-4" />

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      <BsArrowLeft className="me-1" />
                      Back to Login
                    </Link>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ForgotPasswordPage;