// frontend/src/pages/admin/ContactMessagesPage.js
import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Row,
  Col,
  Modal,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  BsEnvelope,
  BsEnvelopeOpen,
  BsReply,
  BsArchive,
  BsTrash,
  BsEye,
  BsSearch,
  BsFilter,
} from "react-icons/bs";
import axios from "axios";
import { API_URL } from "../../config";
import AuthContext from "../../contexts/AuthContext";
import { formatDate } from "../../utils/formatters";

const ContactMessagesPage = () => {
  const { token } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState(null);
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await axios.get(
        `${API_URL}/contact/admin/contacts?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessages(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      setError("Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/contact/admin/contacts/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [filters.page, filters.status, filters.search]);

  // View message details
  const viewMessage = async (message) => {
    try {
      const response = await axios.get(
        `${API_URL}/contact/admin/contacts/${message.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedMessage(response.data.data);
      setShowModal(true);
      
      // Refresh messages to update status
      if (message.status === "new") {
        fetchMessages();
        fetchStats();
      }
    } catch (error) {
      console.error("Error fetching message details:", error);
    }
  };

  // Update message status
  const updateStatus = async (messageId, newStatus) => {
    try {
      await axios.put(
        `${API_URL}/contact/admin/contacts/${messageId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      fetchMessages();
      fetchStats();
      setShowModal(false);
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/contact/admin/contacts/${messageId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      fetchMessages();
      fetchStats();
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "new":
        return "primary";
      case "read":
        return "info";
      case "replied":
        return "success";
      case "archived":
        return "secondary";
      default:
        return "light";
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid>
      <h1 className="mb-4">Contact Messages</h1>

      {/* Stats Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3>{stats.total || 0}</h3>
                <p className="text-muted mb-0">Total Messages</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3>{stats.byStatus?.new || 0}</h3>
                <p className="text-muted mb-0">New Messages</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3>{stats.byStatus?.replied || 0}</h3>
                <p className="text-muted mb-0">Replied</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center">
              <Card.Body>
                <h3>{stats.today || 0}</h3>
                <p className="text-muted mb-0">Today</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value, page: 1 })
                    }
                  >
                    <option value="">All Statuses</option>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                    <option value="archived">Archived</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by name, email, subject, or message..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button type="submit" variant="primary" className="w-100">
                  <BsSearch /> Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Messages Table */}
      <Card>
        <Card.Body>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {messages.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted">No contact messages found.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((message) => (
                  <tr key={message.id}>
                    <td>
                      <Badge bg={getStatusColor(message.status)}>
                        {message.status === "new" && <BsEnvelope className="me-1" />}
                        {message.status === "read" && <BsEnvelopeOpen className="me-1" />}
                        {message.status === "replied" && <BsReply className="me-1" />}
                        {message.status === "archived" && <BsArchive className="me-1" />}
                        {message.status}
                      </Badge>
                    </td>
                    <td>{formatDate(message.created_at)}</td>
                    <td>{message.name}</td>
                    <td>{message.email}</td>
                    <td>{message.subject}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => viewMessage(message)}
                      >
                        <BsEye /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Button
                variant="outline-primary"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() =>
                  setFilters({ ...filters, page: pagination.currentPage - 1 })
                }
                className="me-2"
              >
                Previous
              </Button>
              <span className="align-self-center mx-3">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline-primary"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() =>
                  setFilters({ ...filters, page: pagination.currentPage + 1 })
                }
                className="ms-2"
              >
                Next
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Message Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        {selectedMessage && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Message Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>From:</strong> {selectedMessage.name}
                </Col>
                <Col md={6}>
                  <strong>Email:</strong>{" "}
                  <a href={`mailto:${selectedMessage.email}`}>
                    {selectedMessage.email}
                  </a>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Date:</strong> {formatDate(selectedMessage.created_at)}
                </Col>
                <Col md={6}>
                  <strong>Status:</strong>{" "}
                  <Badge bg={getStatusColor(selectedMessage.status)}>
                    {selectedMessage.status}
                  </Badge>
                </Col>
              </Row>
              <hr />
              <h5>{selectedMessage.subject}</h5>
              <p style={{ whiteSpace: "pre-wrap" }}>{selectedMessage.message}</p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => updateStatus(selectedMessage.id, "archived")}
              >
                <BsArchive /> Archive
              </Button>
              <Button
                variant="success"
                onClick={() => updateStatus(selectedMessage.id, "replied")}
              >
                <BsReply /> Mark as Replied
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteMessage(selectedMessage.id)}
              >
                <BsTrash /> Delete
              </Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </Container>
  );
};

export default ContactMessagesPage;