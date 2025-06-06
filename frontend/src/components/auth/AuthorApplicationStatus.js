// frontend/src/components/auth/AuthorApplicationStatus.js
import React, { useState, useContext } from 'react';
import { 
  Card, 
  Button, 
  Alert, 
  Spinner,
  Modal,
  Row,
  Col,
  Badge
} from 'react-bootstrap';
import { 
  BsCheckCircle, 
  BsClockHistory, 
  BsXCircle, 
  BsPlusCircle,
  BsEye,
  BsExclamationTriangle
} from 'react-icons/bs';
import moment from 'moment';
import { 
  useCanApplyForAuthor, 
  useMyAuthorApplication 
} from '../../hooks/queries/useAuthorApplications';
import AuthorApplicationForm from './AuthorApplicationForm';
import AuthContext from '../../contexts/AuthContext';
import StatusBadge, { StatusTypes } from '../common/StatusBadge';

/**
 * AuthorApplicationStatus Component
 * 
 * Shows the user's current author application status and provides actions:
 * - Apply button if eligible
 * - Status display if application exists
 * - Application details modal
 */
const AuthorApplicationStatus = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Only run queries if user is authenticated
  const { 
    data: canApplyData, 
    isLoading: isCheckingEligibility, 
    error: canApplyError 
  } = useCanApplyForAuthor(isAuthenticated && !!user);
  const { 
    data: application, 
    isLoading: isLoadingApplication, 
    error: applicationError,
    refetch: refetchApplication 
  } = useMyAuthorApplication(isAuthenticated && !!user);

  // Don't show anything if user is not authenticated
  if (!isAuthenticated || !user) {
    return null;
  }


  const handleApplicationSuccess = () => {
    // Refetch application status after successful submission
    refetchApplication();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          variant: 'warning',
          icon: <BsClockHistory size={16} className="me-1" />,
          text: 'Under Review',
          description: 'Your application is being reviewed by our administrators.'
        };
      case 'approved':
        return {
          variant: 'success',
          icon: <BsCheckCircle size={16} className="me-1" />,
          text: 'Approved',
          description: 'Congratulations! Your author application has been approved.'
        };
      case 'rejected':
        return {
          variant: 'danger',
          icon: <BsXCircle size={16} className="me-1" />,
          text: 'Not Approved',
          description: 'Your application was not approved at this time.'
        };
      default:
        return {
          variant: 'secondary',
          icon: null,
          text: status,
          description: ''
        };
    }
  };

  // Show errors if they occur - but provide fallback for user role
  if (canApplyError || applicationError) {
    const error = canApplyError || applicationError;
    const isAuthError = error?.message?.includes('Authentication') || 
                       error?.message?.includes('401') ||
                       error?.message?.includes('session has expired') ||
                       error?.type === 'AUTH_ERROR';
    
    // If it's an auth error and user has 'user' role, show apply option with warning
    if (isAuthError && user && user.role === 'user') {
      return (
        <>
          <Card className="mb-4 border-warning">
            <Card.Body>
              <Alert variant="warning" className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <BsExclamationTriangle className="me-2" />
                  <h6 className="mb-0">Session Issue Detected</h6>
                </div>
                <p className="mb-2">There's an issue with your session. You may need to log in again.</p>
                <small className="text-muted">
                  You can still apply to become an author, but you may need to log in again first.
                </small>
              </Alert>
              
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="mb-1 text-primary">
                    <BsPlusCircle size={20} className="me-2" />
                    Become an Author
                  </h5>
                  <p className="mb-0 text-muted">
                    Share your beekeeping knowledge with our community.
                  </p>
                </div>
                <Button 
                  variant="primary" 
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply Now
                </Button>
              </div>
            </Card.Body>
          </Card>

          <AuthorApplicationForm
            show={showApplicationForm}
            onHide={() => setShowApplicationForm(false)}
            onSuccess={handleApplicationSuccess}
          />
        </>
      );
    }
    
    // For other errors, show error message
    return (
      <Card className="mb-4 border-danger">
        <Card.Body>
          <Alert variant="danger">
            <div className="d-flex align-items-center mb-2">
              <BsExclamationTriangle className="me-2" />
              <h6 className="mb-0">Unable to check author application status</h6>
            </div>
            
            <p className="mb-2">There was an error checking your author application status:</p>
            <small className="text-muted">
              {error?.message || 'Unknown error occurred'}
            </small>
            
            <div className="mt-3">
              <Button 
                variant="outline-danger"
                size="sm"
                onClick={() => {
                  window.location.reload();
                }}
                className="me-2"
              >
                Refresh Page
              </Button>
              {user && user.role === 'user' && (
                <Button 
                  variant="primary"
                  size="sm"
                  onClick={() => setShowApplicationForm(true)}
                >
                  Apply Anyway
                </Button>
              )}
            </div>
          </Alert>
          
          {user && user.role === 'user' && (
            <AuthorApplicationForm
              show={showApplicationForm}
              onHide={() => setShowApplicationForm(false)}
              onSuccess={handleApplicationSuccess}
            />
          )}
        </Card.Body>
      </Card>
    );
  }

  if (isCheckingEligibility || isLoadingApplication) {
    return (
      <Card className="mb-4">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          <span>Checking author application status...</span>
        </Card.Body>
      </Card>
    );
  }


  // If user can apply (no existing application or eligible)
  if (canApplyData?.canApply) {
    return (
      <>
        <Card className="mb-4 border-primary">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-1 text-primary">
                  <BsPlusCircle size={20} className="me-2" />
                  Become an Author
                </h5>
                <p className="mb-0 text-muted">
                  Share your beekeeping knowledge with our community by becoming an author.
                </p>
              </div>
              <Button 
                variant="primary" 
                onClick={() => setShowApplicationForm(true)}
              >
                Apply Now
              </Button>
            </div>
          </Card.Body>
        </Card>

        <AuthorApplicationForm
          show={showApplicationForm}
          onHide={() => setShowApplicationForm(false)}
          onSuccess={handleApplicationSuccess}
        />
      </>
    );
  }

  // If user cannot apply (show reason)
  if (!canApplyData?.canApply && canApplyData?.reason) {
    let alertContent = null;

    if (canApplyData.reason === 'already_author') {
      alertContent = (
        <Alert variant="success" className="mb-4">
          <BsCheckCircle size={20} className="me-2" />
          <strong>You're already an author!</strong> You can create and publish articles.
        </Alert>
      );
    } else if (canApplyData.reason === 'pending_application') {
      // This case should be handled by the application status display below
      alertContent = null;
    }

    if (alertContent) {
      return alertContent;
    }
  }

  // If user has an application, show its status
  if (application) {
    // Extract the actual application data if it's wrapped in a response
    const applicationData = application.data || application;
    
    const statusConfig = getStatusConfig(applicationData.status);

    return (
      <>
        <Card className="mb-4">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">Author Application</h5>
              <StatusBadge 
                status={applicationData.status}
                type={StatusTypes.APPLICATION}
                size="lg"
              />
            </div>

            <p className="text-muted mb-3">
              {statusConfig.description}
            </p>

            <Row className="text-sm">
              <Col md={6}>
                <strong>Applied:</strong> {moment(applicationData.createdAt).format('MMMM D, YYYY')}
              </Col>
              {applicationData.reviewed_at && (
                <Col md={6}>
                  <strong>Reviewed:</strong> {moment(applicationData.reviewed_at).format('MMMM D, YYYY')}
                </Col>
              )}
            </Row>

            {applicationData.admin_notes && (
              <Alert variant="info" className="mt-3 mb-0">
                <strong>Admin Notes:</strong> {applicationData.admin_notes}
              </Alert>
            )}

            <div className="mt-3">
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowDetailsModal(true)}
              >
                <BsEye size={14} className="me-1" />
                View Application Details
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Application Details Modal */}
        <Modal 
          show={showDetailsModal} 
          onHide={() => setShowDetailsModal(false)}
          size="lg"
        >
          <Modal.Header closeButton>
            <Modal.Title>Your Author Application</Modal.Title>
          </Modal.Header>
          <Modal.Body>

            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <strong>Status:</strong>
                {(() => {
                  // Get fresh status config using the application data
                  const currentStatus = applicationData.status || 'pending';
                  
                  const modalStatusConfig = getStatusConfig(currentStatus);
                  return (
                    <Badge bg={modalStatusConfig.variant} className="px-3 py-2">
                      {modalStatusConfig.icon}
                      {modalStatusConfig.text}
                    </Badge>
                  );
                })()}
              </div>
              <p className="text-muted mb-0">
                {(() => {
                  const currentStatus = applicationData.status || applicationData['status'] || 'pending';
                  const modalStatusConfig = getStatusConfig(currentStatus);
                  return modalStatusConfig.description;
                })()}
              </p>
            </div>

            <div className="mb-4">
              <strong>Application Text:</strong>
              <div className="mt-2 p-3 bg-light rounded" style={{ color: '#212529' }}>
                {(() => {
                  // Check different possible locations for the application text
                  const text = applicationData.application_text || 
                               applicationData['application_text'] ||
                               applicationData.applicationText;
                  
                  if (text) {
                    return text;
                  }
                  
                  // If still not found, show a simple message
                  return (
                    <span className="text-muted font-italic">No application text available</span>
                  );
                })()}
              </div>
            </div>

            {applicationData.writing_experience && (
              <div className="mb-4">
                <strong>Writing Experience:</strong>
                <div className="mt-2 p-3 bg-light rounded" style={{ color: '#212529' }}>
                  {applicationData.writing_experience}
                </div>
              </div>
            )}

            {applicationData.beekeeping_experience && (
              <div className="mb-4">
                <strong>Beekeeping Experience:</strong>
                <div className="mt-2 p-3 bg-light rounded" style={{ color: '#212529' }}>
                  {applicationData.beekeeping_experience}
                </div>
              </div>
            )}

            {applicationData.topics_of_interest && (
              <div className="mb-4">
                <strong>Topics of Interest:</strong>
                <div className="mt-2 p-3 bg-light rounded" style={{ color: '#212529' }}>
                  {applicationData.topics_of_interest}
                </div>
              </div>
            )}

            {applicationData.admin_notes && (
              <div className="mb-4">
                <strong>Admin Notes:</strong>
                <Alert variant="info" className="mt-2">
                  {applicationData.admin_notes}
                </Alert>
              </div>
            )}

            <Row className="text-sm text-muted">
              <Col md={6}>
                <strong>Submitted:</strong> {moment(applicationData.createdAt).format('MMMM D, YYYY [at] h:mm A')}
              </Col>
              {applicationData.reviewed_at && (
                <Col md={6}>
                  <strong>Reviewed:</strong> {moment(applicationData.reviewed_at).format('MMMM D, YYYY [at] h:mm A')}
                </Col>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }

  // Fallback - if we can't determine status, show a generic apply option for non-admin/author users
  if (user && user.role === 'user') {
    return (
      <>
        <Card className="mb-4 border-primary">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="mb-1 text-primary">
                  <BsPlusCircle size={20} className="me-2" />
                  Become an Author
                </h5>
                <p className="mb-0 text-muted">
                  Share your beekeeping knowledge with our community by becoming an author.
                </p>
                <small className="text-warning">
                  <BsExclamationTriangle size={14} className="me-1" />
                  Unable to check current application status. You can still apply.
                </small>
              </div>
              <Button 
                variant="primary" 
                onClick={() => setShowApplicationForm(true)}
              >
                Apply Now
              </Button>
            </div>
          </Card.Body>
        </Card>

        <AuthorApplicationForm
          show={showApplicationForm}
          onHide={() => setShowApplicationForm(false)}
          onSuccess={handleApplicationSuccess}
        />
      </>
    );
  }

  // For non-user roles or when we can't determine what to show
  return null;
};

export default AuthorApplicationStatus;