// frontend/src/components/article/ArticleComments.js
import React, { useState, useContext, useEffect } from "react";
import { Card, Form, Button, Alert, Spinner, Badge } from "react-bootstrap";
import { BsChat, BsPlus } from "react-icons/bs";
import { Link } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import CommentItem from "./CommentItem";
import { useCreateComment, useComments } from "../../hooks/api/useComments";

const ArticleComments = ({
  articleId,
  initialComments = [],
  showCommentForm = true,
  allowReplies = true,
}) => {
  const { user } = useContext(AuthContext);

  // Local state
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [localComments, setLocalComments] = useState(initialComments);
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, popular

  // API hooks
  const {
    data: commentsData,
    loading: loadingComments,
    error: commentsError,
    refetch: refetchComments,
  } = useComments({ articleId, status: "approved" }, { immediate: false });

  const {
    mutate: createComment,
    loading: submittingComment,
    error: submitError,
  } = useCreateComment({
    onSuccess: (newComment) => {
      // Add new comment to local state
      setLocalComments((prev) => [newComment, ...prev]);
      setCommentText("");
    },
  });

  // Use local comments or fetched comments
  const comments = commentsData || localComments;

  // Sort comments based on selected sorting
  const getSortedComments = () => {
    if (!comments) return [];

    const sorted = [...comments];

    switch (sortBy) {
      case "oldest":
        return sorted.sort(
          (a, b) => new Date(a.created_at) - new Date(b.created_at)
        );
      case "popular":
        return sorted.sort((a, b) => (b.likes || 0) - (a.likes || 0));
      case "newest":
      default:
        return sorted.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    await createComment({
      content: commentText.trim(),
      articleId,
    });
  };

  // Handle reply to a comment
  const handleReply = async (parentId, content) => {
    await createComment({
      content,
      articleId,
      parentId,
    });
  };

  // Handle comment editing
  const handleEdit = (comment) => {
    // This would typically open an edit modal or inline editor
    console.log("Edit comment:", comment);
    // TODO: Implement edit functionality
  };

  // Handle comment deletion
  const handleDelete = async (commentId) => {
    try {
      // TODO: Implement delete API call
      console.log("Delete comment:", commentId);

      // Remove from local state
      setLocalComments((prev) =>
        prev.filter((comment) => comment.id !== commentId)
      );
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // Handle comment reporting
  const handleReport = (comment) => {
    // TODO: Implement report functionality
    console.log("Report comment:", comment);
  };

  // Get comments to display (limit if not showing all)
  const displayComments = showAllComments
    ? getSortedComments()
    : getSortedComments().slice(0, 5);

  const hasMoreComments = comments && comments.length > 5 && !showAllComments;

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">
          <BsChat className="me-2" />
          Comments
          {comments && (
            <Badge bg="secondary" className="ms-2">
              {comments.length}
            </Badge>
          )}
        </h4>

        {/* Sort Options */}
        {comments && comments.length > 1 && (
          <Form.Select
            size="sm"
            style={{ width: "auto" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
          </Form.Select>
        )}
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
                      disabled={submittingComment}
                      required
                    />
                  </div>
                </div>

                {submitError && (
                  <Alert variant="danger" className="mb-3">
                    {submitError.message ||
                      "Failed to submit comment. Please try again."}
                  </Alert>
                )}

                <div className="d-flex justify-content-end">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submittingComment || !commentText.trim()}
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
              <Alert variant="info" className="text-center">
                <p className="mb-2">Please log in to leave a comment</p>
                <div>
                  <Link to="/login" className="btn btn-primary btn-sm me-2">
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              </Alert>
            )}
          </div>
        )}

        {/* Comments List */}
        {loadingComments ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Loading comments...</p>
          </div>
        ) : commentsError ? (
          <Alert variant="danger">
            <Alert.Heading>Error Loading Comments</Alert.Heading>
            <p>{commentsError.message || "Failed to load comments."}</p>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={refetchComments}
            >
              Try Again
            </Button>
          </Alert>
        ) : !comments || comments.length === 0 ? (
          <Alert variant="light" className="text-center">
            <BsChat size={30} className="text-muted mb-2" />
            <p className="mb-0">
              No comments yet.{" "}
              {user
                ? "Be the first to comment!"
                : "Log in to start the conversation!"}
            </p>
          </Alert>
        ) : (
          <>
            {/* Comments */}
            <div className="comments-list">
              {displayComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={allowReplies ? handleReply : null}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onReport={handleReport}
                  showReplyForm={allowReplies}
                />
              ))}
            </div>

            {/* Show More Button */}
            {hasMoreComments && (
              <div className="text-center mt-4">
                <Button
                  variant="outline-primary"
                  onClick={() => setShowAllComments(true)}
                >
                  Show {comments.length - 5} More Comments
                </Button>
              </div>
            )}

            {/* Show Less Button */}
            {showAllComments && comments.length > 5 && (
              <div className="text-center mt-4">
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowAllComments(false)}
                >
                  Show Less
                </Button>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ArticleComments;
