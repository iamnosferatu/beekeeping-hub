// frontend/src/constants/ui.js

/**
 * UI Constants
 *
 * Centralized constants for UI components, animations, and configurations.
 * Used throughout the application for consistent behavior and styling.
 */

// Animation configurations
export const ANIMATION_CONFIG = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: "ease",
    easeIn: "ease-in",
    easeOut: "ease-out",
    easeInOut: "ease-in-out",
  },
};

// Article-related configurations
export const ARTICLE_CONFIG = {
  excerpt: {
    maxLength: 160,
    lineClamp: 3,
  },
  image: {
    defaultHeight: 200,
    aspectRatio: "16:9",
  },
  title: {
    maxLength: 100,
  },
};

// Responsive breakpoints (Bootstrap-based)
export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

// Error handling configurations
export const ERROR_CONFIG = {
  retry: {
    maxAttempts: 3,
    delay: 1000,
  },
  timeout: {
    default: 10000,
    long: 30000,
  },
};

// Loading configurations
export const LOADING_CONFIG = {
  spinner: {
    size: "border",
    variant: "primary",
  },
  skeleton: {
    animation: "wave",
    height: 20,
  },
  debounce: {
    search: 300,
    api: 500,
  },
  SKELETON_ITEMS: 3, // Number of skeleton items to show while loading
};

// Pagination configurations
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10, // Fixed to match usage in components
  defaultPageSize: 10, // Keep both for backward compatibility
  maxVisiblePages: 5,
  pageSizes: [5, 10, 20, 50],
  showFirstLast: true,
  showPrevNext: true,
};

// ARIA labels for accessibility
export const ARIA_LABELS = {
  // Loading states
  loading: "Loading content",
  loadingArticles: "Loading articles",
  loadingPage: "Loading page",

  // Navigation
  pagination: "Pagination navigation",
  firstPage: "Go to first page",
  lastPage: "Go to last page",
  nextPage: "Go to next page",
  previousPage: "Go to previous page",
  currentPage: "Current page",

  // Articles
  articleCard: "Article card",
  articleTitle: "Article title",
  articleExcerpt: "Article excerpt",
  articleStats: "Article statistics",
  readMore: "Read more about this article",

  // Actions
  retry: "Retry loading",
  close: "Close",
  expand: "Expand",
  collapse: "Collapse",

  // Forms
  search: "Search articles",
  filter: "Filter articles",
  sort: "Sort articles",

  // Status
  error: "Error message",
  success: "Success message",
  warning: "Warning message",
  info: "Information message",
};

// Z-index layers for consistent stacking
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
};

// Common spacing values
export const SPACING = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.5rem",
  xl: "3rem",
};

// Color variants (Bootstrap-compatible)
export const VARIANTS = {
  primary: "primary",
  secondary: "secondary",
  success: "success",
  danger: "danger",
  warning: "warning",
  info: "info",
  light: "light",
  dark: "dark",
};

// Component sizes
export const SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};
