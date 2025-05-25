// frontend/src/components/ui/Pagination/PaginationSummary.js
import React from "react";

/**
 * PaginationSummary Component
 * Displays pagination summary information
 */
const PaginationSummary = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  className = "",
}) => {
  /**
   * Calculate display range
   */
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  /**
   * Format summary text
   */
  const getSummaryText = () => {
    if (totalItems === 0) {
      return "No items to display";
    }

    if (totalPages === 1) {
      return `Showing ${totalItems} item${totalItems !== 1 ? "s" : ""}`;
    }

    return `Showing ${startItem}-${endItem} of ${totalItems} items`;
  };

  return (
    <div className={`pagination-summary text-center text-muted ${className}`}>
      <small>{getSummaryText()}</small>
    </div>
  );
};

export default PaginationSummary;
