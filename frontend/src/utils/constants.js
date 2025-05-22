// frontend/src/utils/constants.js - CENTRALIZED CONSTANTS
export const USER_ROLES = {
  USER: "user",
  AUTHOR: "author",
  ADMIN: "admin",
};

export const ARTICLE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  ARCHIVED: "archived",
};

export const COMMENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    PROFILE: "/auth/me",
    UPDATE_PROFILE: "/auth/profile",
    CHANGE_PASSWORD: "/auth/password",
  },
  ARTICLES: {
    LIST: "/articles",
    BY_ID: (id) => `/articles/byId/${id}`,
    BY_SLUG: (slug) => `/articles/${slug}`,
    CREATE: "/articles",
    UPDATE: (id) => `/articles/${id}`,
    DELETE: (id) => `/articles/${id}`,
    LIKE: (id) => `/articles/${id}/like`,
  },
  COMMENTS: {
    LIST: "/comments",
    CREATE: "/comments",
    UPDATE: (id) => `/comments/${id}`,
    DELETE: (id) => `/comments/${id}`,
    UPDATE_STATUS: (id) => `/comments/${id}/status`,
  },
  TAGS: {
    LIST: "/tags",
    BY_SLUG: (slug) => `/tags/${slug}`,
    CREATE: "/tags",
    UPDATE: (id) => `/tags/${id}`,
    DELETE: (id) => `/tags/${id}`,
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    UPDATE_USER_ROLE: (id) => `/admin/users/${id}/role`,
    COMMENTS_MODERATION: "/admin/comments",
    DIAGNOSTICS: {
      SYSTEM: "/admin/diagnostics/system",
      LOGS: "/admin/diagnostics/logs",
      METRICS: "/admin/diagnostics/metrics",
      DATABASE: "/admin/diagnostics/database",
    },
  },
};

export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  },
  ARTICLE: {
    TITLE: {
      MIN_LENGTH: 3,
      MAX_LENGTH: 255,
    },
    CONTENT: {
      MIN_LENGTH: 10,
    },
    EXCERPT: {
      MAX_LENGTH: 500,
    },
    MAX_TAGS: 5,
  },
  COMMENT: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 1000,
  },
  TAG: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9\s-]+$/,
  },
};

export const UI_CONSTANTS = {
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  TIMEOUTS: {
    API_REQUEST: 10000, // 10 seconds
    DEBOUNCE_SEARCH: 300, // 300ms
    TOAST_DURATION: 5000, // 5 seconds
  },
  BREAKPOINTS: {
    SM: 576,
    MD: 768,
    LG: 992,
    XL: 1200,
  },
};

export const ERROR_MESSAGES = {
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "Your session has expired. Please log in again.",
  FORBIDDEN: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION: "Please check your input and try again.",
  SERVER_ERROR: "Server error. Please try again later.",
  UNKNOWN: "An unexpected error occurred.",
};

export const SUCCESS_MESSAGES = {
  LOGIN: "Welcome back!",
  LOGOUT: "You have been logged out successfully.",
  REGISTER: "Account created successfully!",
  PROFILE_UPDATED: "Profile updated successfully.",
  PASSWORD_CHANGED: "Password changed successfully.",
  ARTICLE_CREATED: "Article created successfully.",
  ARTICLE_UPDATED: "Article updated successfully.",
  ARTICLE_DELETED: "Article deleted successfully.",
  COMMENT_POSTED: "Comment posted successfully.",
  COMMENT_UPDATED: "Comment updated successfully.",
  COMMENT_DELETED: "Comment deleted successfully.",
};

