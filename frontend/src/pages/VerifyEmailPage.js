// frontend/src/pages/VerifyEmailPage.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Container, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { BsCheckCircleFill, BsXCircleFill, BsEnvelopeFill } from 'react-icons/bs';
import api from '../services/api';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState('verifying'); // verifying, success, error, expired
  const [errorMessage, setErrorMessage] = useState('');
  const [resendState, setResendState] = useState('idle'); // idle, sending, sent, error
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setVerificationState('error');
      setErrorMessage('No verification token provided');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await api.client.post('/auth/verify-email', { token });
      
      if (response.data.success) {
        setVerificationState('success');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Email verified successfully! You can now log in.' } 
          });
        }, 3000);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      setErrorMessage(message);
      
      if (message.includes('expired')) {
        setVerificationState('expired');
      } else {
        setVerificationState('error');
      }
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setErrorMessage('Please enter your email address');
      setVerificationState('error');
      return;
    }

    setResendState('sending');
    
    try {
      const response = await api.client.post('/auth/resend-verification', { email });
      
      if (response.data.success) {
        setResendState('sent');
      }
    } catch (error) {
      setResendState('error');
      setErrorMessage(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="shadow">
            <Card.Body className="text-center p-5">
              {/* Verifying State */}
              {verificationState === 'verifying' && (
                <>
                  <Spinner animation="border" variant="primary" className="mb-3" />
                  <h3>Verifying your email...</h3>
                  <p className="text-muted">Please wait while we verify your email address.</p>
                </>
              )}

              {/* Success State */}
              {verificationState === 'success' && (
                <>
                  <BsCheckCircleFill size={60} className="text-success mb-3" />
                  <h3 className="text-success">Email Verified!</h3>
                  <p>Your email has been successfully verified.</p>
                  <p className="text-muted">Redirecting to login page...</p>
                  <Link to="/login" className="btn btn-primary mt-3">
                    Go to Login
                  </Link>
                </>
              )}

              {/* Error State */}
              {verificationState === 'error' && (
                <>
                  <BsXCircleFill size={60} className="text-danger mb-3" />
                  <h3 className="text-danger">Verification Failed</h3>
                  <p>{errorMessage}</p>
                  <Link to="/login" className="btn btn-primary mt-3">
                    Go to Login
                  </Link>
                </>
              )}

              {/* Expired Token State */}
              {verificationState === 'expired' && (
                <>
                  <BsEnvelopeFill size={60} className="text-warning mb-3" />
                  <h3 className="text-warning">Token Expired</h3>
                  <p>{errorMessage}</p>
                  
                  {resendState === 'idle' && (
                    <div className="mt-4">
                      <p>Enter your email to receive a new verification link:</p>
                      <div className="form-group">
                        <input
                          type="email"
                          className="form-control"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="primary" 
                        onClick={handleResendVerification}
                        className="mt-2"
                      >
                        Resend Verification Email
                      </Button>
                    </div>
                  )}

                  {resendState === 'sending' && (
                    <div className="mt-4">
                      <Spinner animation="border" size="sm" /> Sending...
                    </div>
                  )}

                  {resendState === 'sent' && (
                    <Alert variant="success" className="mt-4">
                      Verification email sent! Please check your inbox.
                    </Alert>
                  )}

                  {resendState === 'error' && (
                    <Alert variant="danger" className="mt-4">
                      {errorMessage}
                    </Alert>
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

export default VerifyEmailPage;