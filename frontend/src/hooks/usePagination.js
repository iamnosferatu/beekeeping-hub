// frontend/src/hooks/usePagination.js
import { useState, useCallback, useMemo } from "react";
import { PAGINATION_CONFIG } from "../constants/ui";

/**
 * Custom hook for pagination logic
 *
 * Provides pagination state management and utilities for paginated data.
 * Includes functions for page navigation, size changes, and calculations.
 */
const usePagination = ({
  totalItems = 0,
  initialPage = 1,
  initialPageSize = PAGINATION_CONFIG.defaultPageSize,
  maxVisiblePages = PAGINATION_CONFIG.maxVisiblePages,
} = {}) => {
  // State management
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  /**
   * Calculate total pages based on total items and page size
   */
  const totalPages = useMemo(() => {
    return Math.ceil(totalItems / pageSize) || 1;
  }, [totalItems, pageSize]);

  /**
   * Calculate pagination info
   */
  const paginationInfo = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      startIndex,
      endIndex,
      currentPage,
      totalPages,
      pageSize,
      totalItems,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      isFirstPage: currentPage === 1,
      isLastPage: currentPage === totalPages,
    };
  }, [currentPage, totalPages, pageSize, totalItems]);

  /**
   * Generate array of page numbers for pagination display
   */
  const visiblePageNumbers = useMemo(() => {
    const pages = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      // Adjust start page if we're near the end
      const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

      for (let i = adjustedStartPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  }, [currentPage, totalPages, maxVisiblePages]);

  /**
   * Go to specific page
   */
  const goToPage = useCallback(
    (page) => {
      const targetPage = Math.max(1, Math.min(page, totalPages));
      setCurrentPage(targetPage);
      return targetPage;
    },
    [totalPages]
  );

  /**
   * Go to next page
   */
  const goToNextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      return goToPage(currentPage + 1);
    }
    return currentPage;
  }, [currentPage, goToPage, paginationInfo.hasNextPage]);

  /**
   * Go to previous page
   */
  const goToPreviousPage = useCallback(() => {
    if (paginationInfo.hasPreviousPage) {
      return goToPage(currentPage - 1);
    }
    return currentPage;
  }, [currentPage, goToPage, paginationInfo.hasPreviousPage]);

  /**
   * Go to first page
   */
  const goToFirstPage = useCallback(() => {
    return goToPage(1);
  }, [goToPage]);

  /**
   * Go to last page
   */
  const goToLastPage = useCallback(() => {
    return goToPage(totalPages);
  }, [goToPage, totalPages]);

  /**
   * Change page size and reset to first page
   */
  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  /**
   * Reset pagination to initial state
   */
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    // State
    currentPage,
    pageSize,
    totalPages,
    totalItems,

    // Calculated info
    ...paginationInfo,
    visiblePageNumbers,

    // Actions
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    reset,
  };
};

// Export both as default and named export
export default usePagination;
export { usePagination };
