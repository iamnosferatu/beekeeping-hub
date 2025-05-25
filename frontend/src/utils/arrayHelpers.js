// frontend/src/utils/arrayHelpers.js
/**
 * Array Utility Functions
 * Helper functions for working with arrays safely
 */

/**
 * Safely get array length
 * @param {Array} arr - Array to check
 * @returns {number} Array length or 0
 */
export const getArrayLength = (arr) => {
  return Array.isArray(arr) ? arr.length : 0;
};

/**
 * Check if array is not empty
 * @param {Array} arr - Array to check
 * @returns {boolean} Is not empty
 */
export const isNotEmpty = (arr) => {
  return Array.isArray(arr) && arr.length > 0;
};

/**
 * Safely get first item from array
 * @param {Array} arr - Array to check
 * @returns {*} First item or null
 */
export const getFirstItem = (arr) => {
  return isNotEmpty(arr) ? arr[0] : null;
};

/**
 * Create range array
 * @param {number} start - Start number
 * @param {number} end - End number
 * @returns {Array} Range array
 */
export const createRange = (start, end) => {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

/**
 * Chunk array into smaller arrays
 * @param {Array} arr - Array to chunk
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
export const chunkArray = (arr, size) => {
  if (!Array.isArray(arr)) return [];

  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};
