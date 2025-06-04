// frontend/src/services/api.js - Enhanced with Request Deduplication
import axios from "axios";
import { API_URL, TOKEN_NAME } from "../config";
// Removed smartRequest - using direct axios calls for better React Query compatibility
import PerformanceMonitor from "../utils/performanceMonitoring";

/**
 * Enhanced API service with comprehensive error handling, retry mechanisms,
 * and monitoring similar to backend error handling patterns
 */
class ApiService {
  constructor() {
    // Create axios instance with default configuration
    this.client = axios.create({
      baseURL: API_URL,
      timeout: 15000, // Increased timeout to 15 seconds
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Performance tracking
    this.requestTimers = new Map();
    this.requestCounts = new Map();

    // Setup request and response interceptors
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for requests and responses
   */
  setupInterceptors() {
    // Request interceptor - Add auth token and start performance tracking
    this.client.interceptors.request.use(
      (config) => {
        // Check both localStorage and sessionStorage for token
        const token = localStorage.getItem(TOKEN_NAME) || sessionStorage.getItem(TOKEN_NAME);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Start performance tracking
        const requestId = this.generateRequestId();
        config.metadata = {
          requestId,
          startTime: performance.now(),
          url: config.url,
          method: config.method?.toUpperCase() || 'GET',
        };
        
        this.requestTimers.set(requestId, config.metadata);
        
        // Track request count
        const endpoint = `${config.method?.toUpperCase() || 'GET'} ${config.url}`;
        this.requestCounts.set(endpoint, (this.requestCounts.get(endpoint) || 0) + 1);

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle common response patterns and track performance
    this.client.interceptors.response.use(
      (response) => {
        // Track successful response performance
        this.trackResponsePerformance(response.config, response.status, response.headers['content-length']);
        return response;
      },
      (error) => {
        // Track error response performance
        if (error.config) {
          this.trackResponsePerformance(error.config, error.response?.status || 0, null, error);
        }
        
        // Handle common error scenarios
        const customError = this.handleError(error);
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
        // Check if this is a login attempt
        const isLoginAttempt = error.config?.url === "/auth/login";
        
        if (isLoginAttempt) {
          // For login failures, return a more appropriate message
          return {
            type: "AUTH_ERROR",
            message: data?.message || "Invalid email or password. Please try again.",
            status,
            data,
          };
        }
        
        // For other 401 errors, treat as session expiration
        // Unauthorized - clear tokens from both storage locations 
        localStorage.removeItem(TOKEN_NAME);
        localStorage.removeItem(`${TOKEN_NAME}_remember`);
        sessionStorage.removeItem(TOKEN_NAME);
        
        // Only redirect to login if not on profile page (to prevent redirect loops)
        if (window.location.pathname !== "/login" && window.location.pathname !== "/profile") {
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
   * Generate unique request ID
   */
  generateRequestId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  /**
   * Track response performance
   */
  trackResponsePerformance(config, status, contentLength = null, error = null) {
    if (!config.metadata) return;

    const { requestId, startTime, method, url } = config.metadata;
    const duration = performance.now() - startTime;
    const endpoint = `${method} ${url}`;

    // Record API performance metric
    PerformanceMonitor.recordApi(method, url, duration, status, {
      requestId,
      contentLength: contentLength ? parseInt(contentLength) : null,
      success: !error && status >= 200 && status < 400,
      error: error?.message,
      retryCount: config.metadata.retryCount || 0,
      fromCache: config.metadata.fromCache || false,
      requestCount: this.requestCounts.get(endpoint) || 1,
    });

    // Clean up timer
    this.requestTimers.delete(requestId);

    // Log slow requests in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`🐌 Slow API request: ${endpoint} took ${duration.toFixed(0)}ms`);
    }
  }

  /**
   * Get API performance statistics
   */
  getApiPerformanceStats() {
    const analytics = PerformanceMonitor.getAnalytics();
    return {
      api: analytics.api || {},
      requestCounts: Object.fromEntries(this.requestCounts),
      activeRequests: this.requestTimers.size,
    };
  }

  /**
   * Clear API performance data
   */
  clearApiPerformanceData() {
    this.requestCounts.clear();
    this.requestTimers.clear();
  }

  /**
   * Generic request method with enhanced error handling
   * Simplified to work optimally with React Query caching
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
  // ARTICLE ENDPOINTS - FIXED
  // =============================================================================
  articles = {
    /**
     * Get all articles with optional filters
     */
    getAll: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const url = `/articles${queryString ? `?${queryString}` : ""}`;

      return await this.request({
        method: "GET",
        url: url,
      });
    },

    /**
     * Get article by numeric ID
     * Used for editing and admin functions
     */
    getById: async (id) => {
      return await this.request({
        method: "GET",
        url: `/articles/byId/${id}`,
      });
    },

    /**
     * Get article by URL slug
     * Used for public article viewing
     */
    getBySlug: async (slug) => {
      return await this.request({
        method: "GET",
        url: `/articles/${slug}`,
      });
    },

    /**
     * Create new article
     */
    create: async (articleData) => {
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
      return this.request({
        method: "DELETE",
        url: `/articles/${id}`,
      });
    },

    /**
     * Toggle article like
     */
    toggleLike: async (id) => {
      return this.request({
        method: "POST",
        url: `/articles/${id}/like`,
      });
    },

    /**
     * Get articles by current user
     */
    getMyArticles: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/author/articles${queryString ? `?${queryString}` : ""}`,
      });
    },

    /**
     * Get related articles
     */
    getRelated: async (id, limit = 5) => {
      return this.request({
        method: "GET",
        url: `/articles/${id}/related?limit=${limit}`,
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
  // TAGS ENDPOINTS
  // =============================================================================
  tags = {
    /**
     * Get all tags
     */
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/tags${queryString ? `?${queryString}` : ""}`,
      });
    },

    /**
     * Get popular tags (by article count)
     */
    getPopular: (limit = 20) => {
      return this.request({
        method: "GET",
        url: `/tags/popular?limit=${limit}`,
      });
    },

    /**
     * Get single tag by slug
     */
    getBySlug: (slug, params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/tags/${slug}${queryString ? `?${queryString}` : ""}`,
      });
    },

    /**
     * Create new tag (admin only)
     */
    create: (tagData) => {
      return this.request({
        method: "POST",
        url: "/tags",
        data: tagData,
      });
    },

    /**
     * Update tag (admin only)
     */
    update: (id, tagData) => {
      return this.request({
        method: "PUT",
        url: `/tags/${id}`,
        data: tagData,
      });
    },

    /**
     * Delete tag (admin only)
     */
    delete: (id) => {
      return this.request({
        method: "DELETE",
        url: `/tags/${id}`,
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
  // CONTACT ENDPOINTS
  // =============================================================================
  contact = {
    /**
     * Send a contact message
     */
    send: async (contactData) => {
      return this.request({
        method: "POST",
        url: "/contact",
        data: contactData,
      });
    },

    /**
     * Get contact messages (admin only)
     */
    getMessages: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/contact/messages${queryString ? `?${queryString}` : ""}`,
      });
    },

    /**
     * Mark message as read (admin only)
     */
    markAsRead: async (id) => {
      return this.request({
        method: "PUT",
        url: `/contact/messages/${id}/read`,
      });
    },

    /**
     * Delete contact message (admin only)
     */
    delete: async (id) => {
      return this.request({
        method: "DELETE",
        url: `/contact/messages/${id}`,
      });
    },
  };

  // =============================================================================
  // SITE SETTINGS ENDPOINTS
  // =============================================================================
  siteSettings = {
    /**
     * Get site settings
     */
    get: async () => {
      return this.request({
        method: "GET",
        url: "/site-settings",
      });
    },

    /**
     * Update site settings (admin only)
     */
    update: async (settings) => {
      return this.request({
        method: "PUT",
        url: "/site-settings",
        data: settings,
      });
    },
  };

  // =============================================================================
  // AUTHOR APPLICATIONS
  // =============================================================================

  authorApplications = {
    // Submit new author application
    submit: async (applicationData) => {
      return this.request({
        method: "POST",
        url: "/author-applications",
        data: applicationData,
      });
    },

    // Get current user's application status
    getMyApplication: async () => {
      return this.request({
        method: "GET",
        url: "/author-applications/my-application",
      });
    },

    // Check if user can apply for author status
    canApply: async () => {
      return this.request({
        method: "GET",
        url: "/author-applications/can-apply",
      });
    },
  };

  // =============================================================================
  // FORUM ENDPOINTS
  // =============================================================================
  forum = {
    // Categories
    categories: {
      getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request({
          method: "GET",
          url: `/forum/categories${queryString ? `?${queryString}` : ""}`,
        });
      },

      getBySlug: async (slug) => {
        return this.request({
          method: "GET",
          url: `/forum/categories/${slug}`,
        });
      },

      create: async (categoryData) => {
        return this.request({
          method: "POST",
          url: "/forum/categories",
          data: categoryData,
        });
      },

      update: async (id, categoryData) => {
        return this.request({
          method: "PUT",
          url: `/forum/categories/${id}`,
          data: categoryData,
        });
      },

      delete: async (id) => {
        return this.request({
          method: "DELETE",
          url: `/forum/categories/${id}`,
        });
      },
    },

    // Threads
    threads: {
      getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request({
          method: "GET",
          url: `/forum/threads${queryString ? `?${queryString}` : ""}`,
        });
      },

      getBySlug: async (slug) => {
        return this.request({
          method: "GET",
          url: `/forum/threads/${slug}`,
        });
      },

      getByCategorySlug: async (categorySlug, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request({
          method: "GET",
          url: `/forum/categories/${categorySlug}/threads${queryString ? `?${queryString}` : ""}`,
        });
      },

      create: async (threadData) => {
        return this.request({
          method: "POST",
          url: "/forum/threads",
          data: threadData,
        });
      },

      update: async (id, threadData) => {
        return this.request({
          method: "PUT",
          url: `/forum/threads/${id}`,
          data: threadData,
        });
      },

      delete: async (id) => {
        return this.request({
          method: "DELETE",
          url: `/forum/threads/${id}`,
        });
      },

      pin: async (id) => {
        return this.request({
          method: "PUT",
          url: `/forum/threads/${id}/pin`,
        });
      },

      unpin: async (id) => {
        return this.request({
          method: "PUT",
          url: `/forum/threads/${id}/unpin`,
        });
      },

      lock: async (id) => {
        return this.request({
          method: "PUT",
          url: `/forum/threads/${id}/lock`,
        });
      },

      unlock: async (id) => {
        return this.request({
          method: "PUT",
          url: `/forum/threads/${id}/unlock`,
        });
      },
    },

    // Comments
    comments: {
      getByThreadId: async (threadId, params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request({
          method: "GET",
          url: `/forum/threads/${threadId}/comments${queryString ? `?${queryString}` : ""}`,
        });
      },

      create: async (threadId, commentData) => {
        return this.request({
          method: "POST",
          url: `/forum/threads/${threadId}/comments`,
          data: commentData,
        });
      },

      update: async (commentId, commentData) => {
        return this.request({
          method: "PUT",
          url: `/forum/comments/${commentId}`,
          data: commentData,
        });
      },

      delete: async (commentId) => {
        return this.request({
          method: "DELETE",
          url: `/forum/comments/${commentId}`,
        });
      },

      report: async (commentId, reason) => {
        return this.request({
          method: "POST",
          url: `/forum/comments/${commentId}/report`,
          data: { reason },
        });
      },
    },

    // Admin functions
    admin: {
      banUser: async (userId, reason, expiresAt) => {
        return this.request({
          method: "POST",
          url: `/forum/admin/users/${userId}/ban`,
          data: { reason, expires_at: expiresAt },
        });
      },

      unbanUser: async (userId) => {
        return this.request({
          method: "DELETE",
          url: `/forum/admin/users/${userId}/ban`,
        });
      },

      getBannedUsers: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request({
          method: "GET",
          url: `/forum/admin/banned-users${queryString ? `?${queryString}` : ""}`,
        });
      },

      blockThread: async (threadId, reason) => {
        return this.request({
          method: "PUT",
          url: `/forum/admin/threads/${threadId}/block`,
          data: { reason },
        });
      },

      unblockThread: async (threadId) => {
        return this.request({
          method: "PUT",
          url: `/forum/admin/threads/${threadId}/unblock`,
        });
      },

      blockComment: async (commentId, reason) => {
        return this.request({
          method: "PUT",
          url: `/forum/admin/comments/${commentId}/block`,
          data: { reason },
        });
      },

      unblockComment: async (commentId) => {
        return this.request({
          method: "PUT",
          url: `/forum/admin/comments/${commentId}/unblock`,
        });
      },
    },
  };

  // =============================================================================
  // OTHER ENDPOINTS
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

    deleteUser: async (userId) => {
      return this.request({
        method: "DELETE",
        url: `/admin/users/${userId}`,
      });
    },

    getCommentsForModeration: async (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return this.request({
        method: "GET",
        url: `/admin/comments${queryString ? `?${queryString}` : ""}`,
      });
    },

    // Article management
    articles: {
      getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request({
          method: "GET",
          url: `/admin/articles${queryString ? `?${queryString}` : ""}`,
        });
      },

      block: async (articleId, reason) => {
        return this.request({
          method: "PUT",
          url: `/admin/articles/${articleId}/block`,
          data: { reason },
        });
      },

      unblock: async (articleId) => {
        return this.request({
          method: "PUT",
          url: `/admin/articles/${articleId}/unblock`,
        });
      },

      delete: async (articleId) => {
        return this.request({
          method: "DELETE",
          url: `/admin/articles/${articleId}`,
        });
      },
    },

    // Comment management
    comments: {
      updateStatus: async (commentId, status) => {
        return this.request({
          method: "PUT",
          url: `/admin/comments/${commentId}/status`,
          data: { status },
        });
      },

      delete: async (commentId) => {
        return this.request({
          method: "DELETE",
          url: `/admin/comments/${commentId}`,
        });
      },
    },

    // Tag management
    tags: {
      getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request({
          method: "GET",
          url: `/admin/tags${queryString ? `?${queryString}` : ""}`,
        });
      },

      create: async (tagData) => {
        return this.request({
          method: "POST",
          url: "/admin/tags",
          data: tagData,
        });
      },

      update: async (tagId, tagData) => {
        return this.request({
          method: "PUT",
          url: `/admin/tags/${tagId}`,
          data: tagData,
        });
      },

      delete: async (tagId) => {
        return this.request({
          method: "DELETE",
          url: `/admin/tags/${tagId}`,
        });
      },

      merge: async (sourceTagId, targetTagId) => {
        return this.request({
          method: "POST",
          url: `/admin/tags/${sourceTagId}/merge`,
          data: { targetTagId },
        });
      },
    },

    // Contact messages
    contactMessages: {
      getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request({
          method: "GET",
          url: `/admin/contact-messages${queryString ? `?${queryString}` : ""}`,
        });
      },

      markAsRead: async (messageId) => {
        return this.request({
          method: "PUT",
          url: `/admin/contact-messages/${messageId}/read`,
        });
      },

      delete: async (messageId) => {
        return this.request({
          method: "DELETE",
          url: `/admin/contact-messages/${messageId}`,
        });
      },
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

    // Author Applications Management
    authorApplications: {
      getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return this.request({
          method: "GET",
          url: `/author-applications/admin/all${queryString ? `?${queryString}` : ""}`,
        });
      },

      getPendingCount: async () => {
        return this.request({
          method: "GET",
          url: "/author-applications/admin/pending-count",
        });
      },

      getById: async (id) => {
        return this.request({
          method: "GET",
          url: `/author-applications/admin/${id}`,
        });
      },

      review: async (id, action, adminNotes = null) => {
        return this.request({
          method: "PUT",
          url: `/author-applications/admin/${id}/review`,
          data: {
            action,
            admin_notes: adminNotes,
          },
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
