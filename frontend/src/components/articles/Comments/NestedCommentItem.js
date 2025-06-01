// frontend/src/components/articles/comments/NestedCommentItem.js
import React, { useState, useContext } from "react";
import { Button, Form, Alert, Spinner } from "react-bootstrap";
import {
  BsReply,
  BsPencil,
  BsTrash,
  BsFlag,
  BsHandThumbsUp,
  BsHandThumbsDown,
} from "react-icons/bs";
import { Link } from "react-router-dom";
import moment from "moment";
import AuthContext from "../../../contexts/AuthContext";
import Avatar from "../../common/Avatar";
import ConfirmDialog from "../../common/ConfirmDialog";
import ErrorAlert from "../../common/ErrorAlert";

/**
 * NestedCommentItem Component
 *
 * Displays a single comment with support for nested replies.
 * Handles edit, delete, reply, and report functionality.
 *
 * @param {Object} comment - The comment object
 * @param {Array} allComments - All comments for finding replies
 * @param {Function} onReply - Callback for replying to a comment
 * @param {Function} onEdit - Callback for editing a comment
 * @param {Function} onDelete - Callback for deleting a comment
 * @param {Function} onReport - Callback for reporting a comment
 * @param {Function} onVote - Callback for voting on a comment
 * @param {number} depth - Current nesting depth
 * @param {number} maxDepth - Maximum allowed nesting depth
 */
const NestedCommentItem = ({
  comment,
  allComments = [],
  onReply,
  onEdit,
  onDelete,
  onReport,
  onVote,
  depth = 0,
  maxDepth = 3,
}) => {
  const { user } = useContext(AuthContext);

  // Local state
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [editContent, setEditContent] = useState(comment.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [voteError, setVoteError] = useState(null);

  // Find direct replies to this comment
  const replies = allComments.filter((c) => c.parent_id === comment.id);

  // Check permissions
  const canEdit =
    user && (user.id === comment.user_id || user.role === "admin");
  const canDelete =
    user && (user.id === comment.user_id || user.role === "admin");
  const canReply = user && depth < maxDepth;

  /**
   * Format author display name
   */
  const getAuthorDisplayName = () => {
    if (!comment.author) return "Anonymous";

    const { first_name, last_name, username } = comment.author;
    const fullName = `${first_name || ""} ${last_name || ""}`.trim();

    return fullName || username || "Anonymous";
  };


  /**
   * Handle reply submission
   */
  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await onReply({
        article_id: comment.article_id,
        parent_id: comment.id,
        content: replyContent.trim(),
      });

      // Reset form
      setReplyContent("");
      setShowReplyForm(false);
    } catch (err) {
      setError("Failed to submit reply. Please try again.");
      console.error("Reply submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle edit submission
   */
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editContent.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await onEdit(comment.id, {
        content: editContent.trim(),
      });

      // Reset form
      setShowEditForm(false);
    } catch (err) {
      setError("Failed to update comment. Please try again.");
      console.error("Edit submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle delete with confirmation
   */
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(comment.id);
  };

  /**
   * Handle vote
   */
  const handleVote = (voteType) => {
    if (!user) {
      setVoteError("Please log in to vote on comments");
      return;
    }

    setVoteError(null);
    onVote && onVote(comment.id, voteType);
  };

  /**
   * Calculate indentation style based on depth
   */
  const getIndentationStyle = () => {
    if (depth === 0) return {};

    return {
      marginLeft: `${Math.min(depth * 30, maxDepth * 30)}px`,
      borderLeft: "2px solid #e9ecef",
      paddingLeft: "15px",
    };
  };

  return (
    <>
    <div className="comment-item mb-3" style={getIndentationStyle()}>
      {/* Comment Header */}
      <div className="d-flex align-items-start">
        {/* Author Avatar */}
        <div className="me-3">
          <Avatar user={comment.author} size={40} />
        </div>

        <div className="flex-grow-1">
          {/* Author Info and Timestamp */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <strong className="me-2">{getAuthorDisplayName()}</strong>

              {/* Role Badges */}
              {comment.author?.role === "admin" && (
                <span className="badge bg-danger me-2">Admin</span>
              )}
              {comment.author?.role === "author" && (
                <span className="badge bg-warning me-2">Author</span>
              )}

              {/* Timestamp */}
              <small className="text-muted">
                {comment.created_at
                  ? moment(comment.created_at).fromNow()
                  : "Unknown time"}
                {comment.updated_at &&
                  comment.updated_at !== comment.created_at && (
                    <span className="ms-1">(edited)</span>
                  )}
              </small>
            </div>

            {/* Comment Status (if not approved) */}
            {comment.status && comment.status !== "approved" && (
              <span
                className={`badge bg-${
                  comment.status === "pending" ? "warning" : "danger"
                }`}
              >
                {comment.status}
              </span>
            )}
          </div>

          {/* Comment Content or Edit Form */}
          {showEditForm ? (
            <Form onSubmit={handleEditSubmit} className="mb-3">
              {error && (
                <Alert
                  variant="danger"
                  className="mb-2"
                  dismissible
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              <Form.Control
                as="textarea"
                rows={3}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                disabled={submitting}
                required
              />

              <div className="mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting || !editContent.trim()}
                  className="me-2"
                >
                  {submitting ? (
                    <>
                      <Spinner size="sm" className="me-1" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditContent(comment.content);
                    setError(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          ) : (
            <div className="comment-content mb-2">
              <p className="mb-0">{comment.content}</p>
            </div>
          )}

          {/* Comment Actions */}
          <div className="comment-actions d-flex align-items-center gap-3">
            {/* Vote Buttons */}
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className={`btn btn-link btn-sm p-0 ${
                  comment.user_vote === "up" ? "text-success" : "text-muted"
                }`}
                onClick={() => handleVote("up")}
                title="Upvote"
              >
                <BsHandThumbsUp />
              </button>
              <span className="small">{comment.upvotes || 0}</span>
              <button
                type="button"
                className={`btn btn-link btn-sm p-0 ${
                  comment.user_vote === "down" ? "text-danger" : "text-muted"
                }`}
                onClick={() => handleVote("down")}
                title="Downvote"
              >
                <BsHandThumbsDown />
              </button>
            </div>

            {/* Reply Button */}
            {canReply && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-muted"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <BsReply className="me-1" />
                Reply
              </button>
            )}

            {/* Edit Button */}
            {canEdit && !showEditForm && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-muted"
                onClick={() => setShowEditForm(true)}
              >
                <BsPencil className="me-1" />
                Edit
              </button>
            )}

            {/* Delete Button */}
            {canDelete && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-danger"
                onClick={handleDelete}
              >
                <BsTrash className="me-1" />
                Delete
              </button>
            )}

            {/* Report Button */}
            {user && user.id !== comment.user_id && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-muted"
                onClick={() => onReport && onReport(comment)}
              >
                <BsFlag className="me-1" />
                Report
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <Form onSubmit={handleReplySubmit} className="mt-3">
              {error && (
                <Alert
                  variant="danger"
                  className="mb-2"
                  dismissible
                  onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              )}

              <div className="d-flex align-items-start">
                <div className="me-2">
                  <Avatar user={user} size={32} />
                </div>

                <div className="flex-grow-1">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    disabled={submitting}
                    required
                  />

                  <div className="mt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={submitting || !replyContent.trim()}
                      className="me-2"
                    >
                      {submitting ? (
                        <>
                          <Spinner size="sm" className="me-1" />
                          Posting...
                        </>
                      ) : (
                        "Post Reply"
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent("");
                        setError(null);
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          )}

          {/* Nested Replies */}
          {replies.length > 0 && (
            <div className="nested-replies mt-3">
              {replies.map((reply) => (
                <NestedCommentItem
                  key={reply.id}
                  comment={reply}
                  allComments={allComments}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReport={onReport}
                  onVote={onVote}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Vote Error Alert */}
    <ErrorAlert 
      error={voteError}
      variant="info"
      onDismiss={() => setVoteError(null)}
      className="mt-2"
      showIcon={false}
    />

    {/* Delete Confirmation Dialog */}
    <ConfirmDialog
      show={showDeleteConfirm}
      onHide={() => setShowDeleteConfirm(false)}
      onConfirm={confirmDelete}
      title="Delete Comment"
      message="Are you sure you want to delete this comment? This action cannot be undone."
      confirmText="Delete"
      variant="danger"
    />
    </>
  );
};

export default NestedCommentItem;
