// frontend/src/components/layout/Sidebar.js - NO MOCK DATA VERSION
import React, { useState, useEffect } from "react";
import { Card, ListGroup, Badge, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";

const Sidebar = () => {
  const [tags, setTags] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tags from API
        const tagsResponse = await axios.get(`${API_URL}/tags`);
        if (tagsResponse.data.success) {
          setTags(tagsResponse.data.data);
        } else {
          throw new Error("Failed to fetch tags");
        }

        // Fetch recent articles from API
        const articlesResponse = await axios.get(`${API_URL}/articles?limit=4`);
        if (articlesResponse.data.success) {
          setRecentArticles(articlesResponse.data.data);
        } else {
          throw new Error("Failed to fetch recent articles");
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
        setError("Failed to load sidebar content");
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <>
        {/* Popular Tags Loading */}
        <Card className="mb-4 shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Popular Tags</h5>
          </Card.Header>
          <Card.Body>
            <div className="text-center">
              <Spinner
                animation="border"
                size="sm"
                variant="primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </Card.Body>
        </Card>

        {/* Recent Articles Loading */}
        <Card className="mb-4 shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Recent Articles</h5>
          </Card.Header>
          <Card.Body>
            <div className="text-center">
              <Spinner
                animation="border"
                size="sm"
                variant="primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </Card.Body>
        </Card>
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        {/* Error State */}
        <Card className="mb-4 shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Sidebar</h5>
          </Card.Header>
          <Card.Body>
            <Alert variant="danger" className="mb-0">
              <Alert.Heading>Unable to Load Content</Alert.Heading>
              <p className="mb-0">{error}</p>
            </Alert>
          </Card.Body>
        </Card>
      </>
    );
  }

  return (
    <>
      {/* Popular Tags */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Popular Tags</h5>
        </Card.Header>

        <Card.Body>
          {tags.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  to={`/tags/${tag.slug}`}
                  key={tag.id}
                  className="text-decoration-none"
                >
                  <Badge bg="secondary" className="p-2">
                    {tag.name}
                    {tag.article_count && (
                      <span className="badge bg-light text-dark ms-1">
                        {tag.article_count}
                      </span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <Alert variant="info" className="mb-0">
              No tags available
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Recent Articles */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Recent Articles</h5>
        </Card.Header>

        {recentArticles.length > 0 ? (
          <ListGroup variant="flush">
            {recentArticles.map((article) => (
              <ListGroup.Item key={article.id}>
                <Link
                  to={`/articles/${article.slug}`}
                  className="text-decoration-none"
                >
                  <div className="fw-semibold">{article.title}</div>
                  {article.published_at && (
                    <small className="text-muted">
                      {new Date(article.published_at).toLocaleDateString()}
                    </small>
                  )}
                </Link>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Card.Body>
            <Alert variant="info" className="mb-0">
              No recent articles available
            </Alert>
          </Card.Body>
        )}
      </Card>

      {/* Newsletter Signup */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Newsletter</h5>
        </Card.Header>

        <Card.Body>
          <p>
            Subscribe to our newsletter for the latest beekeeping tips and news.
          </p>
          <form>
            <div className="input-group mb-3">
              <input
                type="email"
                className="form-control"
                placeholder="Your email"
                aria-label="Email address"
              />
              <button className="btn btn-primary" type="submit">
                Subscribe
              </button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </>
  );
};

export default Sidebar;
