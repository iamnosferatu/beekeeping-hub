// frontend/src/config.js

// Function to determine API URL based on current location
const getApiUrl = () => {
  // If explicitly set in environment, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // If running on localhost, use localhost backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return "http://localhost:8080/api";
  }
  
  // Otherwise, assume backend is on same host but port 8080
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:8080/api`;
};

// API Configuration
export const API_URL = getApiUrl();
export const ASSETS_URL = API_URL.replace(/\/api$/, "");
export const BASE_URL = API_URL.replace(/\/api$/, ""); // Base URL without /api

// API configuration loaded

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
