import React, { useState, useContext } from 'react';
import { Card, Button, Badge, Alert } from 'react-bootstrap';
import { FaReply, FaEdit, FaTrash, FaClock, FaQuoteLeft } from 'react-icons/fa';
import Avatar from '../common/Avatar';
import CommentForm from './CommentForm';
import ConfirmDialog from '../common/ConfirmDialog';
import AuthContext from '../../contexts/AuthContext';
import { useForum } from '../../hooks/api/useForum';
import './ForumComponents.scss';

const CommentList = ({ comments, threadId, onCommentAdded, onCommentUpdated, onCommentDeleted }) => {
  const { user } = useContext(AuthContext);
  const { deleteComment, canEditContent, canDeleteContent } = useForum();
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState(null);

  const handleReply = (comment) => {
    setReplyingTo(comment.id);
    setEditingComment(null);
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setReplyingTo(null);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteComment(deleteConfirm.id);
      onCommentDeleted(deleteConfirm.id);
      setDeleteConfirm(null);
    } catch (error) {
      setError(error.message || 'Failed to delete comment');
    }
  };

  const handleCommentSubmitted = (newComment) => {
    if (editingComment) {
      onCommentUpdated(newComment);
      setEditingComment(null);
    } else {
      onCommentAdded(newComment);
      setReplyingTo(null);
    }
  };

  const renderComment = (comment) => {
    const isEditing = editingComment?.id === comment.id;
    const isReplying = replyingTo === comment.id;

    return (
      <div key={comment.id} className="forum-comment mb-3">
        <Card className={comment.isBlocked ? 'border-danger' : ''}>
          <Card.Body>
            <div className="d-flex align-items-start">
              <Avatar
                user={comment.author}
                size={40}
                className="me-3"
              />
              
              <div className="flex-grow-1">
                <div className="comment-header mb-2">
                  <strong>{comment.author?.username || 'Unknown'}</strong>
                  <span className="text-muted small ms-2">
                    <FaClock className="me-1" />
                    {new Date(comment.created_at || comment.createdAt).toLocaleDateString()}
                  </span>
                  {comment.isBlocked && (
                    <Badge bg="danger" className="ms-2">Blocked</Badge>
                  )}
                </div>

                {comment.parentComment && (
                  <div className="parent-comment-ref">
                    <div className="quoted-text">
                      {comment.parentComment.content}
                    </div>
                    <div className="quote-author">
                      — {comment.parentComment.author?.username || 'Unknown'}
                    </div>
                  </div>
                )}

                {isEditing ? (
                  <CommentForm
                    threadId={threadId}
                    comment={comment}
                    onSubmit={handleCommentSubmitted}
                    onCancel={() => setEditingComment(null)}
                  />
                ) : (
                  <>
                    <div className="comment-content">
                      {comment.content}
                    </div>

                    {user && !comment.isBlocked && (
                      <div className="comment-actions mt-2">
                        <Button
                          size="sm"
                          variant="link"
                          className="p-0 me-3"
                          onClick={() => handleReply(comment)}
                        >
                          <FaReply className="me-1" /> Reply
                        </Button>
                        
                        {canEditContent(comment) && (
                          <>
                            <Button
                              size="sm"
                              variant="link"
                              className="p-0 me-3"
                              onClick={() => handleEdit(comment)}
                            >
                              <FaEdit className="me-1" /> Edit
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="link"
                              className="p-0 text-danger"
                              onClick={() => setDeleteConfirm(comment)}
                            >
                              <FaTrash className="me-1" /> Delete
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}

                {isReplying && (
                  <div className="mt-3">
                    <CommentForm
                      threadId={threadId}
                      parentCommentId={comment.id}
                      onSubmit={handleCommentSubmitted}
                      onCancel={() => setReplyingTo(null)}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  };

  return (
    <div className="forum-comments">
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {comments.length === 0 ? (
        <p className="text-muted text-center py-4">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        comments.map(renderComment)
      )}

      <ConfirmDialog
        show={!!deleteConfirm}
        onHide={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default CommentList;