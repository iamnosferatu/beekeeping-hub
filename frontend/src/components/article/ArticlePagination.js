// frontend/src/components/articles/ArticlePagination.js
import React from "react";
import { Pagination } from "react-bootstrap";

/**
 * ArticlePagination Component
 *
 * A reusable pagination component that handles page navigation
 * with proper accessibility and responsive design.
 *
 * Features:
 * - First/Last page buttons
 * - Previous/Next navigation
 * - Smart page number display (shows ellipsis for large page counts)
 * - Keyboard accessible
 *
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {Function} onPageChange - Callback function when page changes
 * @param {string} className - Additional CSS classes
 */
const ArticlePagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  /**
   * Generate array of page numbers to display
   * Shows smart pagination with ellipsis for large page counts
   * @returns {Array} Array of page numbers and ellipsis indicators
   */
  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5; // Maximum number of page buttons to show

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination with ellipsis
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      // Always show first page
      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) {
          pages.push("ellipsis-start");
        }
      }

      // Show pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Always show last page
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          pages.push("ellipsis-end");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  /**
   * Handle page change with validation
   * @param {number} page - Page number to navigate to
   */
  const handlePageChange = (page) => {
    // Validate page number
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  /**
   * Handle keyboard navigation
   * @param {KeyboardEvent} event - Keyboard event
   * @param {number} page - Page number
   */
  const handleKeyPress = (event, page) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handlePageChange(page);
    }
  };

  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = generatePageNumbers();

  return (
    <div className={`d-flex justify-content-center ${className}`}>
      <Pagination className="mb-0">
        {/* First Page Button */}
        <Pagination.First
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          title="Go to first page"
        />

        {/* Previous Page Button */}
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Go to previous page"
        />

        {/* Page Number Buttons */}
        {pageNumbers.map((page, index) => {
          if (typeof page === "string" && page.startsWith("ellipsis")) {
            return (
              <Pagination.Ellipsis key={page} disabled title="More pages" />
            );
          }

          return (
            <Pagination.Item
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
            </Pagination.Item>
          );
        })}

        {/* Next Page Button */}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Go to next page"
        />

        {/* Last Page Button */}
        <Pagination.Last
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          title="Go to last page"
        />
      </Pagination>
    </div>
  );
};

export default ArticlePagination;
