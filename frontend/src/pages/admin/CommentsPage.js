// frontend/src/pages/admin/CommentsPage.js
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Alert,
  Spinner,
  Form,
  Modal,
  InputGroup,
  Pagination,
} from "react-bootstrap";
import {
  BsCheck2Circle,
  BsXCircle,
  BsClock,
  BsTrash,
  BsEye,
  BsExclamationTriangle,
  BsSearch,
  BsFilter,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";

/**
 * Admin Comments Management Page
 *
 * Allows administrators to moderate comments - approve, reject, or delete them.
 * Includes filtering by status and search functionality.
 */
const CommentsPage = () => {
  // State management
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  /**
   * Fetch comments from the backend
   */
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("beekeeper_auth_token");
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      };

      // Try admin comments endpoint first
      let response;
      try {
        response = await axios.get(`${API_URL}/admin/comments`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (adminError) {
        // Fallback to regular comments endpoint
        console.log("Admin comments endpoint failed, trying regular endpoint");
        response = await axios.get(`${API_URL}/comments`, {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      if (response.data.success || response.data.data) {
        const commentsData = response.data.data || [];

        // If comments don't have article info, try to fetch it
        const enrichedComments = await Promise.all(
          commentsData.map(async (comment) => {
            if (!comment.article && comment.article_id) {
              try {
                const articleRes = await axios.get(
                  `${API_URL}/articles/byId/${comment.article_id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                return {
                  ...comment,
                  article: articleRes.data.data || articleRes.data,
                };
              } catch (e) {
                return comment;
              }
            }
            return comment;
          })
        );

        setComments(enrichedComments);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Failed to load comments. Please try again.");

      // Set empty data as fallback
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [currentPage, statusFilter]);

  /**
   * Handle search submission
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComments();
  };

  /**
   * Handle comment status update
   */
  const handleStatusUpdate = async (comment, newStatus) => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("beekeeper_auth_token");

      const response = await axios.put(
        `${API_URL}/admin/comments/${comment.id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state
        setComments(
          comments.map((c) =>
            c.id === comment.id ? { ...c, status: newStatus } : c
          )
        );
      }
    } catch (error) {
      console.error("Error updating comment status:", error);

      // If endpoint doesn't exist, show message
      if (error.response?.status === 404) {
        alert(
          "Comment moderation endpoint not implemented. This would update the comment status in a production system."
        );

        // Update locally for demo purposes
        setComments(
          comments.map((c) =>
            c.id === comment.id ? { ...c, status: newStatus } : c
          )
        );
      } else {
        alert("Failed to update comment status. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle comment deletion
   */
  const handleDelete = async () => {
    if (!selectedComment) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("beekeeper_auth_token");

      const response = await axios.delete(
        `${API_URL}/comments/${selectedComment.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove from local state
        setComments(comments.filter((c) => c.id !== selectedComment.id));
        setShowDeleteModal(false);
        setSelectedComment(null);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);

      if (error.response?.status === 404) {
        alert(
          "Comment deletion endpoint not implemented. This would delete the comment in a production system."
        );
      } else {
        alert("Failed to delete comment. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Get status badge configuration
   */
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return {
          variant: "success",
          icon: <BsCheck2Circle className="me-1" />,
          text: "Approved",
        };
      case "rejected":
        return {
          variant: "danger",
          icon: <BsXCircle className="me-1" />,
          text: "Rejected",
        };
      case "pending":
        return {
          variant: "warning",
          icon: <BsClock className="me-1" />,
          text: "Pending",
        };
      default:
        return { variant: "secondary", icon: null, text: status };
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading comments...</p>
      </div>
    );
  }

  return (
    <div className="admin-comments-page">
      <h1 className="mb-4">Manage Comments</h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-6">
                <InputGroup>
                  <InputGroup.Text>
                    <BsSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search comments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="primary">
                    Search
                  </Button>
                </InputGroup>
              </div>
              <div className="col-md-4">
                <InputGroup>
                  <InputGroup.Text>
                    <BsFilter />
                  </InputGroup.Text>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">All Comments</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </InputGroup>
              </div>
              <div className="col-md-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCurrentPage(1);
                  }}
                  className="w-100"
                >
                  Reset
                </Button>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Comments Table */}
      <Card>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Author</th>
                  <th>Comment</th>
                  <th>Article</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <tr key={comment.id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img
                            src={
                              comment.author?.avatar ||
                              "https://via.placeholder.com/40x40?text=👤"
                            }
                            alt={comment.author?.username || "Anonymous"}
                            className="rounded-circle me-2"
                            width="40"
                            height="40"
                            style={{ objectFit: "cover" }}
                          />
                          <div>
                            <strong>
                              {comment.author?.username || "Anonymous"}
                            </strong>
                            <div className="small text-muted">
                              {comment.author?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div
                          className="comment-preview"
                          style={{
                            maxWidth: "300px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {comment.content}
                        </div>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0"
                          onClick={() => {
                            setSelectedComment(comment);
                            setShowContentModal(true);
                          }}
                        >
                          View full comment
                        </Button>
                      </td>
                      <td>
                        {comment.article ? (
                          <Link to={`/articles/${comment.article.slug}`}>
                            {comment.article.title}
                          </Link>
                        ) : (
                          <span className="text-muted">Unknown</span>
                        )}
                      </td>
                      <td>
                        <Badge
                          bg={
                            getStatusBadge(comment.status || "pending").variant
                          }
                        >
                          {getStatusBadge(comment.status || "pending").icon}
                          {getStatusBadge(comment.status || "pending").text}
                        </Badge>
                      </td>
                      <td>
                        {moment(comment.created_at).format("MMM D, YYYY")}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          {comment.status !== "approved" && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              title="Approve"
                              onClick={() =>
                                handleStatusUpdate(comment, "approved")
                              }
                              disabled={actionLoading}
                            >
                              <BsCheck2Circle />
                            </Button>
                          )}
                          {comment.status !== "rejected" && (
                            <Button
                              variant="outline-warning"
                              size="sm"
                              title="Reject"
                              onClick={() =>
                                handleStatusUpdate(comment, "rejected")
                              }
                              disabled={actionLoading}
                            >
                              <BsXCircle />
                            </Button>
                          )}
                          {comment.article && (
                            <Button
                              as={Link}
                              to={`/articles/${comment.article.slug}`}
                              variant="outline-primary"
                              size="sm"
                              title="View Article"
                            >
                              <BsEye />
                            </Button>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Delete"
                            onClick={() => {
                              setSelectedComment(comment);
                              setShowDeleteModal(true);
                            }}
                          >
                            <BsTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4">
                      No comments found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>

        {/* Pagination */}
        {totalPages > 1 && (
          <Card.Footer>
            <Pagination className="mb-0 justify-content-center">
              <Pagination.First
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              />

              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={currentPage === index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}

              <Pagination.Next
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Full Comment Modal */}
      <Modal
        show={showContentModal}
        onHide={() => setShowContentModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Comment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComment && (
            <div>
              <div className="mb-3">
                <strong>Author:</strong>{" "}
                {selectedComment.author?.username || "Anonymous"}
                {selectedComment.author?.email && (
                  <span className="text-muted">
                    {" "}
                    ({selectedComment.author.email})
                  </span>
                )}
              </div>
              <div className="mb-3">
                <strong>Article:</strong>{" "}
                {selectedComment.article ? (
                  <Link to={`/articles/${selectedComment.article.slug}`}>
                    {selectedComment.article.title}
                  </Link>
                ) : (
                  <span className="text-muted">Unknown</span>
                )}
              </div>
              <div className="mb-3">
                <strong>Posted:</strong>{" "}
                {moment(selectedComment.created_at).format(
                  "MMMM D, YYYY [at] h:mm A"
                )}
              </div>
              <div className="mb-3">
                <strong>Status:</strong>{" "}
                <Badge
                  bg={
                    getStatusBadge(selectedComment.status || "pending").variant
                  }
                >
                  {getStatusBadge(selectedComment.status || "pending").icon}
                  {getStatusBadge(selectedComment.status || "pending").text}
                </Badge>
              </div>
              <hr />
              <div>
                <strong>Comment:</strong>
                <p className="mt-2">{selectedComment.content}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowContentModal(false)}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <BsExclamationTriangle size={50} className="text-danger mb-3" />
            <h5>Are you sure you want to delete this comment?</h5>
            <p className="text-muted">
              By: {selectedComment?.author?.username || "Anonymous"}
            </p>
            <Alert variant="danger">This action cannot be undone!</Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Delete Comment"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CommentsPage;
