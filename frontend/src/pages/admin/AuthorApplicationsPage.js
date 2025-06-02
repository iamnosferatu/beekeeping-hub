// frontend/src/pages/admin/AuthorApplicationsPage.js
import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Modal,
  Form,
  Alert,
  Spinner,
  Pagination,
  ButtonGroup,
  Dropdown,
  InputGroup
} from 'react-bootstrap';
import {
  BsEye,
  BsCheckCircle,
  BsXCircle,
  BsClockHistory,
  BsSearch,
  BsFilter,
  BsPersonCheck,
  BsPersonX
} from 'react-icons/bs';
import moment from 'moment';
import {
  useAdminAuthorApplications,
  useAuthorApplicationById,
  useReviewAuthorApplication,
  usePendingAuthorApplicationsCount
} from '../../hooks/queries/useAuthorApplications';

/**
 * AuthorApplicationsPage Component
 * 
 * Admin page for reviewing and managing author applications
 * Features:
 * - List all applications with filtering and pagination
 * - View application details
 * - Approve or reject applications
 * - Real-time pending count updates
 */
const AuthorApplicationsPage = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    action: '',
    adminNotes: ''
  });

  // Queries
  const { 
    data: applicationsData, 
    isLoading, 
    error 
  } = useAdminAuthorApplications(filters);

  // Debug logging
  console.log('AuthorApplicationsPage Debug:', {
    filters,
    applicationsData,
    applicationsArray: applicationsData?.applications,
    applicationsCount: applicationsData?.applications?.length,
    fullStructure: JSON.stringify(applicationsData, null, 2),
    isLoading,
    error: error ? { type: error.type, message: error.message } : null
  });
  
  const { 
    data: pendingCountData 
  } = usePendingAuthorApplicationsCount();

  const { 
    data: applicationDetails,
    isLoading: isLoadingDetails,
    error: detailsError 
  } = useAuthorApplicationById(selectedApplication?.id, {
    enabled: showDetailsModal
  });

  // Mutations
  const reviewMutation = useReviewAuthorApplication();

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedApplication(null);
  };

  const handleStartReview = (application, action) => {
    setSelectedApplication(application);
    setReviewData({
      action,
      adminNotes: ''
    });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await reviewMutation.mutateAsync({
        id: selectedApplication.id,
        action: reviewData.action,
        adminNotes: reviewData.adminNotes.trim() || null
      });
      
      // Close modal and reset form
      setShowReviewModal(false);
      setReviewData({ action: '', adminNotes: '' });
      setSelectedApplication(null);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          variant: 'warning',
          icon: <BsClockHistory size={14} className="me-1" />,
          text: 'Pending'
        };
      case 'approved':
        return {
          variant: 'success',
          icon: <BsCheckCircle size={14} className="me-1" />,
          text: 'Approved'
        };
      case 'rejected':
        return {
          variant: 'danger',
          icon: <BsXCircle size={14} className="me-1" />,
          text: 'Rejected'
        };
      default:
        return {
          variant: 'secondary',
          icon: null,
          text: status
        };
    }
  };

  const renderPagination = () => {
    if (!applicationsData?.pagination) return null;

    const { page, totalPages } = applicationsData.pagination;
    
    if (totalPages <= 1) return null;

    const items = [];
    const startPage = Math.max(1, page - 2);
    const endPage = Math.min(totalPages, page + 2);

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={page === 1}
        onClick={() => handlePageChange(page - 1)}
      />
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={page === totalPages}
        onClick={() => handlePageChange(page + 1)}
      />
    );

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>{items}</Pagination>
      </div>
    );
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>Author Applications</h2>
              <p className="text-muted mb-0">
                Review and manage author applications from community members
              </p>
            </div>
            {pendingCountData && (
              <Badge bg="warning" className="fs-6 px-3 py-2">
                {pendingCountData.pendingCount} Pending
              </Badge>
            )}
          </div>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <BsFilter />
            </InputGroup.Text>
            <Form.Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Form.Select>
          </InputGroup>
        </Col>
        <Col md={6}>
          <div className="d-flex justify-content-end">
            <Form.Select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              style={{ width: 'auto' }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </Form.Select>
          </div>
        </Col>
      </Row>

      {/* Applications Table */}
      <Card>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <strong>Error loading applications:</strong> {error.message}
              <div className="mt-2">
                <small className="text-muted">
                  Debug info: {JSON.stringify({ 
                    type: error.type, 
                    status: error.status,
                    tokenPresent: localStorage.getItem('beekeeper_auth_token') ? 'Yes' : 'No'
                  })}
                </small>
              </div>
              <div className="mt-2">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </Alert>
          )}

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2">Loading applications...</p>
            </div>
          ) : applicationsData?.applications?.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">
                {filters.status === 'all' 
                  ? 'No author applications found.'
                  : `No ${filters.status} applications found.`
                }
              </p>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th>Experience</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicationsData?.applications?.map((application) => {
                    const statusConfig = getStatusConfig(application.status);
                    return (
                      <tr key={application.id}>
                        <td>
                          <div>
                            <strong>{application.applicant.username}</strong>
                            <br />
                            <small className="text-muted">
                              {application.applicant.first_name} {application.applicant.last_name}
                            </small>
                            <br />
                            <small className="text-muted">
                              {application.applicant.email}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            {moment(application.createdAt).format('MMM D, YYYY')}
                            <br />
                            <small className="text-muted">
                              {moment(application.createdAt).fromNow()}
                            </small>
                          </div>
                        </td>
                        <td>
                          <Badge bg={statusConfig.variant}>
                            {statusConfig.icon}
                            {statusConfig.text}
                          </Badge>
                          {application.reviewed_at && (
                            <div>
                              <small className="text-muted">
                                Reviewed {moment(application.reviewed_at).fromNow()}
                              </small>
                            </div>
                          )}
                        </td>
                        <td>
                          <small>
                            {application.beekeeping_experience ? 
                              application.beekeeping_experience.substring(0, 100) + '...' : 
                              'Not specified'
                            }
                          </small>
                        </td>
                        <td>
                          <ButtonGroup size="sm">
                            <Button
                              variant="outline-primary"
                              onClick={() => handleViewApplication(application)}
                            >
                              <BsEye size={14} />
                            </Button>
                            <>
                              <Button
                                variant={application.status === 'approved' ? "success" : "outline-success"}
                                onClick={() => handleStartReview(application, 'approve')}
                                disabled={reviewMutation.isPending}
                                title={application.status === 'approved' ? 'Already approved - click to re-approve' : 'Approve application'}
                              >
                                <BsPersonCheck size={14} />
                              </Button>
                              <Button
                                variant={application.status === 'rejected' ? "danger" : "outline-danger"}
                                onClick={() => handleStartReview(application, 'reject')}
                                disabled={reviewMutation.isPending}
                                title={application.status === 'rejected' ? 'Already rejected - click to re-reject' : 'Reject application'}
                              >
                                <BsPersonX size={14} />
                              </Button>
                            </>
                          </ButtonGroup>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>

              {/* Pagination */}
              {renderPagination()}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Application Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Author Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoadingDetails ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <p className="mt-2">Loading details...</p>
            </div>
          ) : detailsError ? (
            <Alert variant="danger">
              <strong>Error:</strong> {detailsError.message || 'Failed to load application details'}
              <div className="mt-2">
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Refresh Page
                </Button>
              </div>
            </Alert>
          ) : applicationDetails ? (
            <div>
              {/* Application Info */}
              <div className="mb-4">
                <h5>Applicant Information</h5>
                <Row>
                  <Col md={6}>
                    <strong>Name:</strong> {applicationDetails.applicant.first_name} {applicationDetails.applicant.last_name}
                  </Col>
                  <Col md={6}>
                    <strong>Username:</strong> {applicationDetails.applicant.username}
                  </Col>
                  <Col md={6}>
                    <strong>Email:</strong> {applicationDetails.applicant.email}
                  </Col>
                  <Col md={6}>
                    <strong>Member since:</strong> {moment(applicationDetails.applicant.createdAt).format('MMMM YYYY')}
                  </Col>
                </Row>
              </div>

              {/* Application Content */}
              <div className="mb-4">
                <h5>Application</h5>
                <div className="p-3 bg-light rounded">
                  {applicationDetails.application_text}
                </div>
              </div>

              {applicationDetails.writing_experience && (
                <div className="mb-4">
                  <h5>Writing Experience</h5>
                  <div className="p-3 bg-light rounded">
                    {applicationDetails.writing_experience}
                  </div>
                </div>
              )}

              {applicationDetails.beekeeping_experience && (
                <div className="mb-4">
                  <h5>Beekeeping Experience</h5>
                  <div className="p-3 bg-light rounded">
                    {applicationDetails.beekeeping_experience}
                  </div>
                </div>
              )}

              {applicationDetails.topics_of_interest && (
                <div className="mb-4">
                  <h5>Topics of Interest</h5>
                  <div className="p-3 bg-light rounded">
                    {applicationDetails.topics_of_interest}
                  </div>
                </div>
              )}

              {applicationDetails.admin_notes && (
                <div className="mb-4">
                  <h5>Admin Notes</h5>
                  <Alert variant="info">
                    {applicationDetails.admin_notes}
                  </Alert>
                </div>
              )}

              {/* Status and Review Info */}
              <div className="mb-4">
                <h5>Review Status</h5>
                <Row>
                  <Col md={6}>
                    <strong>Status:</strong> 
                    <Badge bg={getStatusConfig(applicationDetails.status).variant} className="ms-2">
                      {getStatusConfig(applicationDetails.status).text}
                    </Badge>
                  </Col>
                  <Col md={6}>
                    <strong>Submitted:</strong> {moment(applicationDetails.createdAt).format('MMMM D, YYYY')}
                  </Col>
                  {applicationDetails.reviewed_at && (
                    <>
                      <Col md={6}>
                        <strong>Reviewed:</strong> {moment(applicationDetails.reviewed_at).format('MMMM D, YYYY')}
                      </Col>
                      {applicationDetails.reviewer && (
                        <Col md={6}>
                          <strong>Reviewed by:</strong> {applicationDetails.reviewer.username}
                        </Col>
                      )}
                    </>
                  )}
                </Row>
              </div>
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-muted">No application selected.</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {applicationDetails && (
            <>
              <Button
                variant={applicationDetails.status === 'approved' ? "success" : "outline-success"}
                onClick={() => handleStartReview(applicationDetails, 'approve')}
                disabled={reviewMutation.isPending}
              >
                <BsPersonCheck className="me-1" />
                {applicationDetails.status === 'approved' ? 'Re-approve' : 'Approve'}
              </Button>
              <Button
                variant={applicationDetails.status === 'rejected' ? "danger" : "outline-danger"}
                onClick={() => handleStartReview(applicationDetails, 'reject')}
                disabled={reviewMutation.isPending}
              >
                <BsPersonX className="me-1" />
                {applicationDetails.status === 'rejected' ? 'Re-reject' : 'Reject'}
              </Button>
            </>
          )}
          <Button variant="secondary" onClick={handleCloseDetailsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Review Modal */}
      <Modal show={showReviewModal} onHide={() => setShowReviewModal(false)}>
        <Form onSubmit={handleReviewSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {reviewData.action === 'approve' ? 'Approve' : 'Reject'} Application
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {reviewMutation.isError && (
              <Alert variant="danger" className="mb-3">
                {reviewMutation.error?.message || 'Review failed. Please try again.'}
              </Alert>
            )}

            <Alert variant={reviewData.action === 'approve' ? 'success' : 'warning'}>
              <strong>
                {reviewData.action === 'approve' 
                  ? (selectedApplication?.status === 'approved' ? 'Re-approve this application?' : 'Approve this application?')
                  : (selectedApplication?.status === 'rejected' ? 'Re-reject this application?' : 'Reject this application?')
                }
              </strong>
              <p className="mb-0 mt-2">
                {reviewData.action === 'approve' 
                  ? (selectedApplication?.status === 'approved' 
                      ? 'This will update the approval with new admin notes if provided.'
                      : 'The user will be granted author permissions and can create articles.')
                  : (selectedApplication?.status === 'rejected'
                      ? 'This will update the rejection with new admin notes if provided.'
                      : 'The user will not be granted author permissions at this time.')
                }
              </p>
            </Alert>

            <Form.Group>
              <Form.Label>Admin Notes (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={reviewData.adminNotes}
                onChange={(e) => setReviewData(prev => ({ ...prev, adminNotes: e.target.value }))}
                placeholder={reviewData.action === 'approve' 
                  ? 'Welcome message or any notes for the new author...'
                  : 'Reason for rejection or feedback for improvement...'
                }
                disabled={reviewMutation.isPending}
              />
              <Form.Text className="text-muted">
                These notes will be visible to the applicant.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowReviewModal(false)}
              disabled={reviewMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              variant={reviewData.action === 'approve' ? 'success' : 'danger'}
              type="submit"
              disabled={reviewMutation.isPending}
            >
              {reviewMutation.isPending ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {reviewData.action === 'approve' ? 'Approving...' : 'Rejecting...'}
                </>
              ) : (
                <>
                  {reviewData.action === 'approve' ? <BsPersonCheck className="me-1" /> : <BsPersonX className="me-1" />}
                  {reviewData.action === 'approve' ? 'Approve Application' : 'Reject Application'}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default AuthorApplicationsPage;