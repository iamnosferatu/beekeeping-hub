// frontend/src/pages/ArticlePage.js
import React from "react";
import { useParams } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import { useArticleBySlug } from "../hooks/api/useArticles";
import ArticleHeader from "../components/article/ArticleHeader";
import ArticleContent from "../components/article/ArticleContent";
import ArticleAuthor from "../components/article/ArticleAuthor";
import ArticleComments from "../components/article/ArticleComments";
import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorAlert from "../components/common/ErrorAlert";

const ArticlePage = () => {
  const { slug } = useParams();
  const { data: article, loading, error } = useArticleBySlug(slug);

  // Loading state
  if (loading) {
    return <LoadingSpinner message="Loading article..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorAlert
        title="Error Loading Article"
        message={error.message || "Failed to load article. Please try again."}
        actionButton={{
          text: "Back to Articles",
          to: "/articles",
        }}
      />
    );
  }

  // Not found state
  if (!article) {
    return (
      <ErrorAlert
        title="Article Not Found"
        message="The article you're looking for doesn't exist or has been removed."
        variant="warning"
        actionButton={{
          text: "Browse Articles",
          to: "/articles",
        }}
      />
    );
  }

  return (
    <div className="article-page">
      <ArticleHeader article={article} />
      <ArticleContent article={article} />
      <ArticleAuthor article={article} />
      <ArticleComments article={article} />
    </div>
  );
};

export default ArticlePage;
