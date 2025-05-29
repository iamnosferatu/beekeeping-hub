// frontend/src/pages/admin/NewsletterPage.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Alert,
  Spinner,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { Download } from "lucide-react";
import api from "../../services/api";
import { formatDate } from "../../utils/formatters";
import Pagination from "../../components/ui/Pagination";

const NewsletterPage = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.newsletter.getSubscribers({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter,
      });

      console.log("Newsletter subscribers response:", response);

      if (response.success && Array.isArray(response.data)) {
        setSubscribers(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalItems(response.pagination?.totalItems || 0);
      } else {
        console.error("Invalid response format:", response);
        setSubscribers([]);
        setError("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      setError("Failed to load subscribers");
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [currentPage, statusFilter]);

  const handleExport = async () => {
    try {
      const response = await api.newsletter.exportSubscribers(statusFilter);
      
      // Create a blob from the response
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${statusFilter}-${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccessMessage("Subscribers exported successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error exporting subscribers:", error);
      setError("Failed to export subscribers");
    }
  };

  const getStatusBadge = (status) => {
    return status === "active" ? (
      <Badge bg="success">Active</Badge>
    ) : (
      <Badge bg="secondary">Unsubscribed</Badge>
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Newsletter Subscribers</h2>
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={loading || subscribers.length === 0}
        >
          <Download size={16} className="me-2" />
          Export to CSV
        </Button>
      </div>

      {successMessage && (
        <Alert variant="success" dismissible onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col sm={6}>
              <h5 className="mb-0">
                {statusFilter === "all"
                  ? "All Subscribers"
                  : statusFilter === "active"
                  ? "Active Subscribers"
                  : "Unsubscribed"}
                {" "}
                ({totalItems})
              </h5>
            </Col>
            <Col sm={6}>
              <Form.Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-auto ms-auto d-block"
              >
                <option value="active">Active Only</option>
                <option value="unsubscribed">Unsubscribed Only</option>
                <option value="all">All Subscribers</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading subscribers...</p>
            </div>
          ) : !Array.isArray(subscribers) || subscribers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No subscribers found</p>
            </div>
          ) : (
            <>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Subscribed Date</th>
                    <th>Unsubscribed Date</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(subscribers) && subscribers.map((subscriber) => (
                    <tr key={subscriber.id}>
                      <td>{subscriber.email}</td>
                      <td>{getStatusBadge(subscriber.status)}</td>
                      <td>{formatDate(subscriber.subscribed_at)}</td>
                      <td>
                        {subscriber.unsubscribed_at
                          ? formatDate(subscriber.unsubscribed_at)
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NewsletterPage;