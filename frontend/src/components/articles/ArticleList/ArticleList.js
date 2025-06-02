// frontend/src/components/articles/ArticleList/ArticleList.js
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useArticles } from "../../../hooks/queries/useArticles";
import useScrollToTop from "../../../hooks/useScrollToTop";
import { PAGINATION_CONFIG, LOADING_CONFIG } from "../../../constants/ui";
import ArticleCard from "../ArticleCard";
import Pagination from "../../ui/Pagination";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import ArticleGrid from "./ArticleGrid";
import { debugArticleListQuery, getArticlesDiagnostics } from "../../../utils/articlesDebug";
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

  // Build params for React Query (memoized)
  const params = useMemo(() => ({
    page,
    limit,
    ...(tag && { tag }),
    ...(search && { search }),
  }), [page, limit, tag, search]);

  // Fetch articles with React Query hook
  const {
    data: response,
    isLoading,
    error,
    refetch,
    isFetching,
    isError,
  } = useArticles(params);

  // Extract articles and pagination from response (memoized)
  // Handle different response structures from the API
  const articles = useMemo(() => {
    if (!response) return [];
    
    // If response.data is an array, use it directly
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    // If response.data has articles property
    if (response.data?.articles) {
      return response.data.articles;
    }
    
    // If response has articles property directly
    if (response.articles) {
      return response.articles;
    }
    
    // Fallback to empty array
    return [];
  }, [response]);
  
  const pagination = useMemo(() => {
    const total = response?.data?.total || response?.data?.count || response?.count || response?.total || 0;
    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }, [page, limit, response]);

  // Debug logging in development (only on error states) - TEMPORARILY DISABLED
  // useEffect(() => {
  //   if (process.env.NODE_ENV === 'development') {
  //     // Only log when there are actual issues
  //     if (isError || (articles.length === 0 && !isLoading && !isFetching)) {
  //       console.log('📋 ArticleList issue:', {
  //         isLoading,
  //         isFetching,
  //         isError,
  //         hasResponse: !!response,
  //         responseKeys: response ? Object.keys(response) : 'no response',
  //         articlesLength: articles.length,
  //         error: error?.message
  //       });
        
  //       // Get diagnostics only when there are issues
  //       const diagnostics = getArticlesDiagnostics();
  //       console.log('🔍 Articles diagnostics:', diagnostics);
        
  //       // Debug cache state only when there's an issue
  //       debugArticleListQuery(params);
  //     }
  //   }
  // }, [isLoading, isFetching, isError, response, articles.length, error, params]);

  /**
   * Handle page change with scroll to top (memoized)
   * @param {number} newPage - The page to navigate to
   */
  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    scrollToTop();
  }, [scrollToTop]);

  /**
   * Handle retry action (memoized)
   */
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

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
