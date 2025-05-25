// frontend/src/utils/formatters.js

import moment from "moment";
import { ARTICLE_CONFIG } from "../constants/ui";

/**
 * Formatting Utilities
 * Pure functions for formatting data consistently across the application
 */

/**
 * Format author name with fallback handling
 * @param {Object} author - Author object
 * @returns {string} Formatted author name
 */
export const formatAuthorName = (author) => {
  if (!author) return "Unknown Author";

  const fullName = `${author.first_name || ""} ${
    author.last_name || ""
  }`.trim();
  return fullName || author.username || "Unknown Author";
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @param {string} format - Moment.js format string
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = ARTICLE_CONFIG.DATE_FORMAT) => {
  if (!date) return "Draft";
  return moment(date).format(format);
};

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return "Unknown";
  return moment(date).fromNow();
};

/**
 * Format number with fallback
 * @param {number} value - Number to format
 * @param {number} fallback - Fallback value
 * @returns {number} Formatted number
 */
export const formatCount = (value, fallback = 0) => {
  return typeof value === "number" ? value : fallback;
};

/**
 * Format large numbers (e.g., 1.2K, 5.3M)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatLargeNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (
  text,
  maxLength = ARTICLE_CONFIG.EXCERPT_LENGTH
) => {
  if (!text || text.length <= maxLength) return text || "";
  return text.substring(0, maxLength).trim() + "...";
};
