// frontend/src/pages/ArticlePage.js
import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Badge,
  Alert,
  Spinner,
  Row,
  Col,
  Form,
  ListGroup,
} from "react-bootstrap";
import {
  BsFillHeartFill,
  BsEye,
  BsChat,
  BsShareFill,
  BsPerson,
  BsCalendar3,
} from "react-icons/bs";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { API_URL } from "../config";
import AuthContext from "../contexts/AuthContext";
import moment from "moment";

const ArticlePage = () => {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  // Fetch article data
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${API_URL}/articles/${slug}`);
        setArticle(response.data.data);

        // Check if user has liked this article
        if (user && response.data.data.likes) {
          setLiked(
            response.data.data.likes.some((like) => like.user_id === user.id)
          );
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        setError("Failed to load article. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, user]);

  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!user) {
      // Redirect to login page if not logged in
      navigate("/login", {
        state: { from: { pathname: `/articles/${slug}` } },
      });
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/articles/${article.id}/like`
      );

      setLiked(response.data.liked);

      // Update like count in article state
      setArticle((prev) => ({
        ...prev,
        like_count: liked
          ? Math.max(0, prev.like_count - 1) // Decrement if unliking
          : prev.like_count + 1, // Increment if liking
      }));
    } catch (err) {
      console.error("Error toggling like:", err);
      // Show a temporary error message
      const temp = liked;
      setLiked(!temp); // Revert UI state
      setTimeout(() => setLiked(temp), 1000); // Return to actual state after showing error briefly
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login", {
        state: { from: { pathname: `/articles/${slug}` } },
      });
      return;
    }

    if (!commentText.trim()) {
      setCommentError("Comment cannot be empty");
      return;
    }

    try {
      setSubmittingComment(true);
      setCommentError(null);

      const response = await axios.post(`${API_URL}/comments`, {
        content: commentText,
        articleId: article.id,
      });

      // Add new comment to the article state
      setArticle((prev) => ({
        ...prev,
        comments: [...(prev.comments || []), response.data.data],
      }));

      // Clear comment form
      setCommentText("");
    } catch (err) {
      console.error("Error submitting comment:", err);
      setCommentError("Failed to submit comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading article...</p>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <div className="d-flex justify-content-end">
          <Button
            variant="outline-danger"
            onClick={() => navigate("/articles")}
          >
            Back to Articles
          </Button>
        </div>
      </Alert>
    );
  }

  // Show 404 for non-existent article
  if (!article) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Article Not Found</Alert.Heading>
        <p>The article you're looking for doesn't exist or has been removed.</p>
        <div className="d-flex justify-content-end">
          <Button
            variant="outline-primary"
            onClick={() => navigate("/articles")}
          >
            Browse Articles
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="article-page">
      {/* Article Header */}
      <Card className="mb-4 border-0 shadow-sm">
        {article.featured_image && (
          <div className="article-image-container">
            <img
              src={article.featured_image}
              className="card-img-top article-featured-image"
              alt={article.title}
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
          </div>
        )}

        <Card.Body>
          {/* Tags */}
          <div className="mb-2">
            {article.tags &&
              article.tags.map((tag) => (
                <Link
                  to={`/tags/${tag.slug}`}
                  key={tag.id}
                  className="text-decoration-none"
                >
                  <Badge bg="secondary" className="me-2 mb-1 p-2">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
          </div>

          {/* Title */}
          <h1 className="article-title mb-3">{article.title}</h1>

          {/* Meta information */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            <div className="article-meta d-flex align-items-center mb-2 mb-md-0">
              <BsPerson className="me-1" />
              {article.author ? (
                <Link
                  to={`/author/${article.author.username}`}
                  className="me-3 author-name"
                >
                  {article.author.first_name} {article.author.last_name}
                </Link>
              ) : (
                <span className="me-3">Unknown Author</span>
              )}

              <BsCalendar3 className="me-1" />
              <span className="me-3">
                {article.published_at &&
                  moment(article.published_at).format("MMM D, YYYY")}
              </span>
            </div>

            <div className="article-stats d-flex align-items-center">
              <span className="me-3" title="Views">
                <BsEye className="me-1" />
                {article.view_count || 0}
              </span>
              <span
                className={`me-3 ${liked ? "text-danger" : ""}`}
                onClick={handleLikeToggle}
                style={{ cursor: "pointer" }}
                title={liked ? "Unlike" : "Like"}
              >
                <BsFillHeartFill className="me-1" />
                {article.like_count || 0}
              </span>
              <span title="Comments">
                <BsChat className="me-1" />
                {article.comments ? article.comments.length : 0}
              </span>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Article Content */}
      <Card className="mb-4 shadow-sm">
        <Card.Body className="article-content">
          <ReactMarkdown
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {article.content}
          </ReactMarkdown>
        </Card.Body>
      </Card>

      {/* Article Actions */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row>
            <Col md={8}>
              {article.author && (
                <div className="d-flex align-items-center">
                  <img
                    src={
                      article.author.avatar || "https://via.placeholder.com/60"
                    }
                    alt={`${article.author.first_name} ${article.author.last_name}`}
                    className="rounded-circle me-3"
                    width="60"
                    height="60"
                  />
                  <div>
                    <h5 className="mb-1">
                      {article.author.first_name} {article.author.last_name}
                    </h5>
                    <p className="text-muted mb-0">
                      {article.author.bio || "Beekeeping enthusiast and writer"}
                    </p>
                  </div>
                </div>
              )}
            </Col>
            <Col md={4}>
              <div className="d-flex justify-content-md-end mt-3 mt-md-0">
                <Button variant="outline-primary" className="me-2">
                  <BsShareFill className="me-1" /> Share
                </Button>
                {user && user.id === article.author?.id && (
                  <Link to={`/editor/${article.id}`}>
                    <Button variant="outline-secondary">Edit Article</Button>
                  </Link>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Comments Section */}
      <Card className="shadow-sm">
        <Card.Header>
          <h4 className="mb-0">
            Comments ({article.comments ? article.comments.length : 0})
          </h4>
        </Card.Header>

        {/* Comment Form */}
        <Card.Body>
          <Form onSubmit={handleCommentSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Leave a Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={
                  user
                    ? "Write your comment here..."
                    : "Please login to comment"
                }
                disabled={!user || submittingComment}
              />
              {commentError && (
                <Form.Text className="text-danger">{commentError}</Form.Text>
              )}
            </Form.Group>
            <div className="d-flex justify-content-end">
              {user ? (
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submittingComment}
                >
                  {submittingComment ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Submitting...
                    </>
                  ) : (
                    "Submit Comment"
                  )}
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="outline-primary">Login to Comment</Button>
                </Link>
              )}
            </div>
          </Form>

          {/* Comments List */}
          {article.comments && article.comments.length > 0 ? (
            <ListGroup variant="flush" className="mt-4">
              {article.comments.map((comment) => (
                <ListGroup.Item
                  key={comment.id}
                  className="py-4 px-0 border-bottom"
                >
                  <div className="d-flex">
                    <img
                      src={
                        comment.author?.avatar ||
                        "https://via.placeholder.com/40"
                      }
                      alt={comment.author?.username || "Anonymous"}
                      className="rounded-circle me-3"
                      width="40"
                      height="40"
                    />
                    <div className="w-100">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0">
                          {comment.author?.first_name}{" "}
                          {comment.author?.last_name || "Anonymous"}
                        </h6>
                        <small className="text-muted">
                          {moment(comment.created_at).fromNow()}
                        </small>
                      </div>
                      <p className="mb-0">{comment.content}</p>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          ) : (
            <Alert variant="light" className="text-center mt-4">
              No comments yet. Be the first to comment!
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ArticlePage;
