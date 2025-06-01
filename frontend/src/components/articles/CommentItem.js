// frontend/src/components/article/CommentItem.js
import React, { useState, useContext } from "react";
import { Button, Alert, Spinner } from "react-bootstrap";
import { BsReply, BsPencil, BsTrash, BsFlag } from "react-icons/bs";
import moment from "moment";
import AuthContext from "../../contexts/AuthContext";
import ConfirmDialog from "../common/ConfirmDialog";

const CommentItem = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onReport,
  showReplyForm = false,
  depth = 0,
  maxDepth = 3,
}) => {
  const { user } = useContext(AuthContext);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Check if current user can edit this comment
  const canEdit =
    user && (user.id === comment.author?.id || user.role === "admin");

  // Check if current user can delete this comment
  const canDelete =
    user && (user.id === comment.author?.id || user.role === "admin");

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyText.trim()) {
      setError("Reply cannot be empty");
      return;
    }

    try {
      setSubmittingReply(true);
      setError(null);

      await onReply(comment.id, replyText.trim());

      // Reset form
      setReplyText("");
      setShowReplyBox(false);
    } catch (err) {
      setError("Failed to submit reply. Please try again.");
      console.error("Reply submission error:", err);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle delete with confirmation
  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete(comment.id);
  };

  // Calculate indentation based on depth
  const indentStyle = {
    marginLeft: depth > 0 ? `${Math.min(depth, maxDepth) * 20}px` : "0px",
    borderLeft: depth > 0 ? "2px solid #e9ecef" : "none",
    paddingLeft: depth > 0 ? "15px" : "0px",
  };

  // Format author display name
  const getAuthorDisplayName = () => {
    if (!comment.author) return "Anonymous";

    const { first_name, last_name, username } = comment.author;

    if (first_name && last_name) {
      return `${first_name} ${last_name}`;
    }

    return username || "Anonymous";
  };

  // Get author avatar URL or placeholder
  const getAuthorAvatar = () => {
    return (
      comment.author?.avatar || "https://via.placeholder.com/40x40?text=👤"
    );
  };

  return (
    <>
    <div className="comment-item" style={indentStyle}>
      <div className="d-flex mb-3">
        {/* Author Avatar */}
        <img
          src={getAuthorAvatar()}
          alt={getAuthorDisplayName()}
          className="rounded-circle me-3"
          width="40"
          height="40"
          style={{ objectFit: "cover" }}
        />

        <div className="flex-grow-1">
          {/* Comment Header */}
          <div className="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 className="mb-0 fw-bold">
                {getAuthorDisplayName()}
                {comment.author?.role === "admin" && (
                  <span className="badge bg-danger ms-2 small">Admin</span>
                )}
                {comment.author?.role === "author" && (
                  <span className="badge bg-warning ms-2 small">Author</span>
                )}
              </h6>
              <small className="text-muted">
                {comment.created_at
                  ? moment(comment.created_at).fromNow()
                  : "Unknown time"}
                {comment.updated_at &&
                  comment.updated_at !== comment.created_at && (
                    <span className="ms-2">(edited)</span>
                  )}
              </small>
            </div>

            {/* Comment Status Badge */}
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

          {/* Comment Content */}
          <div className="comment-content mb-3">
            <p className="mb-0">{comment.content}</p>
          </div>

          {/* Comment Actions */}
          <div className="comment-actions d-flex gap-3">
            {/* Reply Button */}
            {user && showReplyForm && depth < maxDepth && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-muted"
                onClick={() => setShowReplyBox(!showReplyBox)}
              >
                <BsReply className="me-1" />
                Reply
              </button>
            )}

            {/* Edit Button */}
            {canEdit && (
              <button
                type="button"
                className="btn btn-link btn-sm p-0 text-muted"
                onClick={() => onEdit && onEdit(comment)}
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
            {user && user.id !== comment.author?.id && (
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
          {showReplyBox && (
            <div className="mt-3">
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <form onSubmit={handleReplySubmit}>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={submittingReply}
                    required
                  />
                </div>

                <div className="d-flex gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={submittingReply || !replyText.trim()}
                  >
                    {submittingReply ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Replying...
                      </>
                    ) : (
                      "Post Reply"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => {
                      setShowReplyBox(false);
                      setReplyText("");
                      setError(null);
                    }}
                    disabled={submittingReply}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReport={onReport}
                  showReplyForm={showReplyForm}
                  depth={depth + 1}
                  maxDepth={maxDepth}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

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

export default CommentItem;
