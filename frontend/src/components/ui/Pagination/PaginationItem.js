// frontend/src/components/ui/Pagination/PaginationItem.js
import React from "react";
import { Pagination } from "react-bootstrap";

/**
 * PaginationItem Component
 * Individual pagination item with proper accessibility
 */
const PaginationItem = ({
  page,
  isActive = false,
  onClick,
  disabled = false,
  ariaLabel,
  variant = "page", // page, first, prev, next, last
}) => {
  /**
   * Handle keyboard navigation
   */
  const handleKeyPress = (event) => {
    if ((event.key === "Enter" || event.key === " ") && !disabled) {
      event.preventDefault();
      onClick();
    }
  };

  /**
   * Get the appropriate pagination component based on variant
   */
  const getPaginationComponent = () => {
    const commonProps = {
      onClick: disabled ? undefined : onClick,
      onKeyPress: disabled ? undefined : handleKeyPress,
      disabled,
      "aria-label": ariaLabel,
      tabIndex: disabled ? -1 : 0,
    };

    switch (variant) {
      case "first":
        return <Pagination.First {...commonProps} />;
      case "prev":
        return <Pagination.Prev {...commonProps} />;
      case "next":
        return <Pagination.Next {...commonProps} />;
      case "last":
        return <Pagination.Last {...commonProps} />;
      default:
        return (
          <Pagination.Item {...commonProps} active={isActive}>
            {page}
          </Pagination.Item>
        );
    }
  };

  return getPaginationComponent();
};

export default PaginationItem;
