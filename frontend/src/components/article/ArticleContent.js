// frontend/src/components/article/ArticleContent.js
import React from "react";
import { Card } from "react-bootstrap";
import DOMPurify from "dompurify"; // Install: npm install dompurify

const ArticleContent = ({ article }) => {
  // Sanitize HTML content to prevent XSS
  const sanitizedContent = DOMPurify.sanitize(article.content);

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Body className="article-content">
        <div
          className="wysiwyg-content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </Card.Body>
    </Card>
  );
};

export default ArticleContent;
