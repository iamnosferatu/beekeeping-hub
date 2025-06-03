import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { useForum } from '../../hooks/api/useForum';

const CommentForm = ({ threadId, parentCommentId, comment, onSubmit, onCancel }) => {
  const { createComment, updateComment, loading } = useForum();
  const [content, setContent] = useState(comment?.content || '');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Comment content is required');
      return;
    }

    try {
      let result;
      if (comment) {
        // Update existing comment
        result = await updateComment(comment.id, { content });
      } else {
        // Create new comment
        result = await createComment({
          content,
          threadId,
          parentCommentId
        });
      }
      
      onSubmit(result);
      setContent('');
    } catch (error) {
      setError(error.message || 'Failed to submit comment');
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      <Form.Group className="mb-3">
        <Form.Control
          as="textarea"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentCommentId ? "Write your reply..." : "Write your comment..."}
          disabled={loading}
          required
        />
      </Form.Group>
      
      <div className="d-flex gap-2">
        <Button 
          type="submit" 
          variant="primary" 
          disabled={loading || !content.trim()}
        >
          {loading ? 'Submitting...' : (comment ? 'Update' : 'Post')}
        </Button>
        
        {onCancel && (
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        )}
      </div>
    </Form>
  );
};

export default CommentForm;