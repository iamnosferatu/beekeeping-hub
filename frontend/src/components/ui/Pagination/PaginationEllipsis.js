// frontend/src/components/ui/Pagination/PaginationEllipsis.js
import React from "react";
import { Pagination } from "react-bootstrap";
import { ARIA_LABELS } from "../../../constants/ui";

/**
 * PaginationEllipsis Component
 * Ellipsis indicator for pagination
 */
const PaginationEllipsis = ({ disabled = false }) => (
  <Pagination.Ellipsis
    disabled={disabled}
    aria-label={ARIA_LABELS.PAGINATION.ELLIPSIS}
  />
);

export default PaginationEllipsis;
