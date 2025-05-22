// frontend/src/services/api.js
import axios from "axios";
import { API_URL, TOKEN_NAME } from "../config";

/**
 * Centralized API service for all HTTP requests
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
            config.data
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
            response.data
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
            customError
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
   * Generic request method with error handling
   */
  async request(config) {
    try {
      const response = await this.client(config);
      return {
        success: true,
        data: response.data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error,
      };
    }
  }

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
  };

  // =============================================================================
  // ARTICLE ENDPOINTS
  // =============================================================================
  articles = {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/articles${queryString ? `?${queryString}` : ""}`,
      });
    },

    getById: async (id) => {
      return this.request({
        method: "GET",
        url: `/articles/byId/${id}`,
      });
    },

    getBySlug: async (slug) => {
      return this.request({
        method: "GET",
        url: `/articles/${slug}`,
      });
    },

    create: async (articleData) => {
      return this.request({
        method: "POST",
        url: "/articles",
        data: articleData,
      });
    },

    update: async (id, articleData) => {
      return this.request({
        method: "PUT",
        url: `/articles/${id}`,
        data: articleData,
      });
    },

    delete: async (id) => {
      return this.request({
        method: "DELETE",
        url: `/articles/${id}`,
      });
    },

    toggleLike: async (id) => {
      return this.request({
        method: "POST",
        url: `/articles/${id}/like`,
      });
    },

    // Get articles by current user
    getMyArticles: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/author/articles${queryString ? `?${queryString}` : ""}`,
      });
    },
  };

  // =============================================================================
  // COMMENT ENDPOINTS
  // =============================================================================
  comments = {
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/comments${queryString ? `?${queryString}` : ""}`,
      });
    },

    create: async (commentData) => {
      return this.request({
        method: "POST",
        url: "/comments",
        data: commentData,
      });
    },

    update: async (id, commentData) => {
      return this.request({
        method: "PUT",
        url: `/comments/${id}`,
        data: commentData,
      });
    },

    delete: async (id) => {
      return this.request({
        method: "DELETE",
        url: `/comments/${id}`,
      });
    },

    updateStatus: async (id, status) => {
      return this.request({
        method: "PUT",
        url: `/comments/${id}/status`,
        data: { status },
      });
    },
  };

  // =============================================================================
  // TAG ENDPOINTS
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

  // =============================================================================
  // ADMIN ENDPOINTS
  // =============================================================================
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
