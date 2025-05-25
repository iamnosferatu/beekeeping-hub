// frontend/src/utils/validators.js

/**
 * Validation Utilities
 * Pure functions for data validation
 */

/**
 * Validate pagination parameters
 * @param {number} page - Current page
 * @param {number} totalPages - Total pages
 * @returns {boolean} Is valid
 */
export const isValidPage = (page, totalPages) => {
  return Number.isInteger(page) && page >= 1 && page <= totalPages;
};

/**
 * Validate article object structure
 * @param {Object} article - Article object
 * @returns {boolean} Is valid article
 */
export const isValidArticle = (article) => {
  return (
    article &&
    typeof article === "object" &&
    article.id &&
    article.title &&
    article.slug
  );
};

/**
 * Validate pagination object structure
 * @param {Object} pagination - Pagination object
 * @returns {boolean} Is valid pagination
 */
export const isValidPagination = (pagination) => {
  return (
    pagination &&
    typeof pagination === "object" &&
    Number.isInteger(pagination.page) &&
    Number.isInteger(pagination.totalPages) &&
    pagination.page >= 1 &&
    pagination.totalPages >= 0
  );
};

/**
 * Check if error is client-side error
 * @param {Object} error - Error object
 * @returns {boolean} Is client error
 */
export const isClientError = (error) => {
  return error.status >= 400 && error.status < 500;
};

/**
 * Check if error is server-side error
 * @param {Object} error - Error object
 * @returns {boolean} Is server error
 */
export const isServerError = (error) => {
  return error.status >= 500;
};
