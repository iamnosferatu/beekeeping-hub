// frontend/src/services/api/comments.js
/**
 * Comments API Service
 *
 * Handles all comment-related API calls including nested comment support
 */

import { apiClient } from "./client";

export const comments = {
  /**
   * Get all comments with optional filters
   * @param {Object} params - Query parameters (page, limit, status, etc.)
   * @returns {Promise} API response
   */
  getAll: async (params = {}) => {
    try {
      const response = await apiClient.get("/comments", { params });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get comments for a specific article
   * @param {number} articleId - Article ID
   * @param {Object} params - Query parameters (sort, status, etc.)
   * @returns {Promise} API response
   */
  getByArticle: async (articleId, params = {}) => {
    try {
      const response = await apiClient.get(`/articles/${articleId}/comments`, {
        params,
      });

      // If the above fails, try alternative endpoint
      if (!response.data) {
        const alternativeResponse = await apiClient.get("/comments", {
          params: { ...params, article_id: articleId },
        });
        return {
          success: true,
          data: alternativeResponse.data.data || alternativeResponse.data,
        };
      }

      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      // Try fallback endpoint
      try {
        const fallbackResponse = await apiClient.get("/comments", {
          params: { ...params, article_id: articleId },
        });
        return {
          success: true,
          data: fallbackResponse.data.data || fallbackResponse.data,
        };
      } catch (fallbackError) {
        return handleError(error);
      }
    }
  },

  /**
   * Get a single comment by ID
   * @param {number} id - Comment ID
   * @returns {Promise} API response
   */
  getById: async (id) => {
    try {
      const response = await apiClient.get(`/comments/${id}`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Create a new comment
   * @param {Object} data - Comment data (article_id, content, parent_id)
   * @returns {Promise} API response
   */
  create: async (data) => {
    try {
      const response = await apiClient.post("/comments", data);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update a comment
   * @param {number} id - Comment ID
   * @param {Object} data - Updated comment data
   * @returns {Promise} API response
   */
  update: async (id, data) => {
    try {
      const response = await apiClient.put(`/comments/${id}`, data);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Delete a comment
   * @param {number} id - Comment ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    try {
      const response = await apiClient.delete(`/comments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Update comment status (admin only)
   * @param {number} id - Comment ID
   * @param {string} status - New status (approved, rejected, pending)
   * @returns {Promise} API response
   */
  updateStatus: async (id, status) => {
    try {
      const response = await apiClient.put(`/admin/comments/${id}/status`, {
        status,
      });
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Vote on a comment
   * @param {number} id - Comment ID
   * @param {Object} data - Vote data ({ type: 'up' | 'down' })
   * @returns {Promise} API response
   */
  vote: async (id, data) => {
    try {
      const response = await apiClient.post(`/comments/${id}/vote`, data);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Report a comment
   * @param {number} id - Comment ID
   * @param {Object} data - Report data ({ reason: string })
   * @returns {Promise} API response
   */
  report: async (id, data) => {
    try {
      const response = await apiClient.post(`/comments/${id}/report`, data);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Get comment thread (comment with all nested replies)
   * @param {number} id - Root comment ID
   * @returns {Promise} API response
   */
  getThread: async (id) => {
    try {
      const response = await apiClient.get(`/comments/${id}/thread`);
      return { success: true, data: response.data.data || response.data };
    } catch (error) {
      return handleError(error);
    }
  },
};

/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
const handleError = (error) => {
  console.error("Comments API Error:", error);

  return {
    success: false,
    error: {
      message:
        error.response?.data?.message || error.message || "An error occurred",
      status: error.response?.status,
      type: error.response?.data?.type || "API_ERROR",
      details: error.response?.data,
    },
  };
};
