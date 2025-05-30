// frontend/src/components/articles/ArticleHeader.js
import React, { useContext } from "react";
import { Card, Badge, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  BsEye,
  BsChat,
  BsPerson,
  BsCalendar3,
  BsShieldExclamation,
} from "react-icons/bs";
import moment from "moment";
import AuthContext from "../../contexts/AuthContext";
import LikeButton from "./LikeButton";

/**
 * ArticleHeader Component
 *
 * Displays article header information including title, author, date, tags, and stats.
 * Handles article likes with authentication checks.
 *
 * @param {Object} article - The article object
 */
const ArticleHeader = ({ article }) => {
  const { user } = useContext(AuthContext);

  /**
   * Format author display name
   */
  const getAuthorName = () => {
    if (!article.author) return "Unknown Author";

    const fullName = `${article.author.first_name || ""} ${
      article.author.last_name || ""
    }`.trim();
    return fullName || article.author.username || "Unknown Author";
  };

  return (
    <>
      {/* Blocked Article Alert for Admins */}
      {article.blocked && user && user.role === "admin" && (
        <Alert variant="danger" className="mb-3">
          <div className="d-flex align-items-center">
            <BsShieldExclamation size={24} className="me-3" />
            <div>
              <strong>This article is blocked</strong>
              <div className="mt-1">
                <small>
                  <strong>Reason:</strong>{" "}
                  {article.blocked_reason || "No reason specified"}
                  {article.blocked_at && (
                    <span className="ms-3">
                      <strong>Blocked on:</strong>{" "}
                      {moment(article.blocked_at).format("MMMM D, YYYY")}
                    </span>
                  )}
                </small>
              </div>
            </div>
          </div>
        </Alert>
      )}

      <Card className="mb-4 border-0 shadow-sm">
        {/* Featured Image */}
        {article.featured_image && (
          <div className="article-image-container">
            <img
              src={article.featured_image}
              className="card-img-top article-featured-image"
              alt={article.title}
              style={{
                maxHeight: "400px",
                width: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}

        <Card.Body>
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="mb-2">
              {article.tags.map((tag) => (
                <Link
                  to={`/tags/${tag.slug}`}
                  key={tag.id}
                  className="text-decoration-none"
                >
                  <Badge bg="secondary" className="me-2 mb-1 p-2">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Article Title */}
          <h1 className="article-title mb-3">{article.title}</h1>

          {/* Article Metadata */}
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
            {/* Author and Date */}
            <div className="article-meta d-flex align-items-center mb-2 mb-md-0">
              <BsPerson className="me-1" />
              {article.author ? (
                <Link
                  to={`/author/${article.author.username}`}
                  className="me-3 author-name text-decoration-none"
                >
                  {getAuthorName()}
                </Link>
              ) : (
                <span className="me-3">Unknown Author</span>
              )}

              <BsCalendar3 className="me-1" />
              <span>
                {article.published_at
                  ? moment(article.published_at).format("MMM D, YYYY")
                  : "Draft"}
              </span>
            </div>

            {/* Article Statistics */}
            <div className="article-stats d-flex align-items-center">
              {/* Views */}
              <span className="me-3" title="Views">
                <BsEye className="me-1" />
                {article.view_count || 0}
              </span>

              {/* Likes */}
              <div className="me-3">
                <LikeButton
                  articleId={article.id}
                  initialLikeCount={article.like_count || 0}
                  initialIsLiked={article.is_liked || false}
                  size="sm"
                />
              </div>

              {/* Comments */}
              <span title="Comments">
                <BsChat className="me-1" />
                {article.comment_count || article.comments?.length || 0}
              </span>
            </div>
          </div>

          {/* Article Excerpt (if available) */}
          {article.excerpt && (
            <p className="lead text-muted">{article.excerpt}</p>
          )}
        </Card.Body>
      </Card>
    </>
  );
};

export default ArticleHeader;
