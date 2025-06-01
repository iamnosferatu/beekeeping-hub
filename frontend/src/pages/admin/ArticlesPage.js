// frontend/src/pages/admin/ArticlesPage.js
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
  BsSearch,
  BsFilter,
  BsPencilSquare,
  BsTrash,
  BsEye,
  BsShieldX,
  BsShieldCheck,
  BsExclamationTriangle,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";
import ErrorAlert from "../../components/common/ErrorAlert";

/**
 * Admin Articles Management Page
 *
 * Allows administrators to view, manage, block/unblock, and delete articles.
 * Includes search, filtering, and pagination functionality.
 */
const ArticlesPage = () => {
  // State management
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  /**
   * Fetch articles from the backend
   */
  const fetchArticles = async () => {
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

      const response = await axios.get(`${API_URL}/articles`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setArticles(response.data.data || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
      setError("Failed to load articles. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [currentPage, statusFilter]);

  /**
   * Handle search submission
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles();
  };

  /**
   * Handle article blocking/unblocking
   */
  const handleBlockToggle = async () => {
    if (!selectedArticle) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("beekeeper_auth_token");

      const endpoint = selectedArticle.blocked
        ? `${API_URL}/admin/articles/${selectedArticle.id}/unblock`
        : `${API_URL}/admin/articles/${selectedArticle.id}/block`;

      const payload = selectedArticle.blocked ? {} : { reason: blockReason };

      const response = await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        // Update local state
        setArticles(
          articles.map((article) =>
            article.id === selectedArticle.id
              ? {
                  ...article,
                  blocked: !article.blocked,
                  blocked_reason: blockReason,
                }
              : article
          )
        );

        setShowBlockModal(false);
        setSelectedArticle(null);
        setBlockReason("");
        setActionError(null);
      }
    } catch (error) {
      console.error("Error toggling block status:", error);
      setActionError("Failed to update article status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle article deletion
   */
  const handleDelete = async () => {
    if (!selectedArticle) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("beekeeper_auth_token");

      const response = await axios.delete(
        `${API_URL}/articles/${selectedArticle.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove from local state
        setArticles(
          articles.filter((article) => article.id !== selectedArticle.id)
        );
        setShowDeleteModal(false);
        setSelectedArticle(null);
        setActionError(null);
      }
    } catch (error) {
      console.error("Error deleting article:", error);
      setActionError("Failed to delete article. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Get status badge variant
   */
  const getStatusBadge = (article) => {
    if (article.blocked) return { variant: "danger", text: "Blocked" };
    if (article.status === "published")
      return { variant: "success", text: "Published" };
    if (article.status === "draft")
      return { variant: "secondary", text: "Draft" };
    return { variant: "warning", text: article.status };
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading articles...</p>
      </div>
    );
  }

  return (
    <div className="admin-articles-page">
      <h1 className="mb-4">Manage Articles</h1>

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
                    placeholder="Search articles..."
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
                    <option value="all">All Articles</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="blocked">Blocked</option>
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

      {/* Articles Table */}
      <Card>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Views</th>
                  <th>Comments</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <tr key={article.id}>
                      <td>{article.id}</td>
                      <td>
                        <div>
                          <strong>{article.title}</strong>
                          {article.blocked && (
                            <div className="small text-danger">
                              Blocked:{" "}
                              {article.blocked_reason || "No reason specified"}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{article.author?.username || "Unknown"}</td>
                      <td>
                        <Badge bg={getStatusBadge(article).variant}>
                          {getStatusBadge(article).text}
                        </Badge>
                      </td>
                      <td>
                        {article.published_at
                          ? moment(article.published_at).format("MMM D, YYYY")
                          : "-"}
                      </td>
                      <td>{article.view_count || 0}</td>
                      <td>{article.comment_count || 0}</td>
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            as={Link}
                            to={`/articles/${article.slug}`}
                            variant="outline-primary"
                            size="sm"
                            title="View"
                          >
                            <BsEye />
                          </Button>
                          <Button
                            as={Link}
                            to={`/editor/${article.id}`}
                            variant="outline-secondary"
                            size="sm"
                            title="Edit"
                          >
                            <BsPencilSquare />
                          </Button>
                          <Button
                            variant={
                              article.blocked
                                ? "outline-success"
                                : "outline-warning"
                            }
                            size="sm"
                            title={article.blocked ? "Unblock" : "Block"}
                            onClick={() => {
                              setSelectedArticle(article);
                              setShowBlockModal(true);
                            }}
                          >
                            {article.blocked ? (
                              <BsShieldCheck />
                            ) : (
                              <BsShieldX />
                            )}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Delete"
                            onClick={() => {
                              setSelectedArticle(article);
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
                    <td colSpan="8" className="text-center py-4">
                      No articles found
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

      {/* Block/Unblock Modal */}
      <Modal show={showBlockModal} onHide={() => setShowBlockModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedArticle?.blocked ? "Unblock" : "Block"} Article
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && (
            <ErrorAlert 
              error={actionError} 
              onDismiss={() => setActionError(null)}
              className="mb-3"
            />
          )}
          {selectedArticle?.blocked ? (
            <p>Are you sure you want to unblock this article?</p>
          ) : (
            <>
              <p>Please provide a reason for blocking this article:</p>
              <Form.Control
                as="textarea"
                rows={3}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking..."
                required
              />
            </>
          )}
          <div className="mt-3">
            <strong>Article:</strong> {selectedArticle?.title}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBlockModal(false)}>
            Cancel
          </Button>
          <Button
            variant={selectedArticle?.blocked ? "success" : "warning"}
            onClick={handleBlockToggle}
            disabled={
              actionLoading || (!selectedArticle?.blocked && !blockReason)
            }
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" />
            ) : selectedArticle?.blocked ? (
              "Unblock"
            ) : (
              "Block"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Article</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && (
            <ErrorAlert 
              error={actionError} 
              onDismiss={() => setActionError(null)}
              className="mb-3"
            />
          )}
          <div className="text-center">
            <BsExclamationTriangle size={50} className="text-danger mb-3" />
            <h5>Are you sure you want to delete this article?</h5>
            <p className="text-muted">{selectedArticle?.title}</p>
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
              "Delete Article"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ArticlesPage;
