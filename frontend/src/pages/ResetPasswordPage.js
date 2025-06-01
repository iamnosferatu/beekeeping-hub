// frontend/src/pages/ResetPasswordPage.js
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { BsLockFill, BsCheckCircleFill, BsEyeFill, BsEyeSlashFill } from 'react-icons/bs';
import api from '../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validated, setValidated] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Check password match
    if (name === 'password') {
      setPasswordMatch(value === formData.confirmPassword || formData.confirmPassword === '');
    } else if (name === 'confirmPassword') {
      setPasswordMatch(formData.password === value || value === '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false);
      return;
    }

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.client.post('/auth/reset-password', {
        token,
        password: formData.password
      });
      
      if (response.data.success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Password reset successfully! You can now log in with your new password.' } 
          });
        }, 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to reset password. Please try again.');
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
              <h4 className="mb-0">Set New Password</h4>
            </Card.Header>
            
            <Card.Body>
              {success ? (
                // Success message
                <div className="text-center py-4">
                  <BsCheckCircleFill size={60} className="text-success mb-3" />
                  <h5 className="text-success">Password Reset Successfully!</h5>
                  <p className="mb-4">
                    Your password has been updated. You will be redirected to the login page...
                  </p>
                  <Button variant="primary" onClick={() => navigate('/login')}>
                    Go to Login
                  </Button>
                </div>
              ) : (
                // Form
                <>
                  {error && (
                    <Alert variant="danger" dismissible onClose={() => setError('')}>
                      {error}
                    </Alert>
                  )}

                  {!token ? (
                    <div className="text-center py-4">
                      <p className="text-danger">Invalid password reset link.</p>
                      <Button variant="primary" onClick={() => navigate('/forgot-password')}>
                        Request New Reset Link
                      </Button>
                    </div>
                  ) : (
                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                      <Form.Group className="mb-3">
                        <Form.Label>New Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Enter new password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            disabled={loading}
                          />
                          <Button 
                            variant="outline-secondary"
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                          >
                            {showPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            Password must be at least 8 characters long.
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Confirm New Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            isInvalid={!passwordMatch && formData.confirmPassword !== ''}
                            disabled={loading}
                          />
                          <Button 
                            variant="outline-secondary"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            tabIndex={-1}
                          >
                            {showConfirmPassword ? <BsEyeSlashFill /> : <BsEyeFill />}
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            Passwords do not match.
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>

                      <div className="d-grid">
                        <Button 
                          variant="primary" 
                          type="submit" 
                          disabled={loading || !passwordMatch}
                        >
                          {loading ? (
                            <>
                              <Spinner size="sm" animation="border" className="me-2" />
                              Resetting Password...
                            </>
                          ) : (
                            <>
                              <BsLockFill className="me-2" />
                              Reset Password
                            </>
                          )}
                        </Button>
                      </div>
                    </Form>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ResetPasswordPage;