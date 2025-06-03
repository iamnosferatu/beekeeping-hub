import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useForum } from '../../hooks/api/useForum';

const ThreadForm = ({ categories, thread, defaultCategoryId, onCancel, onSuccess }) => {
  const navigate = useNavigate();
  const { createThread, updateThread, loading } = useForum();
  
  const [formData, setFormData] = useState({
    title: thread?.title || '',
    content: thread?.content || '',
    categoryId: thread?.categoryId || defaultCategoryId || ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (thread) {
        // Update existing thread
        const updated = await updateThread(thread.id, {
          title: formData.title,
          content: formData.content
        });
        
        // If we have an onSuccess callback, use it
        if (onSuccess) {
          onSuccess(updated);
        } else {
          // Otherwise navigate to the thread
          navigate(`/forum/threads/${updated.slug || thread.slug}`);
        }
      } else {
        // Create new thread
        const newThread = await createThread(formData);
        navigate(`/forum/threads/${newThread.slug}`);
      }
    } catch (error) {
      setError(error.message || 'Failed to save thread');
    }
  };

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-4">{thread ? 'Edit Thread' : 'Create New Thread'}</h3>
        
        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {!thread && (
            <Form.Group className="mb-3">
              <Form.Label>Category *</Form.Label>
              <Form.Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select a category</option>
                {categories?.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Title *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter thread title"
              required
              minLength={5}
              maxLength={255}
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Minimum 5 characters, maximum 255 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Content *</Form.Label>
            <Form.Control
              as="textarea"
              rows={10}
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your thread content here..."
              required
              minLength={10}
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Minimum 10 characters
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (thread ? 'Update Thread' : 'Create Thread')}
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
      </Card.Body>
    </Card>
  );
};

export default ThreadForm;