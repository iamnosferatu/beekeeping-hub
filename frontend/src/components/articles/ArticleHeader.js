// frontend/src/components/articles/ArticleHeader.js
import React, { useState, useContext } from "react";
import { Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  BsFillHeartFill,
  BsEye,
  BsChat,
  BsPerson,
  BsCalendar3,
} from "react-icons/bs";
import moment from "moment";
import AuthContext from "../../contexts/AuthContext";

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

  // Initialize like state based on user's previous like
  const [liked, setLiked] = useState(
    article.likes?.some((like) => like.user_id === user?.id) || false
  );
  const [likeCount, setLikeCount] = useState(article.like_count || 0);
  const [liking, setLiking] = useState(false);

  /**
   * Handle like/unlike toggle
   */
  const handleLikeToggle = async () => {
    // Check if user is authenticated
    if (!user) {
      // Redirect to login with return URL
      window.location.href = `/login?redirect=/articles/${article.slug}`;
      return;
    }

    try {
      setLiking(true);

      // TODO: Implement actual API call when backend is ready
      console.log("Toggling like for article:", article.id);

      // For now, just toggle the local state
      setLiked(!liked);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert state on error
      setLiked(liked);
      setLikeCount(article.like_count || 0);
    } finally {
      setLiking(false);
    }
  };

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
            <span
              className={`me-3 ${liked ? "text-danger" : ""} ${
                !liking ? "cursor-pointer" : ""
              }`}
              onClick={!liking ? handleLikeToggle : undefined}
              style={{ cursor: liking ? "wait" : "pointer" }}
              title={liked ? "Unlike" : "Like"}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleLikeToggle();
                }
              }}
            >
              <BsFillHeartFill className="me-1" />
              {likeCount}
            </span>

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
  );
};

export default ArticleHeader;
