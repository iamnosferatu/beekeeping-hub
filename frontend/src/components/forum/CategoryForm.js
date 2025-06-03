import React, { useState } from 'react';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useForum } from '../../hooks/api/useForum';

const CategoryForm = ({ category, onSuccess, onCancel }) => {
  const navigate = useNavigate();
  const { createCategory, updateCategory, loading } = useForum();
  
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || ''
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
      let result;
      if (category) {
        // Update existing category
        result = await updateCategory(category.id, formData);
      } else {
        // Create new category
        result = await createCategory(formData);
      }
      
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(`/forum/categories/${result.slug}`);
      }
    } catch (error) {
      setError(error.message || 'Failed to save category');
    }
  };

  return (
    <Card>
      <Card.Body>
        <h3 className="mb-4">{category ? 'Edit Category' : 'Create New Category'}</h3>
        
        <Form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Name *</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter category name"
              required
              minLength={3}
              maxLength={100}
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Minimum 3 characters, maximum 100 characters
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of this category (optional)"
              maxLength={500}
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Maximum 500 characters
            </Form.Text>
          </Form.Group>

          <div className="d-flex gap-2">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : (category ? 'Update Category' : 'Create Category')}
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

export default CategoryForm;