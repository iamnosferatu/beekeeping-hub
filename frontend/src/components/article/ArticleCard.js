// frontend/src/components/articles/ArticleCard.js
import React from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Button } from "react-bootstrap";
import { BsFillHeartFill, BsEye, BsChat } from "react-icons/bs";
import moment from "moment";

/**
 * ArticleCard Component
 *
 * Displays a single article in card format with:
 * - Featured image
 * - Title and excerpt
 * - Tags
 * - Author information
 * - Statistics (views, likes, comments)
 * - Publication date
 *
 * @param {Object} article - Article object with all necessary fields
 */
const ArticleCard = ({ article }) => {
  /**
   * Get the comment count from either comment_count field or comments array length
   * @param {Object} article - Article object
   * @returns {number} Number of comments
   */
  const getCommentCount = (article) => {
    return (
      article.comment_count || (article.comments ? article.comments.length : 0)
    );
  };

  /**
   * Format author name safely
   * @param {Object} author - Author object
   * @returns {string} Formatted author name
   */
  const formatAuthorName = (author) => {
    if (!author) return "Unknown Author";
    return (
      `${author.first_name || ""} ${author.last_name || ""}`.trim() ||
      author.username ||
      "Unknown Author"
    );
  };

  return (
    <Card className="mb-4 article-card shadow-sm h-100">
      {/* Featured Image */}
      {article.featured_image && (
        <div className="article-image-container">
          <Link to={`/articles/${article.slug}`}>
            <img
              src={article.featured_image}
              className="card-img-top article-image"
              alt={article.title}
              loading="lazy"
            />
          </Link>
        </div>
      )}

      <Card.Body className="d-flex flex-column">
        {/* Tags and Date Row */}
        <div className="d-flex justify-content-between align-items-start mb-2">
          {/* Article Tags */}
          <div className="article-tags">
            {article.tags && article.tags.length > 0
              ? article.tags.map((tag) => (
                  <Link
                    to={`/tags/${tag.slug}`}
                    key={tag.id}
                    className="text-decoration-none"
                  >
                    <Badge bg="secondary" className="me-1 mb-1">
                      {tag.name}
                    </Badge>
                  </Link>
                ))
              : null}
          </div>

          {/* Publication Date */}
          <small className="text-muted flex-shrink-0">
            {article.published_at
              ? moment(article.published_at).format("MMM D, YYYY")
              : "Draft"}
          </small>
        </div>

        {/* Article Title */}
        <Card.Title className="mb-3">
          <Link
            to={`/articles/${article.slug}`}
            className="article-title text-decoration-none"
          >
            {article.title}
          </Link>
        </Card.Title>

        {/* Article Excerpt */}
        <Card.Text className="article-excerpt flex-grow-1">
          {article.excerpt}
        </Card.Text>

        {/* Footer with Stats and Author */}
        <div className="mt-auto">
          {/* Article Statistics */}
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="article-stats d-flex">
              <span className="me-3 text-muted" title="Views">
                <BsEye className="me-1" />
                <small>{article.view_count || 0}</small>
              </span>
              <span className="me-3 text-muted" title="Likes">
                <BsFillHeartFill className="me-1" />
                <small>{article.like_count || 0}</small>
              </span>
              <span className="text-muted" title="Comments">
                <BsChat className="me-1" />
                <small>{getCommentCount(article)}</small>
              </span>
            </div>
          </div>

          {/* Author and Read More Button */}
          <div className="d-flex justify-content-between align-items-center">
            {/* Author Information */}
            {article.author && (
              <div className="author-info">
                <small className="text-muted">By </small>
                <Link
                  to={`/author/${article.author.username}`}
                  className="author-name text-decoration-none"
                >
                  <small>{formatAuthorName(article.author)}</small>
                </Link>
              </div>
            )}

            {/* Read More Button */}
            <Link to={`/articles/${article.slug}`}>
              <Button variant="primary" size="sm">
                Read More
              </Button>
            </Link>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ArticleCard;
