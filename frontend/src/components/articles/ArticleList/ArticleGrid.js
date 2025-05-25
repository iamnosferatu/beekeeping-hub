// frontend/src/components/articles/ArticleList/ArticleGrid.js
import React from "react";
import { Row, Col } from "react-bootstrap";

/**
 * ArticleGrid Component
 * Responsive grid container for articles with different layout options
 */
const ArticleGrid = ({ children, layout = "grid" }) => {
  /**
   * Get column configuration based on layout
   */
  const getColumnConfig = () => {
    switch (layout) {
      case "compact":
        return { xs: 12, sm: 6, md: 4, lg: 3 };
      case "list":
        return { xs: 12 };
      case "grid":
      default:
        return { xs: 12, md: 6, lg: 4 };
    }
  };

  const colConfig = getColumnConfig();

  if (layout === "list") {
    // List layout: single column
    return <div className="article-grid article-grid--list">{children}</div>;
  }

  // Grid layouts: use Bootstrap grid
  return (
    <Row className={`article-grid article-grid--${layout}`}>
      {React.Children.map(children, (child, index) => (
        <Col key={index} {...colConfig} className="mb-4">
          {child}
        </Col>
      ))}
    </Row>
  );
};

export default ArticleGrid;
