// frontend/src/pages/admin/ArticlesPage.migrated.js
// This is the migrated version using API hooks instead of direct axios calls
import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
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
import moment from "moment";
import ErrorAlert from "../../components/common/ErrorAlert";
import StatusBadge, { StatusTypes } from "../../components/common/StatusBadge";

// Import the API hooks
import { 
  useAdminArticles, 
  useBlockArticle, 
  useUnblockArticle, 
  useDeleteArticleAdmin 
} from "../../hooks/api/useAdmin";

/**
 * Admin Articles Management Page - MIGRATED VERSION
 * Demonstrates migration from direct axios calls to API hooks
 */
const ArticlesPageMigrated = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  // Use the admin articles hook
  const {
    data: articlesData,
    loading,
    error,
    refetch,
    pagination,
  } = useAdminArticles(
    {
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: statusFilter !== "all" ? statusFilter : undefined,
    },
    {
      enabled: true, // Always fetch
      refetchOnWindowFocus: false,
    }
  );

  // Use mutation hooks
  const blockArticleMutation = useBlockArticle({
    onSuccess: () => {
      setShowBlockModal(false);
      setSelectedArticle(null);
      setBlockReason("");
      refetch(); // Refetch articles after blocking
    },
    onError: (error) => {
      console.error("Error blocking article:", error);
    },
  });

  const unblockArticleMutation = useUnblockArticle({
    onSuccess: () => {
      setShowBlockModal(false);
      setSelectedArticle(null);
      refetch(); // Refetch articles after unblocking
    },
    onError: (error) => {
      console.error("Error unblocking article:", error);
    },
  });

  const deleteArticleMutation = useDeleteArticleAdmin({
    onSuccess: () => {
      setShowDeleteModal(false);
      setSelectedArticle(null);
      refetch(); // Refetch articles after deletion
    },
    onError: (error) => {
      console.error("Error deleting article:", error);
    },
  });

  // Extract articles from the data
  const articles = articlesData?.data || articlesData || [];
  const totalPages = pagination?.totalPages || 1;

  /**
   * Handle search submission
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  /**
   * Handle article blocking/unblocking
   */
  const handleBlockToggle = () => {
    if (!selectedArticle) return;

    if (selectedArticle.blocked) {
      unblockArticleMutation.mutate(selectedArticle.id);
    } else {
      blockArticleMutation.mutate({
        articleId: selectedArticle.id,
        reason: blockReason,
      });
    }
  };

  /**
   * Handle article deletion
   */
  const handleDelete = () => {
    if (!selectedArticle) return;
    deleteArticleMutation.mutate(selectedArticle.id);
  };

  /**
   * Get article status - prioritize blocked status
   */
  const getArticleStatus = (article) => {
    if (article.blocked) return 'blocked';
    return article.status;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading articles...</p>
      </div>
    );
  }

  // Calculate action loading state
  const actionLoading = 
    blockArticleMutation.loading || 
    unblockArticleMutation.loading || 
    deleteArticleMutation.loading;

  // Get action error
  const actionError = 
    blockArticleMutation.error?.message || 
    unblockArticleMutation.error?.message || 
    deleteArticleMutation.error?.message;

  return (
    <div className="admin-articles-page">
      <h1 className="mb-4">Manage Articles</h1>

      {error && (
        <Alert variant="danger" dismissible onClose={() => {}}>
          {error.message || "Failed to load articles. Please try again."}
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
                  variant="secondary"
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
                  <th style={{ width: "80px" }}>ID</th>
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
                          <Link
                            to={`/articles/${article.slug}`}
                            className="text-decoration-none"
                          >
                            <strong>{article.title}</strong>
                          </Link>
                          {article.featured_image && (
                            <div className="text-muted small mt-1">
                              <img
                                src={article.featured_image}
                                alt=""
                                style={{
                                  width: "60px",
                                  height: "40px",
                                  objectFit: "cover",
                                }}
                                className="rounded"
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td>{article.author?.username || "Unknown"}</td>
                      <td>
                        <StatusBadge 
                          status={getArticleStatus(article)} 
                          type={StatusTypes.ARTICLE}
                        />
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
      <Modal
        show={showBlockModal}
        onHide={() => setShowBlockModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedArticle?.blocked ? "Unblock Article" : "Block Article"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && (
            <ErrorAlert error={actionError} className="mb-3" />
          )}
          {selectedArticle?.blocked ? (
            <p>Are you sure you want to unblock this article?</p>
          ) : (
            <>
              <p>Are you sure you want to block this article?</p>
              <Form.Group>
                <Form.Label>Reason for blocking:</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Enter reason for blocking..."
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowBlockModal(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant={selectedArticle?.blocked ? "success" : "warning"}
            onClick={handleBlockToggle}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner size="sm" animation="border" className="me-2" />
            ) : null}
            {selectedArticle?.blocked ? "Unblock" : "Block"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Article</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {actionError && (
            <ErrorAlert error={actionError} className="mb-3" />
          )}
          <div className="text-center">
            <BsExclamationTriangle size={50} className="text-danger mb-3" />
            <h5>Are you sure you want to delete this article?</h5>
            <p className="text-muted">"{selectedArticle?.title}"</p>
            <Alert variant="danger">
              <strong>Warning:</strong> This action cannot be undone. The
              article and all associated comments will be permanently deleted.
            </Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <Spinner size="sm" animation="border" className="me-2" />
            ) : null}
            Delete Article
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ArticlesPageMigrated;