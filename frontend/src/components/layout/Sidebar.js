// frontend/src/components/layout/Sidebar.js
import React, { useState, useEffect } from "react";
import { Card, ListGroup, Badge, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../../config";

/**
 * Sidebar Component
 *
 * Displays popular tags and recent articles in the sidebar.
 * Fetches real data from the API and handles loading/error states.
 */
const Sidebar = () => {
  // State for tags
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState(null);

  // State for recent articles
  const [recentArticles, setRecentArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState(null);

  /**
   * Fetch tags from the API
   */
  const fetchTags = async () => {
    try {
      setTagsLoading(true);
      setTagsError(null);

      console.log("Fetching tags from:", `${API_URL}/tags`);

      const response = await axios.get(`${API_URL}/tags`);

      console.log("Tags response:", response.data);

      if (response.data.success && response.data.data) {
        // The API returns tags with id, name, and slug properties
        // We'll display all tags that have a name
        const validTags = response.data.data.filter(
          (tag) => tag.name && tag.slug
        );
        console.log("Valid tags found:", validTags.length);
        setTags(validTags);
      } else {
        console.warn("Unexpected tags response structure:", response.data);
        setTags([]);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setTagsError("Unable to load tags");
      setTags([]);
    } finally {
      setTagsLoading(false);
    }
  };

  /**
   * Fetch recent articles from the API
   */
  const fetchRecentArticles = async () => {
    try {
      setArticlesLoading(true);
      setArticlesError(null);

      console.log("Fetching recent articles");

      const response = await axios.get(`${API_URL}/articles`, {
        params: {
          limit: 5,
          sort: "date-desc",
          status: "published", // Only show published articles
        },
      });

      console.log("Recent articles response:", response.data);

      if (response.data.success && response.data.data) {
        const articles = response.data.data || [];
        // Only show articles that have required fields
        const validArticles = articles
          .filter((article) => article.id && article.title && article.slug)
          .slice(0, 5) // Limit to 5 articles
          .map((article) => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
          }));

        console.log("Valid recent articles found:", validArticles.length);
        setRecentArticles(validArticles);
      } else {
        setRecentArticles([]);
      }
    } catch (error) {
      console.error("Error fetching recent articles:", error);
      setArticlesError("Unable to load recent articles");
      setRecentArticles([]);
    } finally {
      setArticlesLoading(false);
    }
  };

  /**
   * Fetch data on component mount
   */
  useEffect(() => {
    // Fetch both tags and articles independently
    fetchTags();
    fetchRecentArticles();
  }, []);

  return (
    <>
      {/* Popular Tags Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Popular Tags</h5>
        </Card.Header>
        <Card.Body>
          {tagsLoading ? (
            // Loading state
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" variant="primary" />
              <p className="mt-2 mb-0 small text-muted">Loading tags...</p>
            </div>
          ) : tagsError ? (
            // Error state
            <Alert variant="warning" className="mb-0">
              <small>{tagsError}</small>
            </Alert>
          ) : tags.length > 0 ? (
            // Tags display
            <div className="d-flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link
                  to={`/tags/${tag.slug}`}
                  key={tag.id}
                  className="text-decoration-none"
                  title={`View articles tagged with ${tag.name}`}
                >
                  <Badge
                    bg="secondary"
                    className="p-2 tag-badge"
                    style={{
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 4px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            // Empty state
            <p className="text-muted mb-0 text-center">
              <small>No tags available yet</small>
            </p>
          )}

          {/* Debug info in development */}
          {process.env.NODE_ENV === "development" && !tagsLoading && (
            <div className="mt-3 p-2 bg-light rounded">
              <small className="text-muted">
                Debug: Found {tags.length} tags from API
              </small>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Recent Articles Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Recent Articles</h5>
        </Card.Header>
        {articlesLoading ? (
          // Loading state
          <Card.Body>
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" variant="primary" />
              <p className="mt-2 mb-0 small text-muted">Loading articles...</p>
            </div>
          </Card.Body>
        ) : articlesError ? (
          // Error state
          <Card.Body>
            <Alert variant="warning" className="mb-0">
              <small>{articlesError}</small>
            </Alert>
          </Card.Body>
        ) : recentArticles.length > 0 ? (
          // Articles list
          <ListGroup variant="flush">
            {recentArticles.map((article) => (
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
        ) : (
          // Empty state
          <Card.Body>
            <p className="text-muted mb-0 text-center">
              <small>No recent articles available</small>
            </p>
          </Card.Body>
        )}

        {/* View all articles link */}
        {recentArticles.length > 0 && (
          <Card.Footer className="text-center">
            <Link to="/articles" className="text-decoration-none small">
              View all articles →
            </Link>
          </Card.Footer>
        )}
      </Card>

      {/* Newsletter Signup Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Newsletter</h5>
        </Card.Header>
        <Card.Body>
          <p className="mb-3">
            Subscribe to our newsletter for the latest beekeeping tips and news.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Handle newsletter signup
              alert("Newsletter signup coming soon!");
            }}
          >
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="Your email"
                aria-label="Email address"
                required
              />
              <button className="btn btn-primary" type="submit">
                Subscribe
              </button>
            </div>
          </form>
          <small className="text-muted d-block mt-2">
            We respect your privacy. Unsubscribe at any time.
          </small>
        </Card.Body>
      </Card>
    </>
  );
};

export default Sidebar;
