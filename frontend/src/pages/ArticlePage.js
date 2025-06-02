// frontend/src/pages/ArticlePage.js - Updated with Nested Comments
import React from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Spinner, Alert, Button } from "react-bootstrap";
import { useArticleBySlug } from "../hooks/queries/useArticles";
import ArticleHeader from "../components/articles/ArticleHeader";
import ArticleContent from "../components/articles/ArticleContent";
import NestedCommentsSection from "../components/articles/Comments/NestedCommentsSection";
import AdBlock from "../components/ads/AdBlock";
import { AD_PLACEMENTS } from "../utils/adManager";
import "./ArticlePage.scss";

/**
 * ArticlePage Component
 *
 * Displays a single article with its full content, metadata, and nested comments.
 * Handles loading states, errors, and article not found scenarios.
 */
const ArticlePage = () => {
  const { slug } = useParams();

  // Fetch article data using React Query hook
  const { data: article, isLoading, error } = useArticleBySlug(slug);

  // Loading state - show spinner while fetching article
  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading article...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading article...</p>
      </Container>
    );
  }

  // Error state - show error message with retry option
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Article</Alert.Heading>
          <p>{error.message || "Failed to load article. Please try again."}</p>
          <div className="d-flex justify-content-end">
            <Link to="/articles">
              <Button variant="outline-danger">Back to Articles</Button>
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  // Handle different data structures from backend
  // This is the key fix - backend might return data directly or wrapped
  const articleData = article?.data || article;

  // Not found state - article doesn't exist or data is invalid
  if (!articleData || !articleData.title) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Article Not Found</Alert.Heading>
          <p>
            The article you're looking for doesn't exist or has been removed.
          </p>
          <div className="d-flex justify-content-end">
            <Link to="/articles">
              <Button variant="outline-warning">Browse Articles</Button>
            </Link>
          </div>
        </Alert>
      </Container>
    );
  }

  // Render the article
  return (
    <div className="article-page">
      {/* Top article advertisement */}
      <AdBlock 
        placement={AD_PLACEMENTS.ARTICLE_TOP}
        pageType="article"
      />
      
      {/* Article Header with title, author, date, and stats */}
      <ArticleHeader article={articleData} />

      {/* Article Content - the main body of the article */}
      <ArticleContent article={articleData} />
      
      {/* Middle article advertisement */}
      <AdBlock 
        placement={AD_PLACEMENTS.ARTICLE_MIDDLE}
        pageType="article"
      />

      {/* Nested Comments Section - New enhanced comments with threading */}
      <NestedCommentsSection
        articleId={articleData.id}
        initialComments={articleData.comments || []}
        showCommentForm={true}
      />
      
      {/* Bottom article advertisement */}
      <AdBlock 
        placement={AD_PLACEMENTS.ARTICLE_BOTTOM}
        pageType="article"
      />
    </div>
  );
};

export default ArticlePage;
