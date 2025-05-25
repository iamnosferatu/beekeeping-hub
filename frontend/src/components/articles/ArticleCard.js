// frontend/src/components/articles/ArticleCard.js
import React from "react";
import { Link } from "react-router-dom";
import { Card, Button } from "react-bootstrap";

// Import from centralized constants
import { ARTICLE_CONFIG, ARIA_LABELS } from "../../constants";

// Import utilities
import { isValidArticle } from "../../utils/validators";
import { formatAuthorName, formatDate } from "../../utils/formatters";
import { getArticleUrl, getAuthorUrl } from "../../utils/urlHelpers";

// Import sub-components
import ArticleImage from "./ArticleImage";
import ArticleTags from "./ArticleTags";
import ArticleStats from "./ArticleStats";
import ArticleAuthor from "./ArticleAuthor";

/**
 * ArticleCard Component
 *
 * A modular article card component that displays article information
 * in a consistent, accessible format.
 *
 * @param {Object} props - Component props
 * @param {Object} props.article - Article object
 * @param {boolean} props.showImage - Whether to show featured image
 * @param {boolean} props.showAuthor - Whether to show author info
 * @param {boolean} props.showStats - Whether to show article stats
 * @param {string} props.className - Additional CSS classes
 */
const ArticleCard = ({
  article,
  showImage = true,
  showAuthor = true,
  showStats = true,
  className = "",
}) => {
  // Validate article data
  if (!isValidArticle(article)) {
    console.warn("ArticleCard: Invalid article data provided", article);
    return null;
  }

  const articleUrl = getArticleUrl(article.slug);

  return (
    <Card
      className={`article-card shadow-sm h-100 ${className}`}
      role={ARIA_LABELS.ARTICLE.CARD}
    >
      {/* Featured Image */}
      {showImage && article.featured_image && (
        <ArticleImage
          src={article.featured_image}
          alt={article.title}
          articleUrl={articleUrl}
          loading={ARTICLE_CONFIG.IMAGE_LOADING}
        />
      )}

      <Card.Body className="d-flex flex-column">
        {/* Header: Tags and Date */}
        <ArticleCardHeader article={article} showTags={true} showDate={true} />

        {/* Article Title */}
        <ArticleCardTitle title={article.title} url={articleUrl} />

        {/* Article Excerpt */}
        <ArticleCardExcerpt excerpt={article.excerpt} />

        {/* Footer: Stats and Actions */}
        <div className="mt-auto">
          {showStats && (
            <ArticleStats
              viewCount={article.view_count}
              likeCount={article.like_count}
              commentCount={article.comment_count || article.comments?.length}
              className="mb-2"
            />
          )}

          <ArticleCardFooter
            article={article}
            articleUrl={articleUrl}
            showAuthor={showAuthor}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

/**
 * ArticleCardHeader Component
 * Displays tags and publication date
 */
const ArticleCardHeader = ({ article, showTags, showDate }) => (
  <div className="d-flex justify-content-between align-items-start mb-2">
    {showTags && (
      <ArticleTags
        tags={article.tags}
        variant="secondary"
        size="sm"
        className="me-2"
      />
    )}

    {showDate && (
      <small className="text-muted flex-shrink-0">
        {formatDate(article.published_at)}
      </small>
    )}
  </div>
);

/**
 * ArticleCardTitle Component
 * Displays article title as a link
 */
const ArticleCardTitle = ({ title, url }) => (
  <Card.Title className="mb-3">
    <Link
      to={url}
      className="article-title text-decoration-none"
      aria-label={ARIA_LABELS.ARTICLE.TITLE}
    >
      {title}
    </Link>
  </Card.Title>
);

/**
 * ArticleCardExcerpt Component
 * Displays article excerpt with consistent styling
 */
const ArticleCardExcerpt = ({ excerpt }) => (
  <Card.Text
    className="article-excerpt flex-grow-1"
    aria-label={ARIA_LABELS.ARTICLE.EXCERPT}
  >
    {excerpt}
  </Card.Text>
);

/**
 * ArticleCardFooter Component
 * Displays author info and read more button
 */
const ArticleCardFooter = ({ article, articleUrl, showAuthor }) => (
  <div className="d-flex justify-content-between align-items-center">
    {showAuthor && article.author && (
      <ArticleAuthor author={article.author} showLabel={true} size="sm" />
    )}

    <Link to={articleUrl}>
      <Button
        variant="primary"
        size="sm"
        aria-label={ARIA_LABELS.ARTICLE.READ_MORE}
      >
        Read More
      </Button>
    </Link>
  </div>
);

export default ArticleCard;
