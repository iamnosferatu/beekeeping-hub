// frontend/src/components/articles/ArticleList.js
import React from "react";
import { Alert, Spinner } from "react-bootstrap";
import { useArticles } from "../../hooks/api/useArticles";
import ArticleCard from "./ArticleCard";
import ArticlePagination from "./ArticlePagination";
import ArticleListEmpty from "./ArticleListEmpty";
import ArticleListError from "./ArticleListError";
import "./ArticleList.scss";

/**
 * ArticleList Component
 *
 * Displays a paginated list of articles with loading states, error handling,
 * and empty states. Supports filtering by tags and search terms.
 *
 * @param {string} tag - Filter articles by tag slug
 * @param {string} search - Search term to filter articles
 * @param {number} limit - Number of articles per page (default: 10)
 */
const ArticleList = ({ tag, search, limit = 10 }) => {
  // Use the articles API hook with filters
  const {
    data: articles,
    loading,
    error,
    pagination,
    changePage,
  } = useArticles(
    {
      tag,
      search,
      limit,
    },
    {
      // Don't use fallback - we want to see real errors
      useFallback: false,
      onError: (error) => {
        console.error("Error fetching articles:", error);
      },
    }
  );

  /**
   * Handle page change and scroll to top
   * @param {number} newPage - The page number to navigate to
   */
  const handlePageChange = (newPage) => {
    changePage(newPage);
    // Smooth scroll to top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Loading state - show spinner while fetching data
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading articles...</span>
        </Spinner>
        <p className="mt-3 text-muted">Loading articles...</p>
      </div>
    );
  }

  // Error state - show error message with retry option
  if (error) {
    return <ArticleListError error={error} search={search} tag={tag} />;
  }

  // Empty state - no articles found
  if (!articles || articles.length === 0) {
    return <ArticleListEmpty search={search} tag={tag} />;
  }

  return (
    <div className="article-list">
      {/* Articles Grid */}
      <div className="articles-container">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination Component */}
      {pagination && pagination.totalPages > 1 && (
        <ArticlePagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
          className="mt-4"
        />
      )}

      {/* Results Summary */}
      {pagination && (
        <div className="text-center mt-3 text-muted">
          <small>
            Showing {articles.length} of {pagination.total} articles
            {search && ` for "${search}"`}
            {tag && ` tagged with "${tag}"`}
          </small>
        </div>
      )}
    </div>
  );
};

export default ArticleList;