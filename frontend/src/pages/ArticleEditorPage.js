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
import {
  BsSave,
  BsEye,
  BsTrash,
  BsCheck2Circle,
  BsPencil,
  BsImage,
  BsQuestionCircle,
  BsArrowLeft,
} from "react-icons/bs";
import axios from "axios";
import { API_URL } from "../config";
import AuthContext from "../contexts/AuthContext";
import MarkdownEditor from "../components/editor/MarkdownEditor";
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

        // Calculate initial word count
        calculateWordCount(article.content || "");
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

  // Calculate word count
  const calculateWordCount = (content) => {
    const text = content.replace(/[^\w\s]/g, "");
    const words = text.split(/\s+/).filter((word) => word.length > 0);
    setWordCount(words.length);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setContentChanged(true);
  };

  // Handle content change
  const handleContentChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
    calculateWordCount(value);
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

    // Strip markdown and get first 160 characters
    const text = formData.content
      .replace(/#+\s+(.*)/g, "$1") // Remove headings
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // Replace links with just text
      .replace(/[*_~`]/g, "") // Remove formatting characters
      .replace(/\n/g, " ") // Replace newlines with spaces
      .trim();

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
        const text = articleData.content
          .replace(/#+\s+(.*)/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/[*_~`]/g, "")
          .replace(/\n/g, " ")
          .trim();

        articleData.excerpt =
          text.substring(0, 160) + (text.length > 160 ? "..." : "");
      }

      let response;

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
                    <MarkdownEditor
                      value={formData.content}
                      onChange={handleContentChange}
                      height="500px"
                    />
                    <div className="d-flex justify-content-between mt-2 text-muted">
                      <small>{wordCount} words</small>
                      <small>Markdown supported</small>
                    </div>
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
                      <div className="markdown-preview">
                        {/* This would be replaced with an actual markdown preview component */}
                        <div className="p-4 border rounded">
                          <h1>{formData.title || "Untitled Article"}</h1>
                          <div className="mb-3">
                            {formData.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                bg="secondary"
                                className="me-1"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="preview-content">
                            {formData.content ? (
                              <div>
                                {/* This is a placeholder for the actual rendered markdown */}
                                <div className="text-muted italic">
                                  [Preview of your markdown content would appear
                                  here]
                                </div>
                                <pre
                                  className="bg-light p-3 rounded mt-3"
                                  style={{
                                    maxHeight: "400px",
                                    overflow: "auto",
                                  }}
                                >
                                  {formData.content}
                                </pre>
                              </div>
                            ) : (
                              <div className="text-muted">
                                No content yet. Start writing in the Edit tab.
                              </div>
                            )}
                          </div>
                        </div>
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
                  </Form.Select>
                </Form.Group>

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