// frontend/src/components/layout/Sidebar.js
// REPLACE THE ENTIRE FILE WITH THIS FIXED VERSION:

import React, { useState, useEffect } from "react";
import { Card, ListGroup, Badge, Alert } from "react-bootstrap";
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

        // Fetch real tags from API
        try {
          const tagsResponse = await axios.get(`${API_URL}/tags`);
          if (tagsResponse.data.success) {
            setTags(tagsResponse.data.data || []);
          }
        } catch (tagError) {
          console.error("Error fetching tags:", tagError);
          // Don't fail completely if tags fail
        }

        // Fetch recent articles from API
        try {
          const articlesResponse = await axios.get(`${API_URL}/articles`, {
            params: { limit: 4, sort: "date-desc" },
          });
          if (articlesResponse.data.success) {
            const articles = articlesResponse.data.data || [];
            setRecentArticles(
              articles.map((article) => ({
                id: article.id,
                title: article.title,
                slug: article.slug,
              }))
            );
          }
        } catch (articleError) {
          console.error("Error fetching recent articles:", articleError);
          // Don't fail completely if articles fail
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
        setError("Unable to load sidebar content");
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  return (
    <>
      {/* Popular Tags */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Popular Tags</h5>
        </Card.Header>

        <Card.Body>
          {loading ? (
            <div className="text-center">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <Alert variant="warning" className="mb-0">
              <small>Unable to load tags</small>
            </Alert>
          ) : tags.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  to={`/tags/${tag.slug}`}
                  key={tag.id}
                  className="text-decoration-none"
                >
                  <Badge bg="secondary" className="p-2">
                    {tag.name}
                    {tag.count && (
                      <span className="badge bg-dark text-light ms-1">
                        {tag.count}
                      </span>
                    )}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted mb-0">No tags available</p>
          )}
        </Card.Body>
      </Card>

      {/* Recent Articles */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Recent Articles</h5>
        </Card.Header>

        {loading ? (
          <ListGroup variant="flush">
            <ListGroup.Item className="text-center py-3">
              <div
                className="spinner-border spinner-border-sm text-primary"
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
            </ListGroup.Item>
          </ListGroup>
        ) : error ? (
          <Card.Body>
            <Alert variant="warning" className="mb-0">
              <small>Unable to load recent articles</small>
            </Alert>
          </Card.Body>
        ) : recentArticles.length > 0 ? (
          <ListGroup variant="flush">
            {recentArticles.map((article) => (
              <ListGroup.Item key={article.id}>
                <Link
                  to={`/articles/${article.slug}`}
                  className="text-decoration-none"
                >
                  {article.title}
                </Link>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <Card.Body>
            <p className="text-muted mb-0">No recent articles available</p>
          </Card.Body>
        )}
      </Card>

      {/* Newsletter Signup (Optional) */}
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
