// frontend/src/components/articles/ArticleList/ArticleList.js
import React, { useState } from "react";
import { useArticles } from "../../../hooks/queries/useArticles";
import useScrollToTop from "../../../hooks/useScrollToTop";
import { PAGINATION_CONFIG, LOADING_CONFIG } from "../../../constants/ui";
import ArticleCard from "../ArticleCard";
import Pagination from "../../ui/Pagination";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import ArticleGrid from "./ArticleGrid";
import "./ArticleList.scss";

/**
 * ArticleList Component
 *
 * A comprehensive article listing component with:
 * - Pagination support
 * - Loading states
 * - Error handling
 * - Empty states
 * - Search and filtering
 * - Responsive grid layout
 *
 * @param {Object} props - Component props
 * @param {string} props.tag - Filter articles by tag slug
 * @param {string} props.search - Search term for filtering
 * @param {number} props.limit - Articles per page
 * @param {boolean} props.showPagination - Show pagination controls
 * @param {boolean} props.showSummary - Show results summary
 * @param {string} props.layout - Layout type (grid, list, compact)
 * @param {Object} props.cardOptions - Options for article cards
 * @param {string} props.className - Additional CSS classes
 */
const ArticleList = ({
  tag,
  search,
  limit = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  showPagination = true,
  showSummary = false,
  layout = "compact",
  cardOptions = {},
  className = "",
}) => {
  const { scrollToTop } = useScrollToTop();
  const [page, setPage] = useState(1);

  // Build params for React Query
  const params = {
    page,
    limit,
    ...(tag && { tag }),
    ...(search && { search }),
  };

  // Fetch articles with React Query hook
  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useArticles(params);

  // Extract articles and pagination from response
  const articles = response?.articles || response?.data || [];
  const pagination = {
    page,
    limit,
    total: response?.count || response?.total || 0,
    totalPages: Math.ceil((response?.count || response?.total || 0) / limit),
  };

  /**
   * Handle page change with scroll to top
   * @param {number} newPage - The page to navigate to
   */
  const handlePageChange = (newPage) => {
    setPage(newPage);
    scrollToTop();
  };

  /**
   * Handle retry action
   */
  const handleRetry = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <LoadingState
        count={LOADING_CONFIG.SKELETON_ITEMS}
        layout={layout}
        className={className}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        search={search}
        tag={tag}
        onRetry={handleRetry}
        className={className}
      />
    );
  }

  // Empty state
  if (!articles || articles.length === 0) {
    return <EmptyState search={search} tag={tag} className={className} />;
  }

  return (
    <div className={`article-list article-list--${layout} ${className}`}>
      {/* Articles Grid/List */}
      <ArticleGrid layout={layout}>
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} {...cardOptions} />
        ))}
      </ArticleGrid>

      {/* Pagination */}
      {showPagination && pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit || limit}
          onPageChange={handlePageChange}
          showSummary={showSummary}
          className="mt-4"
        />
      )}

      {/* Results Summary (if pagination is hidden) */}
      {!showPagination && showSummary && pagination && (
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
