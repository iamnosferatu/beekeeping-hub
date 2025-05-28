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
import axios from "axios";
import { API_URL } from "../../config";

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

      // Get auth token
      const token = localStorage.getItem("beekeeper_auth_token");
      if (!token) {
        throw new Error("You must be logged in to comment");
      }

      // Prepare comment data
      const commentData = {
        article_id: articleId,
        content: commentText.trim(),
      };

      console.log("Submitting comment:", commentData);

      // Make API call to create comment
      const response = await axios.post(`${API_URL}/comments`, commentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Comment response:", response.data);

      // Check if submission was successful
      if (response.data.success) {
        // Add the new comment to the list
        const newComment = response.data.data || response.data.comment;

        // Ensure the comment has the current user's info
        const enrichedComment = {
          ...newComment,
          author: newComment.author || user,
          created_at: newComment.created_at || new Date().toISOString(),
        };

        setComments((prevComments) => [enrichedComment, ...prevComments]);

        // Clear the comment form
        setCommentText("");

        // Show success message briefly
        setSubmitError(null);
      } else {
        throw new Error(response.data.message || "Failed to post comment");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);

      // Handle different error types
      let errorMessage = "Failed to submit comment. Please try again.";

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          errorMessage = "Your session has expired. Please log in again.";
        } else if (error.response.status === 404) {
          // If the comments endpoint doesn't exist, provide a fallback
          errorMessage = "Comment feature is temporarily unavailable.";

          // Optionally, add the comment locally for demo purposes
          const tempComment = {
            id: Date.now(), // Temporary ID
            content: commentText.trim(),
            author: user,
            created_at: new Date().toISOString(),
            status: "pending",
          };

          setComments((prevComments) => [tempComment, ...prevComments]);
          setCommentText("");
          setSubmitError("Comment saved locally (demo mode)");

          // Clear the demo message after 3 seconds
          setTimeout(() => setSubmitError(null), 3000);
          return;
        } else if (error.response.status === 422) {
          errorMessage =
            error.response.data?.errors?.content?.[0] ||
            "Invalid comment data. Please check and try again.";
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || errorMessage;
      }

      setSubmitError(errorMessage);
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
              {comment.status === "pending" && (
                <Badge bg="warning" className="ms-2">
                  Pending
                </Badge>
              )}
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

                {/* Error/Success Alert */}
                {submitError && (
                  <Alert
                    variant={
                      submitError.includes("demo mode") ? "info" : "danger"
                    }
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
