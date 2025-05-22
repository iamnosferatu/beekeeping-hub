// frontend/src/components/articles/ArticleList.js
import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Badge,
  Pagination,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { BsFillHeartFill, BsEye, BsChat } from "react-icons/bs";
import moment from "moment";
import { useArticles } from "../../hooks/api/useArticles";
import "./ArticleList.scss";

const ArticleList = ({ tag, search, limit = 5 }) => {
  // Use the new API hook for fetching articles
  const {
    data: articles,
    loading,
    error,
    pagination,
    changePage,
  } = useArticles(
    {
      tag,
      search,
      limit,
    },
    {
      onError: (error) => {
        console.error("Error fetching articles:", error);
      },
    }
  );

  const handlePageChange = (newPage) => {
    changePage(newPage);
    window.scrollTo(0, 0);
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading articles...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="danger" className="mb-4">
        <Alert.Heading>Error Loading Articles</Alert.Heading>
        <p>{error.message || "Failed to load articles. Please try again."}</p>
        {error.type === "NETWORK_ERROR" && (
          <p className="mb-0">
            <small>Please check your internet connection and try again.</small>
          </p>
        )}
      </Alert>
    );
  }

  // Empty state
  if (!articles || articles.length === 0) {
    return (
      <Alert variant="info" className="mb-4">
        <Alert.Heading>No Articles Found</Alert.Heading>
        <p>
          {search
            ? `No articles matching "${search}". Try a different search term.`
            : tag
            ? `No articles with the tag "${tag}" found.`
            : "No articles available at the moment."}
        </p>
      </Alert>
    );
  }

  return (
    <div className="article-list">
      {articles.map((article) => (
        <Card key={article.id} className="mb-4 article-card shadow-sm">
          {article.featured_image && (
            <div className="article-image-container">
              <img
                src={article.featured_image}
                className="card-img-top article-image"
                alt={article.title}
              />
            </div>
          )}

          <Card.Body>
            <div className="d-flex justify-content-between mb-2">
              <div className="article-tags">
                {article.tags &&
                  article.tags.map((tag) => (
                    <Link to={`/tags/${tag.slug}`} key={tag.id}>
                      <Badge bg="secondary" className="me-1">
                        {tag.name}
                      </Badge>
                    </Link>
                  ))}
              </div>

              <small className="text-muted">
                {article.published_at &&
                  moment(article.published_at).format("MMM D, YYYY")}
              </small>
            </div>

            <Card.Title>
              <Link to={`/articles/${article.slug}`} className="article-title">
                {article.title}
              </Link>
            </Card.Title>

            <Card.Text className="article-excerpt">{article.excerpt}</Card.Text>

            <div className="d-flex justify-content-between align-items-center">
              <div className="article-meta">
                <span className="me-3" title="Views">
                  <BsEye className="me-1" />
                  {article.view_count || 0}
                </span>
                <span className="me-3" title="Likes">
                  <BsFillHeartFill className="me-1" />
                  {article.like_count || 0}
                </span>
                <span title="Comments">
                  <BsChat className="me-1" />
                  {article.comments ? article.comments.length : 0}
                </span>
              </div>

              <div className="d-flex align-items-center">
                {article.author && (
                  <div className="author-info me-3">
                    <small className="text-muted">By</small>
                    <Link
                      to={`/author/${article.author.username}`}
                      className="ms-1 author-name"
                    >
                      {article.author.first_name} {article.author.last_name}
                    </Link>
                  </div>
                )}

                <Link to={`/articles/${article.slug}`}>
                  <Button variant="primary" size="sm">
                    Read More
                  </Button>
                </Link>
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
            />
            <Pagination.Prev
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            />

            {[...Array(pagination.totalPages).keys()].map((number) => (
              <Pagination.Item
                key={number + 1}
                active={number + 1 === pagination.page}
                onClick={() => handlePageChange(number + 1)}
              >
                {number + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            />
            <Pagination.Last
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.page === pagination.totalPages}
            />
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default ArticleList;
