// frontend/src/components/articles/RelatedArticles.js
import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';

/**
 * RelatedArticles Component
 * 
 * Displays a list of articles related to the current article
 * Related articles are determined by:
 * 1. Common tags
 * 2. Same author
 * 3. View count/popularity
 * 
 * @param {number} articleId - Current article ID
 * @param {number} limit - Number of related articles to show (default: 5)
 */
const RelatedArticles = ({ articleId, limit = 5 }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!articleId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await apiService.articles.getRelated(articleId, limit);

        if (response.success) {
          // Handle nested response structure
          let articlesData = [];
          
          // Check if data is nested (API service wraps the response)
          if (response.data && typeof response.data === 'object') {
            if (response.data.data && Array.isArray(response.data.data)) {
              // Nested structure: response.data.data contains the articles
              articlesData = response.data.data;
            } else if (Array.isArray(response.data)) {
              // Direct array
              articlesData = response.data;
            }
          }
          
          setArticles(articlesData);
        } else {
          throw new Error(response.error?.message || 'Failed to load related articles');
        }
      } catch (err) {
        // Error fetching related articles
        setError('Failed to load related articles');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedArticles();
  }, [articleId, limit]);

  if (loading) {
    return (
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Related Articles</h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" variant="primary" />
            <p className="mt-2 mb-0 small text-muted">Loading articles...</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error || !Array.isArray(articles) || articles.length === 0) {
    return null; // Don't show section if no related articles
  }

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header>
        <h5 className="mb-0">Related Articles</h5>
      </Card.Header>
      <ListGroup variant="flush">
        {articles.map((article) => (
          <ListGroup.Item
            key={article.id}
            className="px-3 py-2"
            style={{
              transition: "background-color 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <Link
              to={`/articles/${article.slug}`}
              className="text-decoration-none d-block"
              title={article.title}
            >
              <div className="text-truncate">{article.title}</div>
            </Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </Card>
  );
};

export default RelatedArticles;