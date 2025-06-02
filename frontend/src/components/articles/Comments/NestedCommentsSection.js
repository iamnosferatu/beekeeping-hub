// frontend/src/components/articles/comments/NestedCommentsSection.js
import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge,
  ListGroup,
  Dropdown,
} from "react-bootstrap";
import {
  BsChat,
  BsPlus,
  BsFilter,
  BsArrowUp,
  BsArrowDown,
  BsChatSquare,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import AuthContext from "../../../contexts/AuthContext";
import apiService from "../../../services/api";
import NestedCommentItem from "./NestedCommentItem";
import Avatar from "../../common/Avatar";
import PromptDialog from "../../common/PromptDialog";
import ErrorAlert from "../../common/ErrorAlert";

/**
 * NestedCommentsSection Component
 *
 * Main comments section that handles comment fetching, submission,
 * and management with support for nested/threaded comments.
 *
 * @param {number} articleId - ID of the article
 * @param {Array} initialComments - Initial comments array
 * @param {boolean} showCommentForm - Whether to show the comment form
 */
const NestedCommentsSection = ({
  articleId,
  initialComments = [],
  showCommentForm = true,
}) => {
  const { user } = useContext(AuthContext);

  // State management
  const [comments, setComments] = useState(Array.isArray(initialComments) ? initialComments : []);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("newest"); // newest, oldest, popular
  const [filterStatus, setFilterStatus] = useState("all"); // all, approved, pending
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportingComment, setReportingComment] = useState(null);
  const [actionError, setActionError] = useState(null);

  /**
   * Fetch comments from API
   */
  const fetchComments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.comments.getByArticle(articleId);

      if (response.success) {
        setComments(response.data || []);
      } else {
        throw new Error(response.error?.message || "Failed to load comments");
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments on mount if no initial comments provided
  useEffect(() => {
    if (!initialComments.length && articleId) {
      fetchComments();
    }
  }, [articleId, initialComments.length]);

  /**
   * Handle comment submission
   */
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) {
      setError("Please enter a comment");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await apiService.comments.create({
        article_id: articleId,
        content: commentText.trim(),
        parent_id: null, // Top-level comment
      });

      if (response.success) {
        console.log("Comment creation response:", response.data);
        
        // Ensure we have valid data structure
        if (!response.data || typeof response.data !== 'object') {
          throw new Error("Invalid response format from server");
        }
        
        // Add the new comment to the list with safe defaults
        const newComment = {
          id: response.data.id || Date.now(), // Ensure unique ID
          content: response.data.content || commentText.trim(),
          article_id: articleId,
          user_id: user?.id,
          parent_id: null,
          status: response.data.status || 'pending',
          created_at: response.data.created_at || new Date().toISOString(),
          updated_at: response.data.updated_at || new Date().toISOString(),
          author: {
            id: user?.id,
            username: user?.username,
            first_name: user?.first_name,
            last_name: user?.last_name,
            avatar: user?.avatar,
            role: user?.role
          },
          replies: [], // Always start with empty replies array
          upvotes: 0,
          downvotes: 0,
        };

        // Update state with new comment at the beginning
        setComments(prevComments => [newComment, ...(prevComments || [])]);
        setCommentText("");

        // Show success message
        setError({ type: "success", message: "Comment posted successfully!" });
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error(response.error?.message || "Failed to post comment");
      }
    } catch (err) {
      console.error("Failed to submit comment:", err);
      setError(err.message || "Failed to submit comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle reply to a comment
   */
  const handleReply = async (replyData) => {
    try {
      const response = await apiService.comments.create(replyData);
      console.log("Reply response:", response);

      // Check for successful response (status 201 or success flag)
      if (response.status === 201 || response.data?.success) {
        const responseData = response.data || response;
        // Create a clean reply object without circular references
        const commentData = responseData.data || responseData;
        const newReply = {
          id: commentData.id || Date.now(),
          content: commentData.content || replyData.content,
          article_id: commentData.article_id || replyData.article_id,
          user_id: commentData.user_id || user?.id,
          parent_id: commentData.parent_id || replyData.parent_id,
          status: commentData.status || 'pending',
          created_at: commentData.created_at || new Date().toISOString(),
          updated_at: commentData.updated_at || new Date().toISOString(),
          author: commentData.author || {
            id: user?.id,
            username: user?.username,
            first_name: user?.first_name,
            last_name: user?.last_name,
            avatar: user?.avatar
          },
          replies: [],
          upvotes: 0,
          downvotes: 0,
        };

        // Add the reply to the comments list using functional update
        setComments(prevComments => [...(prevComments || []), newReply]);

        return newReply;
      } else {
        throw new Error(response.error?.message || "Failed to post reply");
      }
    } catch (err) {
      console.error("Failed to submit reply:", err);
      throw err;
    }
  };

  /**
   * Handle comment edit
   */
  const handleEdit = async (commentId, updateData) => {
    try {
      const response = await apiService.comments.update(commentId, updateData);

      if (response.success) {
        // Update the comment in the list using functional update
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === commentId
              ? { ...comment, ...updateData, updated_at: new Date().toISOString() }
              : comment
          )
        );

        return response.data;
      } else {
        throw new Error(response.error?.message || "Failed to update comment");
      }
    } catch (err) {
      console.error("Failed to update comment:", err);
      throw err;
    }
  };

  /**
   * Handle comment deletion
   */
  const handleDelete = async (commentId) => {
    try {
      const response = await apiService.comments.delete(commentId);

      if (response.success) {
        // Remove the comment and its replies from the list
        const removeCommentAndReplies = (comments, idToRemove) => {
          return comments.filter((comment) => {
            if (comment.id === idToRemove) return false;
            if (comment.parent_id === idToRemove) return false;
            return true;
          });
        };

        setComments(prevComments => removeCommentAndReplies(prevComments || [], commentId));
      } else {
        throw new Error(response.error?.message || "Failed to delete comment");
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
      setActionError("Failed to delete comment. Please try again.");
    }
  };

  /**
   * Handle comment report
   */
  const handleReport = (comment) => {
    setReportingComment(comment);
    setShowReportDialog(true);
  };

  const submitReport = async (reason) => {
    if (!reportingComment || !reason.trim()) return;

    try {
      const response = await apiService.comments.report(reportingComment.id, reason);

      if (response.success) {
        setActionError(null);
        // Show success message
        setError("Comment reported successfully. An administrator will review it.");
      } else {
        throw new Error(response.error?.message || "Failed to report comment");
      }
    } catch (err) {
      console.error("Failed to report comment:", err);
      setActionError("Failed to report comment. Please try again.");
    }
  };

  /**
   * Handle voting on comments
   */
  const handleVote = async (commentId, voteType) => {
    try {
      const response = await apiService.comments.vote(commentId, {
        type: voteType,
      });

      if (response.success) {
        // Update vote counts in the comment using functional update
        setComments(prevComments =>
          (prevComments || []).map(comment => {
            if (comment.id === commentId) {
              const updatedComment = { ...comment };

              // Remove previous vote if exists
              if (comment.user_vote === "up") updatedComment.upvotes--;
              if (comment.user_vote === "down") updatedComment.downvotes--;

              // Add new vote
              if (voteType === "up") updatedComment.upvotes++;
              if (voteType === "down") updatedComment.downvotes++;

              // Update user vote
              updatedComment.user_vote =
                comment.user_vote === voteType ? null : voteType;

              return updatedComment;
            }
            return comment;
          })
        );
      }
    } catch (err) {
      console.error("Failed to vote on comment:", err);
      setActionError("Failed to vote. Please try again.");
    }
  };

  /**
   * Get sorted and filtered comments
   */
  const getSortedAndFilteredComments = () => {
    // Ensure comments is an array
    const commentsArray = Array.isArray(comments) ? comments : [];
    
    // Filter comments
    let filtered = commentsArray;
    if (filterStatus !== "all") {
      filtered = commentsArray.filter((comment) => comment.status === filterStatus);
    }

    // Get only top-level comments (no parent_id)
    const topLevelComments = filtered.filter((comment) => !comment.parent_id);

    // Sort comments
    const sorted = [...topLevelComments].sort((a, b) => {
      switch (sortOrder) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "popular":
          const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
          const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
          return scoreB - scoreA;
        default:
          return 0;
      }
    });

    return sorted;
  };

  /**
   * Count total comments including replies
   */
  const getTotalCommentCount = () => {
    return comments.length;
  };

  const sortedComments = getSortedAndFilteredComments();
  const totalComments = getTotalCommentCount();

  return (
    <>
    <Card className="shadow-sm comments-section">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">
          <BsChat className="me-2" />
          Comments
          {totalComments > 0 && (
            <Badge bg="secondary" className="ms-2">
              {totalComments}
            </Badge>
          )}
        </h4>

        {/* Sort and Filter Controls */}
        {totalComments > 0 && (
          <div className="d-flex gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" size="sm">
                <BsFilter className="me-1" />
                Sort
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  active={sortOrder === "newest"}
                  onClick={() => setSortOrder("newest")}
                >
                  Newest First
                </Dropdown.Item>
                <Dropdown.Item
                  active={sortOrder === "oldest"}
                  onClick={() => setSortOrder("oldest")}
                >
                  Oldest First
                </Dropdown.Item>
                <Dropdown.Item
                  active={sortOrder === "popular"}
                  onClick={() => setSortOrder("popular")}
                >
                  Most Popular
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {user?.role === "admin" && (
              <Dropdown>
                <Dropdown.Toggle variant="outline-secondary" size="sm">
                  Status: {filterStatus}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item
                    active={filterStatus === "all"}
                    onClick={() => setFilterStatus("all")}
                  >
                    All Comments
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={filterStatus === "approved"}
                    onClick={() => setFilterStatus("approved")}
                  >
                    Approved Only
                  </Dropdown.Item>
                  <Dropdown.Item
                    active={filterStatus === "pending"}
                    onClick={() => setFilterStatus("pending")}
                  >
                    Pending Review
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        )}
      </Card.Header>

      <Card.Body>
        {/* Comment Form */}
        {showCommentForm && (
          <div className="mb-4">
            {user ? (
              <Form onSubmit={handleCommentSubmit}>
                <div className="d-flex mb-3">
                  <div className="me-3">
                    <Avatar user={user} size={40} />
                  </div>
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
                {error && (
                  <Alert
                    variant={error.type === "success" ? "success" : "danger"}
                    dismissible
                    onClose={() => setError(null)}
                  >
                    {error.message || error}
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
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading comments...</p>
          </div>
        ) : sortedComments.length > 0 ? (
          <div className="comments-list">
            {sortedComments.map((comment) => (
              <NestedCommentItem
                key={comment.id}
                comment={comment}
                allComments={comments}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onReport={handleReport}
                onVote={handleVote}
                depth={0}
                maxDepth={3}
              />
            ))}
          </div>
        ) : (
          <Alert variant="light" className="text-center">
            <BsChatSquare size={30} className="text-muted mb-2" />
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

    {/* Action Error Alert */}
    <ErrorAlert 
      error={actionError}
      variant="danger"
      onDismiss={() => setActionError(null)}
      className="mt-2"
    />

    {/* Report Comment Dialog */}
    <PromptDialog
      show={showReportDialog}
      onHide={() => {
        setShowReportDialog(false);
        setReportingComment(null);
      }}
      onSubmit={submitReport}
      title="Report Comment"
      message="Please provide a reason for reporting this comment:"
      placeholder="Enter your reason for reporting..."
      submitText="Report"
      required={true}
    />
    </>
  );
};

export default NestedCommentsSection;
