import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { FaComments, FaUser, FaClock, FaLock } from 'react-icons/fa';
import './ForumComponents.scss';

const CategoryList = ({ categories, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Card className="text-center py-5">
        <Card.Body>
          <h5 className="text-muted">No forum categories available yet</h5>
          <p className="text-muted">Categories will appear here once created by authors or admins.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Row className="g-4">
      {categories.map((category) => (
        <Col md={6} lg={4} key={category.id}>
          <Card className="forum-category-card h-100">
            <Card.Body>
              <h5 className="category-title">
                <Link to={`/forum/categories/${category.slug}`} className="text-decoration-none">
                  {category.name}
                </Link>
                {category.isBlocked && (
                  <Badge bg="danger" className="ms-2">
                    <FaLock /> Blocked
                  </Badge>
                )}
              </h5>
              
              {category.description && (
                <p className="category-description text-muted">
                  {category.description}
                </p>
              )}
              
              <div className="category-stats">
                <span className="stat-item">
                  <FaComments className="me-1" />
                  {category.threadCount || 0} threads
                </span>
                <span className="stat-item">
                  <FaUser className="me-1" />
                  by {category.creator?.username || 'Unknown'}
                </span>
              </div>
              
              <div className="category-meta text-muted small mt-2">
                <FaClock className="me-1" />
                Created on {new Date(category.created_at).toLocaleDateString()}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CategoryList;