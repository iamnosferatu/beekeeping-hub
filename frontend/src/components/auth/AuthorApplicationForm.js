// frontend/src/components/auth/AuthorApplicationForm.js
import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Button, 
  Alert, 
  Spinner, 
  Row, 
  Col,
  ProgressBar
} from 'react-bootstrap';
import { useSubmitAuthorApplication } from '../../hooks/queries/useAuthorApplications';

/**
 * AuthorApplicationForm Component
 * 
 * Modal form for users to apply for author status
 * Includes questions about writing experience, beekeeping knowledge, and topics of interest
 */
const AuthorApplicationForm = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    application_text: '',
    writing_experience: '',
    beekeeping_experience: '',
    topics_of_interest: ''
  });
  const [errors, setErrors] = useState({});
  const [charCounts, setCharCounts] = useState({
    application_text: 0,
    writing_experience: 0,
    beekeeping_experience: 0,
    topics_of_interest: 0
  });

  const submitMutation = useSubmitAuthorApplication();

  // Character limits
  const limits = {
    application_text: { min: 50, max: 2000 },
    writing_experience: { max: 1000 },
    beekeeping_experience: { max: 1000 },
    topics_of_interest: { max: 500 }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setCharCounts(prev => ({
      ...prev,
      [field]: value.length
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Application text validation
    const appTextLength = formData.application_text.trim().length;
    if (appTextLength < limits.application_text.min) {
      newErrors.application_text = `Please write at least ${limits.application_text.min} characters explaining why you want to become an author.`;
    } else if (appTextLength > limits.application_text.max) {
      newErrors.application_text = `Please keep your application to ${limits.application_text.max} characters or less.`;
    }

    // Other field validations
    Object.keys(limits).forEach(field => {
      if (field !== 'application_text' && formData[field].length > limits[field].max) {
        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        newErrors[field] = `${fieldName} must be ${limits[field].max} characters or less.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const submissionData = {
        application_text: formData.application_text.trim(),
        writing_experience: formData.writing_experience.trim() || null,
        beekeeping_experience: formData.beekeeping_experience.trim() || null,
        topics_of_interest: formData.topics_of_interest.trim() || null
      };

      await submitMutation.mutateAsync(submissionData);
      
      // Success
      if (onSuccess) onSuccess();
      handleClose();
    } catch (error) {
      // Error is handled by the mutation
      console.error('Application submission error:', error);
    }
  };

  const handleClose = () => {
    if (!submitMutation.isPending) {
      setFormData({
        application_text: '',
        writing_experience: '',
        beekeeping_experience: '',
        topics_of_interest: ''
      });
      setErrors({});
      setCharCounts({
        application_text: 0,
        writing_experience: 0,
        beekeeping_experience: 0,
        topics_of_interest: 0
      });
      onHide();
    }
  };

  const getCharCountColor = (field) => {
    const count = charCounts[field];
    const limit = limits[field].max;
    const percentage = (count / limit) * 100;
    
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'info';
  };

  const getCharCountVariant = (field) => {
    const count = charCounts[field];
    const limit = limits[field].max;
    const percentage = (count / limit) * 100;
    
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'primary';
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg"
      backdrop="static"
      keyboard={!submitMutation.isPending}
    >
      <Modal.Header closeButton={!submitMutation.isPending}>
        <Modal.Title>Apply for Author Status</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {submitMutation.isError && (
            <Alert variant="danger" className="mb-3">
              <strong>Application Failed:</strong> {submitMutation.error?.message || 'Please try again'}
            </Alert>
          )}

          <Alert variant="info" className="mb-4">
            <strong>Become a Beekeeping Author!</strong>
            <p className="mb-0 mt-2">
              Share your knowledge and passion for beekeeping with our community. 
              Authors can create, edit, and publish articles on our platform.
            </p>
          </Alert>

          {/* Required Application Text */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">
              Why do you want to become an author? <span className="text-danger">*</span>
            </Form.Label>
            <Form.Text className="d-block mb-2 text-muted">
              Tell us about your passion for beekeeping and why you'd like to contribute content to our community.
              <strong> Minimum 50 characters required.</strong>
            </Form.Text>
            <Form.Control
              as="textarea"
              rows={4}
              value={formData.application_text}
              onChange={(e) => handleInputChange('application_text', e.target.value)}
              isInvalid={!!errors.application_text}
              disabled={submitMutation.isPending}
              placeholder="I want to become an author because..."
            />
            <div className="d-flex justify-content-between align-items-center mt-1">
              <Form.Control.Feedback type="invalid">
                {errors.application_text}
              </Form.Control.Feedback>
              <small className={`text-${charCounts.application_text < limits.application_text.min ? 'danger fw-bold' : getCharCountColor('application_text')}`}>
                {charCounts.application_text}/{limits.application_text.max} characters 
                {charCounts.application_text < limits.application_text.min && 
                  ` (minimum ${limits.application_text.min} required)`
                }
              </small>
            </div>
            {charCounts.application_text > 0 && (
              <ProgressBar 
                variant={getCharCountVariant('application_text')} 
                now={(charCounts.application_text / limits.application_text.max) * 100} 
                className="mt-1" 
                style={{ height: '3px' }}
              />
            )}
          </Form.Group>

          <Row>
            <Col md={6}>
              {/* Writing Experience */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Writing Experience</Form.Label>
                <Form.Text className="d-block mb-2 text-muted">
                  Any previous writing experience (blogs, articles, books, etc.)
                </Form.Text>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.writing_experience}
                  onChange={(e) => handleInputChange('writing_experience', e.target.value)}
                  isInvalid={!!errors.writing_experience}
                  disabled={submitMutation.isPending}
                  placeholder="Describe your writing background (optional)"
                />
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <Form.Control.Feedback type="invalid">
                    {errors.writing_experience}
                  </Form.Control.Feedback>
                  <small className={`text-${getCharCountColor('writing_experience')}`}>
                    {charCounts.writing_experience}/{limits.writing_experience.max}
                  </small>
                </div>
                {charCounts.writing_experience > 0 && (
                  <ProgressBar 
                    variant={getCharCountVariant('writing_experience')} 
                    now={(charCounts.writing_experience / limits.writing_experience.max) * 100} 
                    className="mt-1" 
                    style={{ height: '3px' }}
                  />
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              {/* Beekeeping Experience */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Beekeeping Experience</Form.Label>
                <Form.Text className="d-block mb-2 text-muted">
                  Your beekeeping knowledge and experience level
                </Form.Text>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={formData.beekeeping_experience}
                  onChange={(e) => handleInputChange('beekeeping_experience', e.target.value)}
                  isInvalid={!!errors.beekeeping_experience}
                  disabled={submitMutation.isPending}
                  placeholder="Years of experience, specialties, etc. (optional)"
                />
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <Form.Control.Feedback type="invalid">
                    {errors.beekeeping_experience}
                  </Form.Control.Feedback>
                  <small className={`text-${getCharCountColor('beekeeping_experience')}`}>
                    {charCounts.beekeeping_experience}/{limits.beekeeping_experience.max}
                  </small>
                </div>
                {charCounts.beekeeping_experience > 0 && (
                  <ProgressBar 
                    variant={getCharCountVariant('beekeeping_experience')} 
                    now={(charCounts.beekeeping_experience / limits.beekeeping_experience.max) * 100} 
                    className="mt-1" 
                    style={{ height: '3px' }}
                  />
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Topics of Interest */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Topics You'd Like to Write About</Form.Label>
            <Form.Text className="d-block mb-2 text-muted">
              What beekeeping topics are you most passionate about and knowledgeable in?
            </Form.Text>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.topics_of_interest}
              onChange={(e) => handleInputChange('topics_of_interest', e.target.value)}
              isInvalid={!!errors.topics_of_interest}
              disabled={submitMutation.isPending}
              placeholder="e.g., hive management, bee diseases, honey production, urban beekeeping..."
            />
            <div className="d-flex justify-content-between align-items-center mt-1">
              <Form.Control.Feedback type="invalid">
                {errors.topics_of_interest}
              </Form.Control.Feedback>
              <small className={`text-${getCharCountColor('topics_of_interest')}`}>
                {charCounts.topics_of_interest}/{limits.topics_of_interest.max}
              </small>
            </div>
            {charCounts.topics_of_interest > 0 && (
              <ProgressBar 
                variant={getCharCountVariant('topics_of_interest')} 
                now={(charCounts.topics_of_interest / limits.topics_of_interest.max) * 100} 
                className="mt-1" 
                style={{ height: '3px' }}
              />
            )}
          </Form.Group>

          {charCounts.application_text > 0 && charCounts.application_text < limits.application_text.min && (
            <Alert variant="warning" className="mb-3">
              <small>
                <strong>Almost there!</strong> Please write at least {limits.application_text.min - charCounts.application_text} more characters 
                in the application text to enable the submit button.
              </small>
            </Alert>
          )}

          <Alert variant="secondary" className="mb-0">
            <small>
              <strong>Note:</strong> Your application will be reviewed by our administrators. 
              You'll receive notification when your application status changes.
              Fields marked with * are required.
            </small>
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={submitMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={submitMutation.isPending || charCounts.application_text < limits.application_text.min}
            title={charCounts.application_text < limits.application_text.min ? 
              `Please write at least ${limits.application_text.min} characters in the application text` : 
              'Submit your author application'}
          >
            {submitMutation.isPending ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Submitting...
              </>
            ) : charCounts.application_text < limits.application_text.min ? (
              `Submit Application (${charCounts.application_text}/${limits.application_text.min} chars)`
            ) : (
              'Submit Application'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AuthorApplicationForm;