// frontend/src/components/common/TagCloud.js
import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsTagsFill } from 'react-icons/bs';
import apiService from '../../services/api';
import './TagCloud.scss';

/**
 * TagCloud Component
 * 
 * Displays popular tags in a cloud format with varying sizes based on usage
 * 
 * @param {number} limit - Maximum number of tags to display (default: 20)
 * @param {string} title - Title for the widget (default: "Popular Tags")
 */
const TagCloud = ({ limit = 20, title = "Popular Tags" }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchPopularTags = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.tags.getPopular(limit);

        if (response.success) {
          // Handle nested response structure
          let tagsData = [];
          
          if (response.data && typeof response.data === 'object') {
            if (response.data.data && Array.isArray(response.data.data)) {
              tagsData = response.data.data;
            } else if (Array.isArray(response.data)) {
              tagsData = response.data;
            }
          }
          

          // Calculate size classes based on article count
          if (tagsData.length > 0) {
            const counts = tagsData.map(tag => tag.article_count || 0);
            const maxCount = Math.max(...counts);
            const minCount = Math.min(...counts);
            const range = maxCount - minCount || 1;

            const tagsWithSize = tagsData.map(tag => {
              const count = tag.article_count || 0;
              let sizeClass = 'tag-sm';
              
              if (range > 0) {
                const percentage = ((count - minCount) / range) * 100;
                if (percentage >= 75) sizeClass = 'tag-xl';
                else if (percentage >= 50) sizeClass = 'tag-lg';
                else if (percentage >= 25) sizeClass = 'tag-md';
              }

              return { ...tag, sizeClass };
            });

            setTags(tagsWithSize);
          } else {
            setTags([]);
          }
        } else {
          throw new Error(response.error?.message || 'Failed to load tags');
        }
      } catch (err) {
        // Error fetching popular tags
        setError('Failed to load tags');
      } finally {
        setLoading(false);
      }
    };

    fetchPopularTags();
  }, [limit]);

  if (loading) {
    return (
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">{title}</h5>
        </Card.Header>
        <Card.Body className="text-center">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="mt-2 mb-0 small text-muted">Loading tags...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error || tags.length === 0) {
    return null; // Don't show widget if no tags or error
  }

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header>
        <h5 className="mb-0">{title}</h5>
      </Card.Header>
      <Card.Body>
        <div className="tag-cloud">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              to={`/tags/${tag.slug}`}
              className={`tag-cloud-item ${tag.sizeClass}`}
              title={`${tag.article_count} article${tag.article_count !== 1 ? 's' : ''}`}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TagCloud;