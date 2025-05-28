// frontend/src/pages/admin/TagsPage.js
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
  BsPlus,
  BsPencilSquare,
  BsTrash,
  BsTag,
  BsExclamationTriangle,
  BsHash,
  BsFileEarmarkText,
} from "react-icons/bs";
import axios from "axios";
import { API_URL } from "../../config";
import moment from "moment";

/**
 * Admin Tags Management Page
 *
 * Allows administrators to view, create, edit, and delete tags.
 * Shows tag usage statistics and allows bulk operations.
 */
const TagsPage = () => {
  // State management
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTag, setSelectedTag] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  // State for merge operation
  const [mergeTarget, setMergeTarget] = useState("");

  /**
   * Fetch tags from the backend with article counts
   */
  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("beekeeper_auth_token");

      // Fetch tags
      const tagsResponse = await axios.get(`${API_URL}/tags`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch articles to count tag usage
      const articlesResponse = await axios.get(`${API_URL}/articles`, {
        params: { limit: 1000 }, // Get all articles for accurate count
        headers: { Authorization: `Bearer ${token}` },
      });

      if (tagsResponse.data.success && articlesResponse.data.success) {
        const tagsData = tagsResponse.data.data || [];
        const articlesData = articlesResponse.data.data || [];

        // Count article usage for each tag
        const tagUsageMap = new Map();

        articlesData.forEach((article) => {
          if (article.tags && Array.isArray(article.tags)) {
            article.tags.forEach((tag) => {
              const tagId = tag.id || tag;
              tagUsageMap.set(tagId, (tagUsageMap.get(tagId) || 0) + 1);
            });
          }
        });

        // Enrich tags with article count
        const enrichedTags = tagsData.map((tag) => ({
          ...tag,
          article_count: tagUsageMap.get(tag.id) || 0,
        }));

        // Apply search filter
        let filteredTags = enrichedTags;
        if (searchTerm) {
          filteredTags = filteredTags.filter(
            (tag) =>
              tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              tag.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (tag.description &&
                tag.description
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()))
          );
        }

        // Apply sorting
        filteredTags.sort((a, b) => {
          switch (sortBy) {
            case "name":
              return a.name.localeCompare(b.name);
            case "usage":
              return b.article_count - a.article_count;
            case "date":
              return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            default:
              return 0;
          }
        });

        // Pagination
        const itemsPerPage = 10;
        const totalItems = filteredTags.length;
        const totalPagesCalc = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedTags = filteredTags.slice(
          startIndex,
          startIndex + itemsPerPage
        );

        setTags(paginatedTags);
        setTotalPages(totalPagesCalc);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setError("Failed to load tags. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, [currentPage, sortBy, searchTerm]);

  /**
   * Handle search submission
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  /**
   * Generate slug from name
   */
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  /**
   * Handle tag creation
   */
  const handleCreate = async () => {
    try {
      setActionLoading(true);
      const token = localStorage.getItem("beekeeper_auth_token");

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description.trim(),
      };

      const response = await axios.post(`${API_URL}/tags`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setShowCreateModal(false);
        setFormData({ name: "", slug: "", description: "" });
        fetchTags();
      }
    } catch (error) {
      console.error("Error creating tag:", error);

      if (error.response?.status === 409) {
        alert("A tag with this name or slug already exists.");
      } else if (error.response?.status === 404) {
        alert(
          "Tag creation endpoint not implemented. This would create a new tag in a production system."
        );
      } else {
        alert("Failed to create tag. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle tag update
   */
  const handleUpdate = async () => {
    if (!selectedTag) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("beekeeper_auth_token");

      const payload = {
        name: formData.name.trim(),
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description.trim(),
      };

      const response = await axios.put(
        `${API_URL}/tags/${selectedTag.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowEditModal(false);
        setSelectedTag(null);
        setFormData({ name: "", slug: "", description: "" });
        fetchTags();
      }
    } catch (error) {
      console.error("Error updating tag:", error);

      if (error.response?.status === 404) {
        alert(
          "Tag update endpoint not implemented. This would update the tag in a production system."
        );
      } else {
        alert("Failed to update tag. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle tag deletion
   */
  const handleDelete = async () => {
    if (!selectedTag) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("beekeeper_auth_token");

      const response = await axios.delete(`${API_URL}/tags/${selectedTag.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setShowDeleteModal(false);
        setSelectedTag(null);
        fetchTags();
      }
    } catch (error) {
      console.error("Error deleting tag:", error);

      if (error.response?.status === 404) {
        alert(
          "Tag deletion endpoint not implemented. This would delete the tag in a production system."
        );
      } else {
        alert("Failed to delete tag. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Handle tag merge
   */
  const handleMerge = async () => {
    if (!selectedTag || !mergeTarget) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem("beekeeper_auth_token");

      const response = await axios.post(
        `${API_URL}/admin/tags/${selectedTag.id}/merge`,
        { targetTagId: mergeTarget },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setShowMergeModal(false);
        setSelectedTag(null);
        setMergeTarget("");
        fetchTags();
      }
    } catch (error) {
      console.error("Error merging tags:", error);

      if (error.response?.status === 404) {
        alert(
          "Tag merge endpoint not implemented. This would merge tags in a production system."
        );
      } else {
        alert("Failed to merge tags. Please try again.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Get usage badge variant based on count
   */
  const getUsageBadge = (count) => {
    if (count === 0) return "secondary";
    if (count < 5) return "info";
    if (count < 10) return "primary";
    return "success";
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading tags...</p>
      </div>
    );
  }

  return (
    <div className="admin-tags-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">Manage Tags</h1>
        <Button
          variant="primary"
          onClick={() => {
            setFormData({ name: "", slug: "", description: "" });
            setShowCreateModal(true);
          }}
        >
          <BsPlus className="me-2" />
          Create Tag
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Sort Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-8">
                <InputGroup>
                  <InputGroup.Text>
                    <BsSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search tags by name, slug, or description..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </InputGroup>
              </div>
              <div className="col-md-4">
                <Form.Select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="name">Sort by Name</option>
                  <option value="usage">Sort by Usage</option>
                  <option value="date">Sort by Date Created</option>
                </Form.Select>
              </div>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Tags Table */}
      <Card>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Articles</th>
                  <th>Created</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.length > 0 ? (
                  tags.map((tag) => (
                    <tr key={tag.id}>
                      <td>{tag.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <BsTag className="me-2 text-muted" />
                          <strong>{tag.name}</strong>
                        </div>
                      </td>
                      <td>
                        <code>{tag.slug}</code>
                      </td>
                      <td>
                        <span
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: "200px" }}
                        >
                          {tag.description || (
                            <span className="text-muted">No description</span>
                          )}
                        </span>
                      </td>
                      <td>
                        <Badge bg={getUsageBadge(tag.article_count)}>
                          <BsFileEarmarkText className="me-1" />
                          {tag.article_count || 0}
                        </Badge>
                      </td>
                      <td>
                        {tag.created_at
                          ? moment(tag.created_at).format("MMM D, YYYY")
                          : "-"}
                      </td>
                      <td>
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            title="Edit"
                            onClick={() => {
                              setSelectedTag(tag);
                              setFormData({
                                name: tag.name,
                                slug: tag.slug,
                                description: tag.description || "",
                              });
                              setShowEditModal(true);
                            }}
                          >
                            <BsPencilSquare />
                          </Button>
                          {tag.article_count > 0 && (
                            <Button
                              variant="outline-info"
                              size="sm"
                              title="Merge with another tag"
                              onClick={() => {
                                setSelectedTag(tag);
                                setShowMergeModal(true);
                              }}
                            >
                              <BsHash />
                            </Button>
                          )}
                          <Button
                            variant="outline-danger"
                            size="sm"
                            title="Delete"
                            onClick={() => {
                              setSelectedTag(tag);
                              setShowDeleteModal(true);
                            }}
                            disabled={tag.article_count > 0}
                          >
                            <BsTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      No tags found
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

              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <Pagination.Item
                    key={pageNumber}
                    active={currentPage === pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                  >
                    {pageNumber}
                  </Pagination.Item>
                );
              })}

              {totalPages > 5 && currentPage < totalPages && (
                <>
                  <Pagination.Ellipsis />
                  <Pagination.Item onClick={() => setCurrentPage(totalPages)}>
                    {totalPages}
                  </Pagination.Item>
                </>
              )}

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

      {/* Create Tag Modal */}
      <Modal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Create New Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Tag Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  });
                }}
                placeholder="Enter tag name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Slug</Form.Label>
              <Form.Control
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="tag-slug"
              />
              <Form.Text className="text-muted">
                URL-friendly version of the name. Will be auto-generated if left
                empty.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description for this tag"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={actionLoading || !formData.name.trim()}
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Create Tag"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Tag Modal */}
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>
                Tag Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter tag name"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Slug</Form.Label>
              <Form.Control
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="tag-slug"
              />
              <Form.Text className="text-muted">
                Changing the slug will break existing links to this tag.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional description for this tag"
              />
            </Form.Group>
          </Form>

          {selectedTag?.article_count > 0 && (
            <Alert variant="info">
              This tag is used by {selectedTag.article_count} article
              {selectedTag.article_count !== 1 ? "s" : ""}. Changes will affect
              all tagged articles.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={actionLoading || !formData.name.trim()}
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Update Tag"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Merge Tags Modal */}
      <Modal show={showMergeModal} onHide={() => setShowMergeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Merge Tags</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Merge <strong>"{selectedTag?.name}"</strong> into another tag. All
            articles with this tag will be updated to use the target tag
            instead.
          </p>

          <Form.Group>
            <Form.Label>Select Target Tag</Form.Label>
            <Form.Select
              value={mergeTarget}
              onChange={(e) => setMergeTarget(e.target.value)}
            >
              <option value="">Choose a tag...</option>
              {tags
                .filter((tag) => tag.id !== selectedTag?.id)
                .map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name} ({tag.article_count} articles)
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Alert variant="warning" className="mt-3">
            <strong>Warning:</strong> This action cannot be undone. The tag "
            {selectedTag?.name}" will be deleted after merging.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowMergeModal(false)}>
            Cancel
          </Button>
          <Button
            variant="warning"
            onClick={handleMerge}
            disabled={actionLoading || !mergeTarget}
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Merge Tags"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Tag</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <BsExclamationTriangle size={50} className="text-danger mb-3" />
            <h5>Are you sure you want to delete this tag?</h5>
            <p className="text-muted">"{selectedTag?.name}"</p>

            {selectedTag?.article_count > 0 ? (
              <Alert variant="danger">
                This tag cannot be deleted because it is used by{" "}
                {selectedTag.article_count} article
                {selectedTag.article_count !== 1 ? "s" : ""}. Consider merging
                it with another tag instead.
              </Alert>
            ) : (
              <Alert variant="warning">This action cannot be undone!</Alert>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={actionLoading || selectedTag?.article_count > 0}
          >
            {actionLoading ? (
              <Spinner animation="border" size="sm" />
            ) : (
              "Delete Tag"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TagsPage;
