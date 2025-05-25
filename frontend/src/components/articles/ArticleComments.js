// frontend/src/components/articles/ArticleComments.js
import React, { useState, useContext } from "react";
import {
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { BsChat, BsPlus } from "react-icons/bs";
import { Link } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import moment from "moment";

/**
 * ArticleComments Component
 *
 * Handles article comments display and submission.
 * Includes authentication checks and real-time comment addition.
 *
 * @param {number} articleId - ID of the article
 * @param {Array} initialComments - Initial comments array
 * @param {boolean} showCommentForm - Whether to show the comment form
 */
const ArticleComments = ({
  articleId,
  initialComments = [],
  showCommentForm = true,
}) => {
  const { user } = useContext(AuthContext);

  // Local state for comments management
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /**
   * Handle comment form submission
   */
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    // Validate comment text
    if (!commentText.trim()) {
      setSubmitError("Please enter a comment");
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      // TODO: Replace with actual API call when backend is ready
      // For now, we'll show an error message
      console.log("Submitting comment:", { articleId, content: commentText });

      // Simulate API call failure
      throw new Error(
        "Comment submission is not yet implemented. Please check back later."
      );
    } catch (error) {
      console.error("Failed to submit comment:", error);
      setSubmitError(
        error.message || "Failed to submit comment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Render individual comment
   */
  const renderComment = (comment) => (
    <ListGroup.Item key={comment.id} className="py-3">
      <div className="d-flex">
        {/* Author Avatar */}
        <img
          src={
            comment.author?.avatar ||
            "https://via.placeholder.com/40x40?text=👤"
          }
          alt={comment.author?.username || "Anonymous"}
          className="rounded-circle me-3"
          width="40"
          height="40"
          style={{ objectFit: "cover" }}
        />

        {/* Comment Content */}
        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <h6 className="mb-0 comment-author">
              {comment.author
                ? `${comment.author.first_name || ""} ${
                    comment.author.last_name || ""
                  }`.trim() ||
                  comment.author.username ||
                  "Anonymous"
                : "Anonymous"}
            </h6>
            <small className="text-muted comment-date">
              {moment(comment.created_at).fromNow()}
            </small>
          </div>
          <p className="mb-0 comment-content">{comment.content}</p>
        </div>
      </div>
    </ListGroup.Item>
  );

  return (
    <Card className="shadow-sm comments-section">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">
          <BsChat className="me-2" />
          Comments
          {comments.length > 0 && (
            <Badge bg="secondary" className="ms-2">
              {comments.length}
            </Badge>
          )}
        </h4>
      </Card.Header>

      <Card.Body>
        {/* Comment Form */}
        {showCommentForm && (
          <div className="mb-4">
            {user ? (
              <Form onSubmit={handleCommentSubmit}>
                <div className="d-flex mb-3">
                  <img
                    src={
                      user.avatar || "https://via.placeholder.com/40x40?text=👤"
                    }
                    alt={user.username}
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="flex-grow-1">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                {/* Error Alert */}
                {submitError && (
                  <Alert
                    variant="danger"
                    dismissible
                    onClose={() => setSubmitError(null)}
                  >
                    {submitError}
                  </Alert>
                )}

                {/* Submit Button */}
                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting || !commentText.trim()}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Posting...
                      </>
                    ) : (
                      <>
                        <BsPlus className="me-1" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            ) : (
              /* Login prompt for non-authenticated users */
              <Alert variant="info" className="text-center">
                <p className="mb-2">Please log in to leave a comment</p>
                <div>
                  <Link to="/login">
                    <Button variant="primary" size="sm" className="me-2">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline-primary" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </Alert>
            )}
          </div>
        )}

        {/* Comments List */}
        {comments.length > 0 ? (
          <ListGroup variant="flush">{comments.map(renderComment)}</ListGroup>
        ) : (
          <Alert variant="light" className="text-center">
            <BsChat size={30} className="text-muted mb-2" />
            <p className="mb-0">
              No comments yet.{" "}
              {user
                ? "Be the first to comment!"
                : "Log in to start the conversation!"}
            </p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ArticleComments;
