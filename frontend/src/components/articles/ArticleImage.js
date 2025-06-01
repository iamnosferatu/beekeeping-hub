// frontend/src/components/articles/ArticleImage.js
import React from "react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../../utils/imageHelpers";
import "./ArticleImage.scss";

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
}) => {
  // Create a stable placeholder URL
  const placeholderUrl = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f8f9fa" width="400" height="300"/%3E%3Ctext fill="%236c757d" font-family="Arial" font-size="16" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
  
  return (
    <div className={className}>
      <Link to={articleUrl}>
        <img
          src={src} // src is already processed by getImageUrl in ArticleCard
          className="card-img-top article-image"
          alt={alt}
          loading={loading}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholderUrl;
          }}
        />
      </Link>
    </div>
  );
};

export default ArticleImage;
