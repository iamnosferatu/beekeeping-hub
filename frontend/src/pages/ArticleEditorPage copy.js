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
  Badge,
  Tabs,
  Tab,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import moment from 'moment'
import {
  BsSave,
  BsEye,
  BsTrash,
  BsCheck2Circle,
  BsPencil,
  BsImage,
  BsShieldFillCheck,
  BsShieldExclamation,
  BsQuestionCircle,
  BsArrowLeft,
} from "react-icons/bs";
import axios from "axios";
import { API_URL } from "../config";
import AuthContext from "../contexts/AuthContext";
import WysiwygEditor from "../components/editor/WysiwygEditor"; // Change to WYSIWYG editor
import TagSelector from "../components/editor/TagSelector";
import "./ArticleEditorPage.scss";

const ArticleEditorPage = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

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
  const [activeTab, setActiveTab] = useState("edit");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contentChanged, setContentChanged] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [placeholderImage, setPlaceholderImage] = useState(
    "https://via.placeholder.com/1200x400?text=Featured+Image"
  );

  // Load article data if in edit mode
  useEffect(() => {
    const fetchArticle = async () => {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/articles/${id}`);

        if (!response.data.success) {
          throw new Error("Failed to load article");
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
        });
      } catch (err) {
        console.error("Error fetching article:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load article. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, isEditMode, user]);

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

  // Generate excerpt from content if not provided
  const generateExcerpt = () => {
    if (!formData.content) return;

    // Strip HTML tags and get first 160 characters
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = formData.content;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const excerpt = text.substring(0, 160) + (text.length > 160 ? "..." : "");

    setFormData((prev) => ({ ...prev, excerpt }));
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

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      // Prepare data
      const articleData = {
        ...formData,
        status: saveAsDraft ? "draft" : formData.status,
      };

      // If no excerpt provided, generate one
      if (!articleData.excerpt.trim()) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = articleData.content;
        const text = tempDiv.textContent || tempDiv.innerText || "";

        articleData.excerpt =
          text.substring(0, 160) + (text.length > 160 ? "..." : "");
      }

      let response;

      if (formData.blocked && user.role !== "admin") {
        // Preserve blocked status for non-admin users
        articleData.blocked = true;
        articleData.blocked_reason = formData.blocked_reason;
        articleData.blocked_by = formData.blocked_by;
        articleData.blocked_at = formData.blocked_at;
      }

      if (isEditMode) {
        // Update existing article
        response = await axios.put(`${API_URL}/articles/${id}`, articleData);
      } else {
        // Create new article
        response = await axios.post(`${API_URL}/articles`, articleData);
      }

      if (response.data.success) {
        setContentChanged(false);

        if (saveAsDraft) {
          setSuccessMessage("Article saved as draft");
          setFormData((prev) => ({ ...prev, status: "draft" }));
        } else {
          setSuccessMessage(
            isEditMode
              ? "Article updated successfully"
              : "Article created successfully"
          );

          // If not edit mode, redirect to new article
          if (!isEditMode) {
            setTimeout(() => {
              navigate(`/articles/${response.data.data.slug}`);
            }, 1500);
          }
        }
      } else {
        throw new Error(response.data.message || "Failed to save article");
      }
    } catch (err) {
      console.error("Error saving article:", err);
      setError(
        err.response?.data?.message ||
          "Failed to save article. Please try again."
      );
    } finally {
      setSaving(false);
    }
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

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key === "preview") {
      setPreviewLoading(true);
      // Simulate preview loading
      setTimeout(() => setPreviewLoading(false), 500);
    }
  };

  // Navigate back
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

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading article editor...</p>
      </div>
    );
  }

  // Permission error
  if (error && error.includes("permission")) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Permission Denied</Alert.Heading>
        <p>{error}</p>
        <div className="d-flex justify-content-end">
          <Button variant="outline-danger" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <Container fluid className="article-editor py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">
          {isEditMode ? "Edit Article" : "Create New Article"}
        </h1>

        <Button variant="outline-secondary" onClick={handleBack}>
          <BsArrowLeft className="me-2" /> Back
        </Button>
      </div>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      // 2. Add a blocked article notice component at the top of the editor form
      // (Place this right after successMessage Alert)
      {formData.blocked && (
        <Alert variant="danger" className="d-flex align-items-start mb-4">
          <div className="me-3 mt-1">
            <BsShieldExclamation size={24} />
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
              {moment(formData.blocked_at).format("MMMM D, YYYY [at] h:mm A")}
            </p>
            <hr />
            <p className="mb-0">
              You can edit this article to address the issues, but only an
              administrator can remove the block. Contact the administrator
              after making the necessary changes.
            </p>
          </div>
        </Alert>
      )}
      <Form onSubmit={(e) => handleSave(e, false)}>
        <Row>
          <Col lg={9}>
            <Card className="mb-4 shadow-sm">
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
                    className="form-control-lg"
                  />
                </Form.Group>

                <Tabs
                  activeKey={activeTab}
                  onSelect={handleTabChange}
                  className="mb-3 editor-tabs"
                >
                  <Tab
                    eventKey="edit"
                    title={
                      <span>
                        <BsPencil className="me-2" />
                        Edit
                      </span>
                    }
                  >
                    <WysiwygEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      height="500px"
                    />
                  </Tab>

                  <Tab
                    eventKey="preview"
                    title={
                      <span>
                        <BsEye className="me-2" />
                        Preview
                      </span>
                    }
                  >
                    {previewLoading ? (
                      <div className="text-center py-5">
                        <Spinner animation="border" size="sm" />
                        <p>Loading preview...</p>
                      </div>
                    ) : (
                      <div className="content-preview p-4 border rounded">
                        <h1>{formData.title || "Untitled Article"}</h1>

                        <div className="mb-3">
                          {formData.tags.map((tag, index) => (
                            <Badge key={index} bg="secondary" className="me-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {formData.content ? (
                          <div
                            className="article-content mt-4"
                            dangerouslySetInnerHTML={{
                              __html: formData.content,
                            }}
                          />
                        ) : (
                          <div className="text-muted">
                            No content yet. Start writing in the Edit tab.
                          </div>
                        )}
                      </div>
                    )}
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
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
            <Card className="mb-4 shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Publish</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    {formData.blocked && (
                      <option value="blocked" disabled>
                        Blocked (Cannot Change)
                      </option>
                    )}
                  </Form.Select>
                </Form.Group>
                {user.role === "admin" && formData.blocked && (
                  <Button
                    variant="outline-success"
                    className="d-block w-100 mb-3"
                    onClick={() => {
                      // Update form data to unblock
                      setFormData((prev) => ({
                        ...prev,
                        blocked: false,
                        blocked_reason: "",
                        blocked_by: null,
                        blocked_at: null,
                      }));
                      // Show success message
                      setSuccessMessage("Article unblocked successfully.");
                    }}
                  >
                    <BsShieldFillCheck className="me-2" />
                    Unblock Article
                  </Button>
                )}
                {user.role === "admin" && !formData.blocked && (
                  <Button
                    variant="outline-danger"
                    className="d-block w-100 mb-3"
                    onClick={() => {
                      // Show modal to confirm and provide reason
                      // Implementation would require a modal component
                      // For simplicity, we'll just set the values directly here
                      setFormData((prev) => ({
                        ...prev,
                        blocked: true,
                        blocked_reason:
                          "This article requires review. Please contact an administrator.",
                        blocked_by: {
                          id: user.id,
                          first_name: user.first_name,
                          last_name: user.last_name,
                        },
                        blocked_at: new Date().toISOString(),
                      }));
                      setSuccessMessage("Article has been blocked.");
                    }}
                  >
                    <BsShieldExclamation className="me-2" />
                    Block Article
                  </Button>
                )}
                <div className="d-grid gap-2">
                  <Button variant="primary" type="submit" disabled={saving}>
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
                    onClick={(e) => handleSave(e, true)}
                    disabled={saving}
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
                        <BsSave className="me-2" />
                        Save as Draft
                      </>
                    )}
                  </Button>

                  {isEditMode && (
                    <Button
                      variant="outline-danger"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={saving}
                    >
                      <BsTrash className="me-2" />
                      Delete Article
                    </Button>
                  )}
                </div>

                {showDeleteConfirm && (
                  <Alert variant="danger" className="mt-3">
                    <p>
                      Are you sure you want to delete this article? This action
                      cannot be undone.
                    </p>
                    <div className="d-flex justify-content-between">
                      <Button variant="danger" size="sm" onClick={handleDelete}>
                        Yes, Delete
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </Alert>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Featured Image</h5>
              </Card.Header>
              <Card.Body>
                <div className="featured-image-preview mb-3">
                  {formData.featured_image ? (
                    <img
                      src={formData.featured_image}
                      alt="Featured preview"
                      className="img-fluid rounded"
                    />
                  ) : (
                    <img
                      src={placeholderImage}
                      alt="Featured placeholder"
                      className="img-fluid rounded opacity-50"
                    />
                  )}
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

            <Card className="mb-4 shadow-sm">
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
    </Container>
  );
};

export default ArticleEditorPage;
