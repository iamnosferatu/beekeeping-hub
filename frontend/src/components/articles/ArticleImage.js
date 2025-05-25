// frontend/src/components/articles/ArticleImage.js
import React from "react";
import { Link } from "react-router-dom";

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
        src={src}
        className="card-img-top article-image"
        alt={alt}
        loading={loading}
      />
    </Link>
  </div>
);

export default ArticleImage;
