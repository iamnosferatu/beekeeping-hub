// frontend/src/services/api.js - DEBUG VERSION
import axios from "axios";
import { API_URL, TOKEN_NAME } from "../config";

/**
 * Centralized API service for all HTTP requests - WITH DEBUGGING
 */
class ApiService {
  constructor() {
    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Setup request and response interceptors
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for requests and responses
   */
  setupInterceptors() {
    // Request interceptor - Add auth token automatically
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_NAME);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
            {
              baseURL: config.baseURL,
              fullURL: `${config.baseURL}${config.url}`,
              data: config.data,
              params: config.params,
            }
          );
        }

        return config;
      },
      (error) => {
        console.error("Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle common response patterns
    this.client.interceptors.response.use(
      (response) => {
        // Log responses in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            `✅ API Response: ${response.config.method?.toUpperCase()} ${
              response.config.url
            }`,
            {
              status: response.status,
              data: response.data,
              headers: response.headers,
            }
          );
        }

        return response;
      },
      (error) => {
        // Handle common error scenarios
        const customError = this.handleError(error);

        // Log errors in development
        if (process.env.NODE_ENV === "development") {
          console.error(
            `❌ API Error: ${error.config?.method?.toUpperCase()} ${
              error.config?.url
            }`,
            {
              error: customError,
              originalError: error,
              response: error.response?.data,
              status: error.response?.status,
            }
          );
        }

        return Promise.reject(customError);
      }
    );
  }

  /**
   * Centralized error handling
   */
  handleError(error) {
    // Network or timeout errors
    if (!error.response) {
      return {
        type: "NETWORK_ERROR",
        message: "Network error. Please check your connection.",
        originalError: error,
      };
    }

    const { status, data } = error.response;

    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem(TOKEN_NAME);
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        return {
          type: "AUTH_ERROR",
          message: "Your session has expired. Please log in again.",
          status,
          data,
        };

      case 403:
        return {
          type: "PERMISSION_ERROR",
          message: "You don't have permission to perform this action.",
          status,
          data,
        };

      case 404:
        return {
          type: "NOT_FOUND_ERROR",
          message: "The requested resource was not found.",
          status,
          data,
        };

      case 422:
        return {
          type: "VALIDATION_ERROR",
          message: "Please check your input and try again.",
          status,
          data,
          errors: data.errors || [],
        };

      case 429:
        return {
          type: "RATE_LIMIT_ERROR",
          message: "Too many requests. Please try again later.",
          status,
          data,
        };

      case 500:
        return {
          type: "SERVER_ERROR",
          message: "Server error. Please try again later.",
          status,
          data,
        };

      default:
        return {
          type: "UNKNOWN_ERROR",
          message: data.message || "An unexpected error occurred.",
          status,
          data,
        };
    }
  }

  /**
   * Generic request method with enhanced error handling and debugging
   */
  async request(config) {
    try {
      console.log("🔄 ApiService.request called with config:", config);

      const response = await this.client(config);

      console.log("✅ ApiService.request successful:", {
        status: response.status,
        data: response.data,
        config: config,
      });

      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      console.error("❌ ApiService.request failed:", {
        error,
        config,
        response: error.response?.data,
        status: error.response?.status,
      });

      return {
        success: false,
        error,
      };
    }
  }

  // =============================================================================
  // ARTICLE ENDPOINTS - FIXED
  // =============================================================================
  articles = {
    /**
     * Get all articles with optional filters
     */
    getAll: async (params = {}) => {
      console.log("📚 articles.getAll called with params:", params);

      const queryString = new URLSearchParams(params).toString();
      const url = `/articles${queryString ? `?${queryString}` : ""}`;

      console.log("📚 articles.getAll making request to:", url);

      const result = await this.request({
        method: "GET",
        url: url,
      });

      console.log("📚 articles.getAll result:", result);
      return result;
    },

    /**
     * Get article by numeric ID
     * Used for editing and admin functions
     */
    getById: async (id) => {
      console.log("📄 articles.getById called with id:", id);

      // Ensure we're using the correct endpoint for ID-based fetching
      const result = await this.request({
        method: "GET",
        url: `/articles/byId/${id}`, // Explicit ID endpoint
      });

      console.log("📄 articles.getById result:", result);
      return result;
    },

    /**
     * Get article by URL slug
     * Used for public article viewing
     */
    getBySlug: async (slug) => {
      console.log("📄 articles.getBySlug called with slug:", slug);

      // The backend route is /articles/:slug not /articles/bySlug/:slug
      const result = await this.request({
        method: "GET",
        url: `/articles/${slug}`,
      });

      console.log("📄 articles.getBySlug result:", result);
      return result;
    },

    /**
     * Create new article
     */
    create: async (articleData) => {
      console.log("✏️ articles.create called with data:", articleData);

      return this.request({
        method: "POST",
        url: "/articles",
        data: articleData,
      });
    },

    /**
     * Update existing article
     */
    update: async (id, articleData) => {
      console.log(
        "📝 articles.update called with id:",
        id,
        "data:",
        articleData
      );

      return this.request({
        method: "PUT",
        url: `/articles/${id}`,
        data: articleData,
      });
    },

    /**
     * Delete article
     */
    delete: async (id) => {
      console.log("🗑️ articles.delete called with id:", id);

      return this.request({
        method: "DELETE",
        url: `/articles/${id}`,
      });
    },

    /**
     * Toggle article like
     */
    toggleLike: async (id) => {
      console.log("❤️ articles.toggleLike called with id:", id);

      return this.request({
        method: "POST",
        url: `/articles/${id}/like`,
      });
    },

    /**
     * Get articles by current user
     */
    getMyArticles: async (params = {}) => {
      console.log("👤 articles.getMyArticles called with params:", params);

      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/author/articles${queryString ? `?${queryString}` : ""}`,
      });
    },
  };

  // =============================================================================
  // AUTH ENDPOINTS
  // =============================================================================
  auth = {
    login: async (credentials) => {
      return this.request({
        method: "POST",
        url: "/auth/login",
        data: credentials,
      });
    },

    register: async (userData) => {
      return this.request({
        method: "POST",
        url: "/auth/register",
        data: userData,
      });
    },

    getProfile: async () => {
      return this.request({
        method: "GET",
        url: "/auth/me",
      });
    },

    updateProfile: async (userData) => {
      return this.request({
        method: "PUT",
        url: "/auth/profile",
        data: userData,
      });
    },

    changePassword: async (passwordData) => {
      return this.request({
        method: "PUT",
        url: "/auth/password",
        data: passwordData,
      });
    },

    uploadAvatar: async (file) => {
      const formData = new FormData();
      formData.append("avatar", file);

      return this.request({
        method: "POST",
        url: "/auth/avatar",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },

    deleteAvatar: async () => {
      return this.request({
        method: "DELETE",
        url: "/auth/avatar",
      });
    },
  };

  // =============================================================================
  // Newsletter ENDPOINTS
  // =============================================================================
  newsletter = {
    /**
     * Subscribe to newsletter
     */
    subscribe: async (email) => {
      const response = await this.request({
        method: "POST",
        url: "/newsletter/subscribe",
        data: { email },
      });
      
      // Extract the actual data from the wrapped response
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error?.message || "Failed to subscribe");
    },

    /**
     * Unsubscribe from newsletter
     */
    unsubscribe: async (token) => {
      const response = await this.request({
        method: "GET",
        url: `/newsletter/unsubscribe/${token}`,
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error?.message || "Failed to unsubscribe");
    },

    /**
     * Check subscription status
     */
    checkStatus: async (email) => {
      const response = await this.request({
        method: "GET",
        url: `/newsletter/status/${encodeURIComponent(email)}`,
      });
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error?.message || "Failed to check status");
    },

    /**
     * Get subscribers (admin only)
     */
    getSubscribers: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await this.request({
        method: "GET",
        url: `/newsletter/subscribers${queryString ? `?${queryString}` : ""}`,
      });
      
      // Extract the actual data from the wrapped response
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error(response.error?.message || "Failed to fetch subscribers");
    },

    /**
     * Export subscribers (admin only)
     */
    exportSubscribers: async (status = "active") => {
      const response = await this.client({
        method: "GET",
        url: `/newsletter/export?status=${status}`,
        responseType: "blob",
      });
      
      return response.data;
    },
  };

  // =============================================================================
  // Comment ENDPOINTS
  // =============================================================================
  comments = {
    /**
     * Get all comments with optional filters
     */
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/comments${queryString ? `?${queryString}` : ""}`,
      });
    },

    /**
     * Get comments for a specific article
     */
    getByArticle: async (articleId) => {
      return this.request({
        method: "GET",
        url: `/articles/${articleId}/comments`,
      });
    },

    /**
     * Create a new comment
     */
    create: async (commentData) => {
      console.log("💬 comments.create called with data:", commentData);

      return this.request({
        method: "POST",
        url: "/comments",
        data: commentData,
      });
    },

    /**
     * Update an existing comment
     */
    update: async (id, commentData) => {
      return this.request({
        method: "PUT",
        url: `/comments/${id}`,
        data: commentData,
      });
    },

    /**
     * Delete a comment
     */
    delete: async (id) => {
      return this.request({
        method: "DELETE",
        url: `/comments/${id}`,
      });
    },

    /**
     * Update comment status (admin only)
     */
    updateStatus: async (id, status) => {
      return this.request({
        method: "PUT",
        url: `/comments/${id}/status`,
        data: { status },
      });
    },

    /**
     * Report a comment
     */
    report: async (id, reason) => {
      return this.request({
        method: "POST",
        url: `/comments/${id}/report`,
        data: { reason },
      });
    },

    /**
     * Get replies for a comment
     */
    getReplies: async (commentId) => {
      return this.request({
        method: "GET",
        url: `/comments/${commentId}/replies`,
      });
    },

    /**
     * Create a reply to a comment
     */
    createReply: async (parentCommentId, replyData) => {
      return this.request({
        method: "POST",
        url: `/comments/${parentCommentId}/replies`,
        data: replyData,
      });
    },
  };
  
  // =============================================================================
  // LIKES ENDPOINTS
  // =============================================================================
  likes = {
    /**
     * Toggle like on an article
     */
    toggleLike: async (articleId) => {
      return this.request({
        method: "POST",
        url: `/likes/articles/${articleId}/toggle`,
      });
    },

    /**
     * Get like status for a specific article
     */
    getLikeStatus: async (articleId) => {
      return this.request({
        method: "GET",
        url: `/likes/articles/${articleId}/status`,
      });
    },

    /**
     * Get all articles liked by the current user
     */
    getUserLikedArticles: async (page = 1, limit = 10) => {
      const params = new URLSearchParams({ page, limit }).toString();
      return this.request({
        method: "GET",
        url: `/likes/user/liked-articles?${params}`,
      });
    },

    /**
     * Get users who liked a specific article
     */
    getArticleLikers: async (articleId, page = 1, limit = 20) => {
      const params = new URLSearchParams({ page, limit }).toString();
      return this.request({
        method: "GET",
        url: `/likes/articles/${articleId}/likers?${params}`,
      });
    },
  };

  // =============================================================================
  // OTHER ENDPOINTS
  // =============================================================================

  tags = {
    getAll: async () => {
      return this.request({
        method: "GET",
        url: "/tags",
      });
    },

    getBySlug: async (slug) => {
      return this.request({
        method: "GET",
        url: `/tags/${slug}`,
      });
    },

    create: async (tagData) => {
      return this.request({
        method: "POST",
        url: "/tags",
        data: tagData,
      });
    },
  };

  admin = {
    getDashboardStats: async () => {
      return this.request({
        method: "GET",
        url: "/admin/dashboard",
      });
    },

    getUsers: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/admin/users${queryString ? `?${queryString}` : ""}`,
      });
    },

    updateUserRole: async (userId, role) => {
      return this.request({
        method: "PUT",
        url: `/admin/users/${userId}/role`,
        data: { role },
      });
    },

    getCommentsForModeration: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/admin/comments${queryString ? `?${queryString}` : ""}`,
      });
    },

    // Diagnostics endpoints
    diagnostics: {
      getSystemInfo: async () => {
        return this.request({
          method: "GET",
          url: "/admin/diagnostics/system",
        });
      },

      getLogs: async () => {
        return this.request({
          method: "GET",
          url: "/admin/diagnostics/logs",
        });
      },

      getMetrics: async () => {
        return this.request({
          method: "GET",
          url: "/admin/diagnostics/metrics",
        });
      },

      getDatabaseInfo: async () => {
        return this.request({
          method: "GET",
          url: "/admin/diagnostics/database",
        });
      },
    },
  };

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Check if API is available
   */
  async checkHealth() {
    return this.request({
      method: "GET",
      url: "/health",
    });
  }

  /**
   * Upload file (if needed in the future)
   */
  async uploadFile(file, onProgress = null) {
    const formData = new FormData();
    formData.append("file", file);

    return this.request({
      method: "POST",
      url: "/upload",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: onProgress,
    });
  }
}

// Create and export a single instance
const apiService = new ApiService();
export default apiService;
