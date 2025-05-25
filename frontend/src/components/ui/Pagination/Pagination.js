// frontend/src/components/ui/Pagination/Pagination.js
import React from "react";
import { Pagination as BootstrapPagination } from "react-bootstrap";
import { usePagination } from "../../../hooks/usePagination";
import { ARIA_LABELS } from "../../../constants/ui";

/**
 * Pagination Component
 *
 * A reusable pagination component that handles page navigation
 * with proper accessibility and responsive design.
 */
const Pagination = ({
  totalItems,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  maxVisiblePages = 5,
  showFirstLast = true,
  showPrevNext = true,
  className = "",
  ...props
}) => {
  // ALWAYS call hooks at the top level - never conditionally
  const {
    totalPages,
    visiblePageNumbers,
    hasNextPage,
    hasPreviousPage,
    isFirstPage,
    isLastPage,
  } = usePagination({
    totalItems,
    initialPage: currentPage,
    initialPageSize: pageSize,
    maxVisiblePages,
  });

  // Early returns AFTER all hooks have been called
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  /**
   * Handle page change with validation
   */
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyPress = (event, page) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePageChange(page);
    }
  };

  /**
   * Generate page items for rendering
   */
  const renderPageItems = () => {
    const items = [];

    // Add page number buttons
    visiblePageNumbers.forEach((page, index) => {
      if (typeof page === "string" && page.startsWith("ellipsis")) {
        // Render ellipsis
        items.push(
          <BootstrapPagination.Ellipsis
            key={page}
            disabled
            title="More pages"
          />
        );
      } else {
        // Render page number
        items.push(
          <BootstrapPagination.Item
            key={page}
            active={page === currentPage}
            onClick={() => handlePageChange(page)}
            onKeyPress={(e) => handleKeyPress(e, page)}
            title={`Go to page ${page}`}
            aria-label={`Page ${page}${
              page === currentPage ? ", current page" : ""
            }`}
          >
            {page}
          </BootstrapPagination.Item>
        );
      }
    });

    return items;
  };

  return (
    <div className={`d-flex justify-content-center ${className}`} {...props}>
      <BootstrapPagination className="mb-0" aria-label={ARIA_LABELS.pagination}>
        {/* First Page Button */}
        {showFirstLast && (
          <BootstrapPagination.First
            onClick={() => handlePageChange(1)}
            disabled={isFirstPage}
            title={ARIA_LABELS.firstPage}
            aria-label={ARIA_LABELS.firstPage}
          />
        )}

        {/* Previous Page Button */}
        {showPrevNext && (
          <BootstrapPagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!hasPreviousPage}
            title={ARIA_LABELS.previousPage}
            aria-label={ARIA_LABELS.previousPage}
          />
        )}

        {/* Page Number Buttons */}
        {renderPageItems()}

        {/* Next Page Button */}
        {showPrevNext && (
          <BootstrapPagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!hasNextPage}
            title={ARIA_LABELS.nextPage}
            aria-label={ARIA_LABELS.nextPage}
          />
        )}

        {/* Last Page Button */}
        {showFirstLast && (
          <BootstrapPagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={isLastPage}
            title={ARIA_LABELS.lastPage}
            aria-label={ARIA_LABELS.lastPage}
          />
        )}
      </BootstrapPagination>
    </div>
  );
};

export default Pagination;
