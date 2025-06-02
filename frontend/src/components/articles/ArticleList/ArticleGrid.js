// frontend/src/components/articles/ArticleList/ArticleGrid.js
import React from "react";
import { Row, Col } from "react-bootstrap";
import AdBlock from "../../ads/AdBlock";
import { AD_PLACEMENTS } from "../../../utils/adManager";

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
      {React.Children.map(children, (child, index) => {
        const elements = [];
        
        // Add the article
        elements.push(
          <Col key={index} {...colConfig} className="mb-4">
            {child}
          </Col>
        );
        
        // Add advertisement between articles every 4th article
        if ((index + 1) % 4 === 0 && index < React.Children.count(children) - 1) {
          elements.push(
            <Col key={`ad-${index}`} xs={12} className="mb-4">
              <AdBlock 
                placement={AD_PLACEMENTS.BETWEEN_ARTICLES}
                pageType="article_list"
              />
            </Col>
          );
        }
        
        return elements;
      }).flat()}
    </Row>
  );
};

export default ArticleGrid;
