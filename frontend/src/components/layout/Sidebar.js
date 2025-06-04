// frontend/src/components/layout/Sidebar.js
import React, { useState, useEffect } from "react";
import { Card, ListGroup, Badge, Alert, Spinner, Form } from "react-bootstrap";
import { Link, useLocation, useParams } from "react-router-dom";
import { useArticles, useNewsletterSubscribe } from "../../hooks";
import TagCloud from "../common/TagCloud";
import RelatedArticles from "../articles/RelatedArticles";
import RecentThreads from "../forum/RecentThreads";

/**
 * Sidebar Component
 *
 * Context-aware sidebar that displays different content based on the current section.
 * Shows forum-specific widgets in forum pages, article-specific widgets in article pages.
 */
const Sidebar = () => {
  const location = useLocation();
  const [currentArticleId, setCurrentArticleId] = useState(null);
  const [currentArticleData, setCurrentArticleData] = useState(null);
  
  // State for newsletter
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState(null);
  const [newsletterError, setNewsletterError] = useState(null);
  
  // Use articles hook for recent articles
  const { data: articlesData, loading: articlesLoading, error: articlesError } = useArticles(
    { limit: 5, sort: "date-desc", status: "published" },
    { immediate: true }
  );
  
  // Use newsletter subscription hook
  const { mutate: subscribeToNewsletter, loading: newsletterLoading } = useNewsletterSubscribe({
    onSuccess: (response) => {
      setNewsletterMessage(response.message || "Thank you for subscribing!");
      setEmail(""); // Clear the form
      setNewsletterError(null);
    },
    onError: (error) => {
      setNewsletterError(
        error.message || "Unable to subscribe. Please try again later."
      );
      setNewsletterMessage(null);
    },
  });
  
  // Process articles data
  const recentArticles = articlesData
    ? articlesData
        .filter((article) => article.id && article.title && article.slug)
        .slice(0, 5)
        .map((article) => ({
          id: article.id,
          title: article.title,
          slug: article.slug,
        }))
    : [];

  // Determine if we're in the forum section
  const isForumSection = location.pathname.startsWith('/forum');


  /**
   * Handle newsletter subscription
   */
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setNewsletterMessage(null);
    setNewsletterError(null);
    
    if (!email) {
      setNewsletterError("Please enter your email address");
      return;
    }
    
    subscribeToNewsletter(email);
  };

  /**
   * Check if we're on an article page and get the article ID
   */
  useEffect(() => {
    // Check if we're on an article page (URL pattern: /articles/:slug)
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'articles' && pathParts[2] && !pathParts[3]) {
      // We're on an article page, fetch the article to get its ID
      const slug = pathParts[2];
      fetchArticleBySlug(slug);
    } else {
      // Not on an article page
      setCurrentArticleId(null);
      setCurrentArticleData(null);
    }
  }, [location.pathname]);

  /**
   * Fetch article data by slug to get the ID
   */
  const fetchArticleBySlug = async (slug) => {
    try {
      const response = await api.articles.getBySlug(slug);
      if (response.success && response.data) {
        // Handle nested response structure
        const article = response.data.data || response.data.article || response.data;
        if (article && article.id) {
          setCurrentArticleId(article.id);
          setCurrentArticleData(article);
        }
      }
    } catch (error) {
      // Error fetching article data
      setCurrentArticleId(null);
      setCurrentArticleData(null);
    }
  };


  return (
    <>
      {/* Related Articles - Only show on article pages */}
      {currentArticleId && !isForumSection && (
        <RelatedArticles articleId={currentArticleId} limit={5} />
      )}
      
      {/* Forum Section Widgets */}
      {isForumSection ? (
        <>
          {/* Recent Threads - Forum section only */}
          <RecentThreads limit={5} />
          
          {/* Newsletter signup is shown in both sections */}
        </>
      ) : (
        <>
          {/* Tag Cloud Widget - Main section only */}
          <TagCloud limit={20} title="Popular Tags" />

          {/* Recent Articles Card - Main section only */}
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
                  <small>{articlesError?.message || "Unable to load recent articles"}</small>
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
        </>
      )}

      {/* Newsletter Signup Card - Shown in both sections */}
      <Card className="mb-4 shadow-sm">
        <Card.Header>
          <h5 className="mb-0">Newsletter</h5>
        </Card.Header>
        <Card.Body>
          <p className="mb-3">
            Subscribe to our newsletter for the latest beekeeping tips and news.
          </p>
          
          {newsletterMessage && (
            <Alert variant="success" className="mb-3" dismissible onClose={() => setNewsletterMessage(null)}>
              {newsletterMessage}
            </Alert>
          )}
          
          {newsletterError && (
            <Alert variant="danger" className="mb-3" dismissible onClose={() => setNewsletterError(null)}>
              {newsletterError}
            </Alert>
          )}
          
          <Form onSubmit={handleNewsletterSubmit}>
            <div className="input-group">
              <Form.Control
                type="email"
                placeholder="Your email"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={newsletterLoading}
                required
              />
              <button 
                className="btn btn-primary" 
                type="submit"
                disabled={newsletterLoading || !email}
              >
                {newsletterLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                    Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </button>
            </div>
          </Form>
          <small className="text-muted d-block mt-2">
            We respect your privacy. Unsubscribe at any time.
          </small>
        </Card.Body>
      </Card>
    </>
  );
};

export default Sidebar;