// frontend/src/pages/SitemapPage.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { BsHouseDoor, BsFileText, BsTag, BsPerson } from 'react-icons/bs';
import apiService from '../services/api';
import { API_URL } from '../config';
import { SEO } from '../contexts/SEOContext';
import './SitemapPage.scss';

/**
 * SitemapPage Component
 * 
 * Displays a structured sitemap of the website for users
 * Groups content by type and provides easy navigation
 */
const SitemapPage = () => {
  const [sitemapData, setSitemapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSitemapData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Make a direct request to the sitemap endpoint
        const response = await apiService.client.get('/sitemap');

        if (response.data && response.data.success) {
          // Handle the response structure
          const data = response.data.data;
          setSitemapData(data);
        } else {
          throw new Error('Failed to load sitemap data');
        }
      } catch (err) {
        console.error('Error fetching sitemap:', err);
        setError('Failed to load sitemap. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSitemapData();
  }, []);

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading sitemap...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <>
      <SEO 
        title="Sitemap"
        description="Navigate through all pages and content on BeeKeeper's Hub. Find articles, tags, and sections organized for easy browsing."
        type="website"
      />
      <Container className="sitemap-page py-5">
        <h1 className="mb-4">Sitemap</h1>
      <p className="lead mb-5">
        Explore all pages and content available on BeeKeeper's Hub
      </p>

      <Row>
        {/* Main Pages Section */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <BsHouseDoor className="me-2" />
                Main Pages
              </h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                {sitemapData?.staticPages?.main.map((page, index) => (
                  <li key={index} className="mb-2">
                    <Link to={page.path}>{page.title}</Link>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Account Pages Section */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <BsPerson className="me-2" />
                Account
              </h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                {sitemapData?.staticPages?.account.map((page, index) => (
                  <li key={index} className="mb-2">
                    <Link to={page.path}>
                      {page.title}
                      {page.requiresAuth && (
                        <small className="text-muted ms-1">(requires login)</small>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Legal Pages Section */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">
                <BsFileText className="me-2" />
                Legal
              </h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                {sitemapData?.staticPages?.legal.map((page, index) => (
                  <li key={index} className="mb-2">
                    <Link to={page.path}>{page.title}</Link>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tags Section */}
      {sitemapData?.tags && sitemapData.tags.length > 0 && (
        <Card className="mb-4 shadow-sm">
          <Card.Header>
            <h5 className="mb-0">
              <BsTag className="me-2" />
              Tags ({sitemapData.totalTags || 0})
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="tag-grid">
              {sitemapData.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/tags/${tag.slug}`}
                  className="tag-item"
                  title={tag.description}
                >
                  {tag.name}
                  <span className="tag-count">({tag.articleCount})</span>
                </Link>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Articles by Date Section */}
      {sitemapData?.articlesByDate && (
        <Card className="shadow-sm">
          <Card.Header>
            <h5 className="mb-0">
              <BsFileText className="me-2" />
              Articles ({sitemapData.totalArticles || 0})
            </h5>
          </Card.Header>
          <Card.Body>
            {Object.keys(sitemapData.articlesByDate)
              .sort((a, b) => b - a) // Sort years in descending order
              .map((year) => (
                <div key={year} className="year-section mb-4">
                  <h6 className="text-primary mb-3">{year}</h6>
                  {Object.keys(sitemapData.articlesByDate[year]).map((month) => (
                    <div key={`${year}-${month}`} className="month-section mb-3">
                      <h6 className="text-muted mb-2">
                        {month} ({sitemapData.articlesByDate[year][month].length})
                      </h6>
                      <ul className="article-list">
                        {sitemapData.articlesByDate[year][month].map((article) => (
                          <li key={article.id}>
                            <Link to={`/articles/${article.slug}`}>
                              {article.title}
                            </Link>
                            <small className="text-muted ms-2">by {article.author}</small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
          </Card.Body>
        </Card>
      )}

      {/* XML Sitemap Link */}
      <div className="mt-5 text-center">
        <p className="text-muted">
          Looking for the XML sitemap? 
          <a 
            href={`${API_URL}/sitemap.xml`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="ms-1"
          >
            View XML Sitemap
          </a>
        </p>
      </div>
    </Container>
    </>
  );
};

export default SitemapPage;