// frontend/src/config.js

// API Configuration
export const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8080/api";
export const ASSETS_URL =
  process.env.REACT_APP_ASSETS_URL || "http://localhost:8080";
export const BASE_URL = API_URL.replace(/\/api$/, ""); // Base URL without /api

// Log the API URL for debugging
console.log("API URL:", API_URL);
console.log("Base URL:", BASE_URL);

// App Configuration
export const APP_NAME = process.env.REACT_APP_NAME || "BeeKeeper's Blog";
export const APP_DESCRIPTION =
  process.env.REACT_APP_DESCRIPTION ||
  "A modern blog for beekeeping enthusiasts";
export const APP_VERSION = process.env.REACT_APP_VERSION || "1.0.0";

// Auth Configuration
export const TOKEN_NAME =
  process.env.REACT_APP_TOKEN_NAME || "beekeeper_auth_token";
export const TOKEN_EXPIRY_DAYS = 30;
export const MIN_PASSWORD_LENGTH = 8;

// Feature Flags
export const ENABLE_COMMENTS =
  process.env.REACT_APP_ENABLE_COMMENTS !== "false";
export const ENABLE_LIKES = process.env.REACT_APP_ENABLE_LIKES !== "false";
export const ENABLE_SHARING = process.env.REACT_APP_ENABLE_SHARING !== "false";

// Pagination Configuration
export const DEFAULT_PAGE_SIZE = 10;

// Upload Configuration
export const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

// Comment Configuration
export const COMMENT_MAX_LENGTH = 500;
export const COMMENT_MIN_LENGTH = 10;

// Search Configuration
export const SEARCH_MIN_LENGTH = 3;
export const SEARCH_DEBOUNCE_TIME = 300; // ms
