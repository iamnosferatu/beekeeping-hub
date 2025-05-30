// frontend/src/components/articles/ArticleAuthor.js
import React from "react";
import { Link } from "react-router-dom";
import { formatAuthorName } from "../../utils/formatters";
import { getAuthorUrl } from "../../utils/urlHelpers";
import { getAvatarUrl } from "../../utils/imageHelpers";
import { ARIA_LABELS } from "../../constants";

/**
 * ArticleAuthor Component
 * Displays article author information with optional avatar
 */
const ArticleAuthor = ({
  author,
  showLabel = false,
  showAvatar = false,
  size = "md",
  className = "",
}) => {
  if (!author) return null;

  const authorName = formatAuthorName(author);
  const authorUrl = getAuthorUrl(author.username);

  return (
    <div
      className={`author-info d-flex align-items-center ${className}`}
      aria-label={ARIA_LABELS.ARTICLE.AUTHOR}
    >
      {showAvatar && (
        <img
          src={getAvatarUrl(author.avatar)}
          alt={`${authorName} avatar`}
          className={`rounded-circle me-2 ${
            size === "sm" ? "author-avatar-sm" : "author-avatar"
          }`}
          width={size === "sm" ? 24 : 32}
          height={size === "sm" ? 24 : 32}
        />
      )}

      <div>
        {showLabel && <small className="text-muted">By </small>}
        <Link
          to={authorUrl}
          className={`author-name text-decoration-none ${
            size === "sm" ? "small" : ""
          }`}
        >
          {authorName}
        </Link>
      </div>
    </div>
  );
};

export default ArticleAuthor;
