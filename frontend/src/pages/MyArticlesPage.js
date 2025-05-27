// frontend/src/pages/MyArticlesPage.js
import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Card,
  Button,
  Row,
  Col,
  Table,
  Nav,
  Badge,
  Dropdown,
  Alert,
  Spinner,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  BsPencilSquare,
  BsEye,
  BsTrash,
  BsFilter,
  BsFileEarmarkText,
  BsFillHeartFill,
  BsChat,
  BsPlus,
  BsCalendar3,
  BsExclamationTriangle,
  BsShieldExclamation,
  BsInfoCircleFill,
} from "react-icons/bs";
import axios from "axios";
import moment from "moment";
import { API_URL } from "../config";
import AuthContext from "../contexts/AuthContext";
import "./MyArticlesPage.scss";

const MyArticlesPage = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // State
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all, draft, published, blocked
  const [sortBy, setSortBy] = useState("date-desc"); // date-desc, date-asc, title, views
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    blocked: 0,
    views: 0,
    likes: 0,
    comments: 0,
  });
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || null
  );
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    articleId: null,
    articleTitle: "",
  });
  const [blockedInfoModal, setBlockedInfoModal] = useState({
    show: false,
    article: null,
  });

  // Calculate statistics
  const updateStats = (articles) => {
    const published = articles.filter(
      (a) => a.status === "published" && !a.blocked
    );
    const draft = articles.filter((a) => a.status === "draft");
    const blocked = articles.filter((a) => a.blocked);

    const newStats = {
      total: articles.length,
      published: published.length,
      draft: draft.length,
      blocked: blocked.length,
      views: articles.reduce(
        (sum, article) => sum + (article.view_count || 0),
        0
      ),
      likes: articles.reduce(
        (sum, article) => sum + (article.like_count || 0),
        0
      ),
      comments: articles.reduce(
        (sum, article) => sum + (article.comments?.length || 0),
        0
      ),
    };

    setStats(newStats);
  };

  // Fetch user's articles
  useEffect(() => {
    const fetchArticles = async () => {
      // Check if user exists INSIDE the effect, not as a condition for the effect
      if (!user) {
        setLoading(false);
        setError("Please log in to view your articles");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Use the API service to fetch user's articles
        const response = await axios.get(`${API_URL}/articles`, {
          params: { author: user.id },
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "beekeeper_auth_token"
            )}`,
          },
        });

        if (response.data.success) {
          const userArticles = response.data.data || [];
          setArticles(userArticles);
          updateStats(userArticles);
        } else {
          throw new Error(response.data.message || "Failed to fetch articles");
        }
      } catch (err) {
        console.error("Error fetching articles:", err);

        if (err.response?.status === 401) {
          setError("Authentication expired. Please log in again.");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view articles.");
        } else if (!err.response) {
          setError(
            "Unable to connect to server. Please ensure the backend is running on port 8080."
          );
        } else {
          setError("Failed to load your articles. Please try again.");
        }

        // Set empty array to prevent issues with undefined
        setArticles([]);
        updateStats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [user]); // This useEffect is NOT conditional - it always runs

  // Filter articles
  const getFilteredArticles = () => {
    if (filter === "all") return articles;
    if (filter === "blocked")
      return articles.filter((article) => article.blocked);
    return articles.filter(
      (article) => article.status === filter && !article.blocked
    );
  };

  // Sort articles
  const getSortedArticles = () => {
    const filtered = getFilteredArticles();

    switch (sortBy) {
      case "date-asc":
        return [...filtered].sort(
          (a, b) =>
            new Date(a.published_at || a.created_at || 0) -
            new Date(b.published_at || b.created_at || 0)
        );
      case "date-desc":
        return [...filtered].sort(
          (a, b) =>
            new Date(b.published_at || b.created_at || 0) -
            new Date(a.published_at || a.created_at || 0)
        );
      case "title":
        return [...filtered].sort((a, b) => a.title.localeCompare(b.title));
      case "views":
        return [...filtered].sort(
          (a, b) => (b.view_count || 0) - (a.view_count || 0)
        );
      default:
        return filtered;
    }
  };

  // Handle article deletion
  const deleteArticle = async () => {
    try {
      const { articleId } = deleteModal;

      if (!articleId) return;

      const response = await axios.delete(`${API_URL}/articles/${articleId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "beekeeper_auth_token"
          )}`,
        },
      });

      if (response.data.success) {
        // Update articles list
        const updatedArticles = articles.filter(
          (article) => article.id !== articleId
        );
        setArticles(updatedArticles);
        setSuccessMessage("Article deleted successfully");

        // Update stats
        updateStats(updatedArticles);
      }
    } catch (err) {
      console.error("Error deleting article:", err);
      setError("Failed to delete article. Please try again.");
    } finally {
      setDeleteModal({ show: false, articleId: null, articleTitle: "" });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading your articles...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <div className="d-flex justify-content-end">
          <Button
            variant="outline-danger"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  // Empty state
  if (articles.length === 0) {
    return (
      <div className="my-articles-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">My Articles</h1>
          <Link to="/editor">
            <Button variant="primary">
              <BsPlus className="me-2" />
              Create New Article
            </Button>
          </Link>
        </div>

        <Card className="shadow-sm">
          <Card.Body className="text-center py-5">
            <BsFileEarmarkText size={50} className="text-muted mb-3" />
            <h4>You haven't created any articles yet</h4>
            <p className="text-muted">
              Start sharing your beekeeping knowledge and experiences
            </p>
            <Link to="/editor">
              <Button variant="primary" size="lg" className="mt-3">
                <BsPlus className="me-2" />
                Create Your First Article
              </Button>
            </Link>
          </Card.Body>
        </Card>
      </div>
    );
  }

  const filteredSortedArticles = getSortedArticles();

  return (
    <div className="my-articles-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">My Articles</h1>
        <Link to="/editor">
          <Button variant="primary">
            <BsPlus className="me-2" />
            Create New Article
          </Button>
        </Link>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
          className="mb-4"
        >
          {successMessage}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3 mb-md-0">
          <Card className="shadow-sm h-100 stats-card">
            <Card.Body className="text-center">
              <h2 className="display-4 fw-bold text-primary">{stats.total}</h2>
              <p className="text-muted mb-0">Total Articles</p>
              <div className="d-flex justify-content-center mt-3">
                <Badge bg="success" className="mx-1 p-2">
                  {stats.published} Published
                </Badge>
                <Badge bg="secondary" className="mx-1 p-2">
                  {stats.draft} Draft
                </Badge>
                {stats.blocked > 0 && (
                  <Badge bg="danger" className="mx-1 p-2">
                    {stats.blocked} Blocked
                  </Badge>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3 mb-md-0">
          <Card className="shadow-sm h-100 stats-card">
            <Card.Body className="text-center">
              <h2 className="display-4 fw-bold text-primary">{stats.views}</h2>
              <p className="text-muted mb-0">Total Views</p>
              <div className="mt-3">
                <small className="text-muted">
                  <BsEye className="me-1" /> Average:{" "}
                  {stats.published > 0
                    ? Math.round(stats.views / stats.published)
                    : 0}{" "}
                  per article
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm h-100 stats-card">
            <Card.Body className="text-center">
              <div className="d-flex justify-content-around">
                <div className="text-center">
                  <h3 className="display-5 fw-bold text-danger">
                    {stats.likes}
                  </h3>
                  <p className="text-muted mb-0">
                    <BsFillHeartFill className="me-1" /> Likes
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="display-5 fw-bold text-info">
                    {stats.comments}
                  </h3>
                  <p className="text-muted mb-0">
                    <BsChat className="me-1" /> Comments
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters & Controls */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-center">
            <Nav variant="pills" className="mb-3 mb-md-0">
              <Nav.Item>
                <Nav.Link
                  active={filter === "all"}
                  onClick={() => setFilter("all")}
                >
                  All ({articles.length})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={filter === "published"}
                  onClick={() => setFilter("published")}
                >
                  Published ({stats.published})
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  active={filter === "draft"}
                  onClick={() => setFilter("draft")}
                >
                  Drafts ({stats.draft})
                </Nav.Link>
              </Nav.Item>
              {stats.blocked > 0 && (
                <Nav.Item>
                  <Nav.Link
                    active={filter === "blocked"}
                    onClick={() => setFilter("blocked")}
                    className="text-danger"
                  >
                    Blocked ({stats.blocked})
                  </Nav.Link>
                </Nav.Item>
              )}
            </Nav>

            <div className="d-flex">
              <Dropdown className="me-2">
                <Dropdown.Toggle
                  variant="outline-secondary"
                  id="filter-dropdown"
                >
                  <BsFilter className="me-2" />
                  Sort By
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    active={sortBy === "date-desc"}
                    onClick={() => setSortBy("date-desc")}
                  >
                    Newest First
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortBy === "date-asc"}
                    onClick={() => setSortBy("date-asc")}
                  >
                    Oldest First
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortBy === "title"}
                    onClick={() => setSortBy("title")}
                  >
                    Title A-Z
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={sortBy === "views"}
                    onClick={() => setSortBy("views")}
                  >
                    Most Views
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Articles Table */}
      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-dark">
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Views</th>
                  <th>Likes</th>
                  <th>Comments</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSortedArticles.map((article) => (
                  <tr
                    key={article.id}
                    className={article.blocked ? "table-danger" : ""}
                  >
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <div>
                          <h6 className="mb-0">
                            {article.title}
                            {article.blocked && (
                              <span className="ms-2">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip>
                                      This article has been blocked by an
                                      administrator. Click for details.
                                    </Tooltip>
                                  }
                                >
                                  <BsShieldExclamation
                                    className="text-danger"
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                      setBlockedInfoModal({
                                        show: true,
                                        article,
                                      })
                                    }
                                  />
                                </OverlayTrigger>
                              </span>
                            )}
                          </h6>
                          <div className="text-muted small">
                            {article.tags?.map((tag) => (
                              <Badge
                                bg="secondary"
                                key={tag.id}
                                className="me-1"
                                style={{ opacity: 0.7 }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">
                      <Badge
                        bg={
                          article.blocked
                            ? "danger"
                            : article.status === "published"
                            ? "success"
                            : "secondary"
                        }
                        className="p-2"
                      >
                        {article.blocked ? "Blocked" : article.status}
                      </Badge>
                    </td>
                    <td className="align-middle">
                      {article.published_at ? (
                        <span
                          title={moment(article.published_at).format(
                            "MMMM D, YYYY h:mm A"
                          )}
                        >
                          <BsCalendar3 className="me-1" />
                          {moment(article.published_at).format("MMM D, YYYY")}
                        </span>
                      ) : (
                        <span className="text-muted">
                          <BsCalendar3 className="me-1" />
                          Not published
                        </span>
                      )}
                    </td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <BsEye className="me-1 text-muted" />
                        {article.view_count || 0}
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <BsFillHeartFill className="me-1 text-danger" />
                        {article.like_count || 0}
                      </div>
                    </td>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        <BsChat className="me-1 text-info" />
                        {article.comments?.length || 0}
                      </div>
                    </td>
                    <td className="align-middle text-end">
                      <div className="d-flex justify-content-end">
                        {article.status === "published" && !article.blocked && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            as={Link}
                            to={`/articles/${article.slug}`}
                            title="View Article"
                          >
                            <BsEye />
                          </Button>
                        )}
                        {article.blocked && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="me-2"
                            onClick={() =>
                              setBlockedInfoModal({ show: true, article })
                            }
                            title="View Block Reason"
                          >
                            <BsInfoCircleFill />
                          </Button>
                        )}
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-2"
                          as={Link}
                          to={`/editor/${article.id}`}
                          title={
                            article.blocked
                              ? "Edit (Blocked Article)"
                              : "Edit Article"
                          }
                        >
                          <BsPencilSquare />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() =>
                            setDeleteModal({
                              show: true,
                              articleId: article.id,
                              articleTitle: article.title,
                            })
                          }
                          title="Delete Article"
                        >
                          <BsTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        show={deleteModal.show}
        onHide={() =>
          setDeleteModal({ show: false, articleId: null, articleTitle: "" })
        }
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Article</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-4">
            <BsExclamationTriangle size={50} className="text-danger mb-3" />
            <h5>Are you sure you want to delete this article?</h5>
            <p className="text-muted">"{deleteModal.articleTitle}"</p>
            <p className="text-danger font-weight-bold">
              This action cannot be undone.
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() =>
              setDeleteModal({ show: false, articleId: null, articleTitle: "" })
            }
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteArticle}>
            Delete Article
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Blocked Article Info Modal */}
      <Modal
        show={blockedInfoModal.show}
        onHide={() => setBlockedInfoModal({ show: false, article: null })}
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <BsShieldExclamation className="me-2" />
            Article Blocked
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h5 className="mb-3">{blockedInfoModal.article?.title}</h5>

            <div className="border-top border-bottom py-3 mb-3">
              <h6 className="text-danger mb-2">Reason for blocking:</h6>
              <p>
                {blockedInfoModal.article?.blocked_reason ||
                  "No specific reason provided."}
              </p>
            </div>

            <div className="mb-3">
              <strong>Blocked by:</strong>{" "}
              {blockedInfoModal.article?.blocked_by?.first_name}{" "}
              {blockedInfoModal.article?.blocked_by?.last_name}
              <br />
              <strong>Blocked on:</strong>{" "}
              {blockedInfoModal.article?.blocked_at
                ? moment(blockedInfoModal.article.blocked_at).format(
                    "MMMM D, YYYY [at] h:mm A"
                  )
                : "Unknown date"}
            </div>

            <Alert variant="info">
              <BsInfoCircleFill className="me-2" />
              You can edit this article to address the issues, but only an
              administrator can remove the block. Contact an administrator after
              making the necessary changes.
            </Alert>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setBlockedInfoModal({ show: false, article: null })}
          >
            Close
          </Button>
          <Button
            variant="primary"
            as={Link}
            to={`/editor/${blockedInfoModal.article?.id}`}
            onClick={() => setBlockedInfoModal({ show: false, article: null })}
          >
            Edit Article
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyArticlesPage;
