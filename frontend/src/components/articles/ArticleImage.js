// frontend/src/components/articles/ArticleImage.js
import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageHelpers";

/**
 * ArticleImage Component
 * Reusable image component for articles with lazy loading and accessibility
 */
const ArticleImage = ({
  src,
  alt,
  articleUrl,
  loading = "lazy",
  className = "article-image-container",
}) => (
  <div className={className}>
    <Link to={articleUrl}>
      <img
        src={getImageUrl(src)}
        className="card-img-top article-image"
        alt={alt}
        loading={loading}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/api/placeholder/400/300';
        }}
      />
    </Link>
  </div>
);

export default ArticleImage;
