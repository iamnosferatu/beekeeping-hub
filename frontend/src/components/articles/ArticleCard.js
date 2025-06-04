// frontend/src/components/articles/ArticleCard.js
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Button } from "react-bootstrap";
import { BsShieldExclamation } from "react-icons/bs";
import AuthContext from "../../contexts/AuthContext";
import { getImageUrl } from "../../utils/imageHelpers";
import BaseCard from "../common/BaseCard";
// Import sub-components
import ArticleTags from "./ArticleTags";
import ArticleStats from "./ArticleStats";
import ArticleAuthor from "./ArticleAuthor";

// Import utilities (simplified if constants don't exist)
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

const formatDate = (date) => {
  if (!date) return "Draft";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getArticleUrl = (slug) => `/articles/${slug}`;



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
    // Invalid article data provided
    return null;
  }

  const articleUrl = getArticleUrl(article.slug);
  const isAdmin = user && user.role === "admin";
  const isBlocked = article.blocked;

  // Prepare badges
  const badges = [];
  if (isBlocked && isAdmin) {
    badges.push({
      text: "Blocked",
      variant: "danger",
      icon: <BsShieldExclamation />,
      className: "d-flex align-items-center"
    });
  }
  if (article.status === "draft") {
    badges.push({ text: "Draft", variant: "secondary" });
  }

  // Prepare footer content
  const footerContent = (
    <>
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
    </>
  );

  return (
    <BaseCard
      title={
        <Link
          to={articleUrl}
          className={`text-decoration-none ${
            isBlocked && isAdmin ? "text-danger" : ""
          }`}
        >
          {article.title}
        </Link>
      }
      subtitle={
        <div className="d-flex justify-content-between align-items-start">
          <ArticleTags
            tags={article.tags}
            variant="secondary"
            size="sm"
            className="me-2"
          />
          <small className="text-muted flex-shrink-0">
            {formatDate(article.published_at)}
          </small>
        </div>
      }
      image={showImage && article.featured_image ? getImageUrl(article.featured_image) : undefined}
      imageAlt={article.title}
      badges={badges}
      to={articleUrl}
      hoverable
      className={`article-card ${className} ${isBlocked && isAdmin ? "border-danger" : ""}`}
      height="full"
      footer={footerContent}
    >
      {article.excerpt}
    </BaseCard>
  );
};


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

// Memoize ArticleCard to prevent unnecessary re-renders
export default React.memo(ArticleCard, (prevProps, nextProps) => {
  // Only re-render if article data actually changes
  return (
    prevProps.article?.id === nextProps.article?.id &&
    prevProps.article?.title === nextProps.article?.title &&
    prevProps.article?.featured_image === nextProps.article?.featured_image &&
    prevProps.showImage === nextProps.showImage &&
    prevProps.showAuthor === nextProps.showAuthor &&
    prevProps.showStats === nextProps.showStats &&
    prevProps.className === nextProps.className
  );
});
