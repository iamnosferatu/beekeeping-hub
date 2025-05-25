// frontend/src/components/articles/ArticleTags.js
import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "react-bootstrap";
import { getTagUrl } from "../../utils/urlHelpers";
import { isNotEmpty } from "../../utils/arrayHelpers";
import { ARIA_LABELS } from "../../constants";

/**
 * ArticleTags Component
 * Displays article tags as linked badges
 */
const ArticleTags = ({
  tags,
  variant = "secondary",
  size = "md",
  className = "",
  maxTags = null,
}) => {
  if (!isNotEmpty(tags)) return null;

  const displayTags = maxTags ? tags.slice(0, maxTags) : tags;
  const hasMoreTags = maxTags && tags.length > maxTags;

  return (
    <div
      className={`article-tags ${className}`}
      aria-label={ARIA_LABELS.ARTICLE.TAGS}
    >
      {displayTags.map((tag) => (
        <Link
          key={tag.id}
          to={getTagUrl(tag.slug)}
          className="text-decoration-none"
        >
          <Badge
            bg={variant}
            className={`me-1 mb-1 ${size === "sm" ? "p-1" : "p-2"}`}
          >
            {tag.name}
          </Badge>
        </Link>
      ))}

      {hasMoreTags && (
        <Badge
          bg="light"
          text="dark"
          className={`me-1 mb-1 ${size === "sm" ? "p-1" : "p-2"}`}
        >
          +{tags.length - maxTags}
        </Badge>
      )}
    </div>
  );
};

export default ArticleTags;
