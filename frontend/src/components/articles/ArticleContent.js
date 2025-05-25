// frontend/src/components/articles/ArticleContent.js

import React from "react";
import { Card } from "react-bootstrap";
import DOMPurify from "dompurify";

/**
 * ArticleContent Component
 * 
 * Displays the main content of an article with proper sanitization
 * to prevent XSS attacks while preserving HTML formatting.
 * 
 * @param {Object} article - The article object containing content
 */
const ArticleContent = ({ article }) => {
  // Validate article prop
  if (!article || !article.content) {
    return (
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <p className="text-muted">No content available for this article.</p>
        </Card.Body>
      </Card>
    );
  }

  // Sanitize HTML content to prevent XSS attacks
  const sanitizedContent = DOMPurify.sanitize(article.content, {
    // Allow common HTML tags and attributes
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'ul', 'ol', 'li', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel',
      'width', 'height', 'style'
    ],
    // Allow safe URL schemes
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body className="article-content">
        {/* Render sanitized HTML content */}
        <div 
          className="wysiwyg-content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </Card.Body>
    </Card>
  );
};

export default ArticleContent;