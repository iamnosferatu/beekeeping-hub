// frontend/src/pages/ArticleEditorPage.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Card,
  Row,
  Col,
  Alert,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Modal,
} from "react-bootstrap";
import {
  BsQuestionCircle,
  BsCheck2Circle,
  BsSave,
  BsTrash,
  BsExclamationTriangle,
} from "react-icons/bs";
import axios from "axios";
import moment from "moment";
import { API_URL } from "../config";
import AuthContext from "../contexts/AuthContext";
import WysiwygEditor from "../components/editor/WysiwygEditor";
import TagSelector from "../components/editor/TagSelector";
import "./ArticleEditorPage.scss";

const ArticleEditorPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Placeholder image for featured image
  const placeholderImage =
    "https://via.placeholder.com/1200x400?text=Featured+Image";

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    featured_image: "",
    status: "draft",
    tags: [],
    blocked: false,
    blocked_reason: "",
    blocked_by: null,
    blocked_at: null,
  });

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contentChanged, setContentChanged] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setContentChanged(true);
  };

  // Handle content change from WYSIWYG editor
  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
    setContentChanged(true);
  };

  // Handle tags change
  const handleTagsChange = (tags) => {
    setFormData((prev) => ({ ...prev, tags }));
    setContentChanged(true);
  };

  // Generate excerpt from content
  const generateExcerpt = () => {
    if (!formData.content) return;

    // Strip HTML tags and get first 160 characters
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = formData.content;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const excerpt = text.substring(0, 160) + (text.length > 160 ? "..." : "");

    setFormData((prev) => ({ ...prev, excerpt }));
  };

  // Navigate back safely
  const handleBack = () => {
    if (contentChanged) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  // Render debug information
  const renderDebugInfo = () => {
    if (!debugInfo) return null;

    return (
      <Card className="mt-3 bg-light">
        <Card.Header>Debug Information</Card.Header>
        <Card.Body>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </Card.Body>
      </Card>
    );
  };

  // Handle delete
  const handleDelete = async () => {
    if (!isEditMode) return;

    try {
      setLoading(true);
      setError(null);

      const response = await axios.delete(`${API_URL}/articles/${id}`);

      if (response.data.success) {
        navigate("/my-articles", {
          state: { message: "Article deleted successfully" },
        });
      } else {
        throw new Error(response.data.message || "Failed to delete article");
      }
    } catch (err) {
      console.error("Error deleting article:", err);
      setError(
        err.response?.data?.message ||
          "Failed to delete article. Please try again."
      );
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle save/publish
  const handleSave = async (e, saveAsDraft = false) => {
    e.preventDefault();

    // Validate form
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    // Define articleData before the try block
    const articleData = {
      ...formData,
      status: saveAsDraft ? "draft" : formData.status,
      // Generate excerpt if not provided
      excerpt:
        formData.excerpt.trim() ||
        (() => {
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = formData.content;
          const text = tempDiv.textContent || tempDiv.innerText || "";
          return text.substring(0, 160) + (text.length > 160 ? "..." : "");
        })(),
    };

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      let response;

      // Determine whether to update or create
      if (isEditMode) {
        // Update existing article
        response = await axios.put(`${API_URL}/articles/${id}`, articleData);
      } else {
        // Create new article
        response = await axios.post(`${API_URL}/articles`, articleData);
      }

      if (response.data.success) {
        // Reset content changed flag
        setContentChanged(false);

        // Set success message
        setSuccessMessage(
          isEditMode
            ? "Article updated successfully"
            : "Article created successfully"
        );

        // Navigate to article if creating new
        if (!isEditMode) {
          const newSlug =
            response.data.data.slug || response.data.data.id.toString();

          setTimeout(() => {
            navigate(`/articles/${newSlug}`);
          }, 1500);
        }
      } else {
        throw new Error(response.data.message || "Failed to save article");
      }
    } catch (err) {
      console.error("Error saving article:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to save article. Please check your connection and try again.";

      setError(errorMessage);

      // Capture debug information
      setDebugInfo({
        errorMessage,
        fullError: err,
        requestData: articleData,
      });
    } finally {
      setSaving(false);
    }
  };

  // loading articles...
  useEffect(() => {
    const fetchArticle = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setDebugInfo(null);
        console.log("Fetch Attempt Details:");
        console.log("Current ID:", id);
        console.log("Is Edit Mode:", isEditMode);
        console.log("User ID:", user?.id);
        console.log("Full User Object:", user);

        // Log all available routes
        const fetchStrategies = [
          async () => {
            console.log("Attempting fetch by slug: /articles/{slug}");
            const response = await axios.get(`${API_URL}/articles/${id}`);
            console.log("Slug Fetch Response:", response.data);
            return response;
          },
          async () => {
            console.log("Attempting fetch by ID: /articles/byId/{id}");
            const response = await axios.get(`${API_URL}/articles/byId/${id}`);
            console.log("ID Fetch Response:", response.data);
            return response;
          },
        ];

        let response;
        let fetchError = null;

        for (const strategy of fetchStrategies) {
          try {
            response = await strategy();

            // Log full response for debugging
            console.log("Fetch response:", response.data);

            // Break if successful
            if (response.data.success) break;
          } catch (strategyError) {
            console.warn("Fetch strategy failed:", strategyError);
            fetchError = strategyError;
          }
        }

        // Validate response
        if (!response || !response.data.success) {
          throw new Error(
            "Failed to load article: " +
              (fetchError?.message || "Unable to fetch using any strategy")
          );
        }

        const article = response.data.data;

        // Check if user has permission to edit
        if (user.id !== article.user_id && user.role !== "admin") {
          setError("You don't have permission to edit this article");
          return;
        }

        // Set form data from article
        setFormData({
          title: article.title || "",
          content: article.content || "",
          excerpt: article.excerpt || "",
          featured_image: article.featured_image || "",
          status: article.status || "draft",
          tags: article.tags ? article.tags.map((tag) => tag.name) : [],
          blocked: article.blocked || false,
          blocked_reason: article.blocked_reason || "",
          blocked_by: article.blocked_by || null,
          blocked_at: article.blocked_at || null,
        });

        console.log("Article loaded successfully:", formData);
      } catch (err) {
        console.error("Detailed Fetch Error:", {
          errorMessage: err.message,
          errorResponse: err.response?.data,
          errorStatus: err.response?.status,
          requestURL: err.config?.url,
          fullError: err,
        });
      } finally {
        console.groupEnd();
      }
    };

    fetchArticle();
  }, [id, isEditMode, user, formData]);

  return (
    <Container fluid className="article-editor py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          {isEditMode ? "Edit Article" : "Create New Article"}
        </h1>
        <Button variant="outline-secondary" onClick={handleBack}>
          Back
        </Button>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {renderDebugInfo()}

      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Blocked Article Notice */}
      {formData.blocked && (
        <Alert variant="danger" className="d-flex align-items-start mb-4">
          <div className="me-3 mt-1">
            <BsExclamationTriangle size={24} />
          </div>
          <div>
            <Alert.Heading>This Article Has Been Blocked</Alert.Heading>
            <p>
              <strong>Reason:</strong>{" "}
              {formData.blocked_reason || "No specific reason provided."}
            </p>
            <p>
              <strong>Blocked by:</strong> {formData.blocked_by?.first_name}{" "}
              {formData.blocked_by?.last_name || "Administrator"}
              <br />
              <strong>Blocked on:</strong>{" "}
              {formData.blocked_at
                ? moment(formData.blocked_at).format("MMMM D, YYYY [at] h:mm A")
                : "Unknown date"}
            </p>
          </div>
        </Alert>
      )}

      <Form onSubmit={(e) => handleSave(e, false)}>
        <Row>
          <Col lg={9}>
            <Card className="mb-4">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter article title"
                    required
                  />
                </Form.Group>

                <WysiwygEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  height="500px"
                />
              </Card.Body>
            </Card>

            {/* Excerpt Card */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Excerpt</h5>
              </Card.Header>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label>
                    Article excerpt (displayed in article listings)
                  </Form.Label>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    type="button"
                    onClick={generateExcerpt}
                  >
                    Generate from content
                  </Button>
                </div>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  placeholder="Enter a brief excerpt or summary of your article"
                />
                <Form.Text className="text-muted">
                  If left empty, an excerpt will be automatically generated from
                  your content.
                </Form.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3}>
            {/* Status Card */}
            <Card className="mb-4">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={formData.blocked}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </Form.Select>
                </Form.Group>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={saving || formData.blocked}
                  >
                    {saving ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <BsCheck2Circle className="me-2" />
                        {formData.status === "published"
                          ? "Publish"
                          : "Save and Publish"}
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={(e) => handleSave(e, true)}
                    disabled={saving || formData.blocked}
                  >
                    <BsSave className="me-2" />
                    Save as Draft
                  </Button>

                  {isEditMode && (
                    <Button
                      variant="outline-danger"
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={saving}
                    >
                      <BsTrash className="me-2" />
                      Delete Article
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>

            {/* Featured Image Card */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Featured Image</h5>
              </Card.Header>
              <Card.Body>
                <div className="featured-image-preview mb-3">
                  <img
                    src={formData.featured_image || placeholderImage}
                    alt="Featured preview"
                    className="img-fluid rounded"
                    style={{
                      height: "200px",
                      width: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                <Form.Group>
                  <Form.Label>
                    Image URL
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          Enter the URL of an image to use as the featured image
                          for this article
                        </Tooltip>
                      }
                    >
                      <BsQuestionCircle className="ms-2 text-muted" />
                    </OverlayTrigger>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Form.Text className="text-muted">
                    Recommended size: 1200x400 pixels
                  </Form.Text>
                </Form.Group>
              </Card.Body>
            </Card>

            {/* Tags Card */}
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Tags</h5>
              </Card.Header>
              <Card.Body>
                <TagSelector
                  selectedTags={formData.tags}
                  onChange={handleTagsChange}
                />
                <Form.Text className="text-muted">
                  Tags help users find your article. Add up to 5 tags.
                </Form.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteConfirm}
        onHide={() => setShowDeleteConfirm(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Article</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <BsExclamationTriangle size={50} className="text-danger mb-3" />
            <h5>Are you sure you want to delete this article?</h5>
            <p className="text-muted">
              This action cannot be undone. The article will be permanently
              removed from your account.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteConfirm(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Article
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ArticleEditorPage;
