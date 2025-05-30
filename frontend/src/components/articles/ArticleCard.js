// frontend/src/components/articles/ArticleCard.js
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Card, Button, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BsShieldExclamation } from "react-icons/bs";
import AuthContext from "../../contexts/AuthContext";
import { getImageUrl } from "../../utils/imageHelpers";
// Import sub-components
import ArticleImage from "./ArticleImage";
import ArticleTags from "./ArticleTags";
import ArticleStats from "./ArticleStats";
import ArticleAuthor from "./ArticleAuthor";

// Import utilities (simplified if constants don't exist)
const ARTICLE_CONFIG = { IMAGE_LOADING: "lazy" };
const ARIA_LABELS = {
  ARTICLE: {
    CARD: "article",
    TITLE: "article title",
    EXCERPT: "article excerpt",
    READ_MORE: "read more",
  },
};

// Import utilities
const isValidArticle = (article) => {
  return (
    article &&
    typeof article === "object" &&
    article.id &&
    article.title &&
    article.slug
  );
};

const formatAuthorName = (author) => {
  if (!author) return "Unknown Author";
  const fullName = `${author.first_name || ""} ${
    author.last_name || ""
  }`.trim();
  return fullName || author.username || "Unknown Author";
};

const formatDate = (date) => {
  if (!date) return "Draft";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getArticleUrl = (slug) => `/articles/${slug}`;
const getAuthorUrl = (username) => `/author/${username}`;



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
  const { user } = useContext(AuthContext);

  // Validate article data
  if (!isValidArticle(article)) {
    console.warn("ArticleCard: Invalid article data provided", article);
    return null;
  }

  const articleUrl = getArticleUrl(article.slug);
  const isAdmin = user && user.role === "admin";
  const isBlocked = article.blocked;

  return (
    <Card
      className={`article-card shadow-sm h-100 ${className} ${
        isBlocked && isAdmin ? "border-danger" : ""
      }`}
      role={ARIA_LABELS.ARTICLE.CARD}
    >
      {/* Blocked Badge for Admins */}
      {isBlocked && isAdmin && (
        <div
          className="position-absolute top-0 end-0 p-2"
          style={{ zIndex: 10 }}
        >
          <OverlayTrigger
            placement="left"
            overlay={
              <Tooltip>
                This article is blocked. Reason:{" "}
                {article.blocked_reason || "No reason specified"}
              </Tooltip>
            }
          >
            <Badge bg="danger" className="d-flex align-items-center">
              <BsShieldExclamation className="me-1" />
              Blocked
            </Badge>
          </OverlayTrigger>
        </div>
      )}

      {/* Featured Image */}
      {showImage && article.featured_image && (
        <div className="position-relative">
          <ArticleImage
            src={getImageUrl(article.featured_image)}
            alt={article.title}
            articleUrl={articleUrl}
            loading={ARTICLE_CONFIG.IMAGE_LOADING}
          />
          {/* Overlay for blocked articles */}
          {isBlocked && isAdmin && (
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backgroundColor: "rgba(220, 53, 69, 0.1)",
                pointerEvents: "none",
              }}
            />
          )}
        </div>
      )}

      <Card.Body className="d-flex flex-column">
        {/* Header: Tags and Date */}
        <ArticleCardHeader article={article} showTags={true} showDate={true} />

        {/* Article Title with blocked indicator */}
        <ArticleCardTitle
          title={article.title}
          url={articleUrl}
          isBlocked={isBlocked && isAdmin}
        />

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
 * Displays article title as a link with optional blocked styling
 */
const ArticleCardTitle = ({ title, url, isBlocked }) => (
  <Card.Title className="mb-3">
    <Link
      to={url}
      className={`article-title text-decoration-none ${
        isBlocked ? "text-danger" : ""
      }`}
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
