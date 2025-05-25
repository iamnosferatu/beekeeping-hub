// frontend/src/constants/accessibility.js
/**
 * Accessibility Constants
 * ARIA labels, roles, and accessibility-related constants
 */

export const ARIA_LABELS = {
  PAGINATION: {
    MAIN: "Article pagination",
    FIRST: "Go to first page",
    PREVIOUS: "Go to previous page",
    NEXT: "Go to next page",
    LAST: "Go to last page",
    PAGE: (page) => `Go to page ${page}`,
    CURRENT_PAGE: (page) => `Page ${page}, current page`,
    ELLIPSIS: "More pages",
  },
  ARTICLE: {
    CARD: "Article card",
    TITLE: "Article title",
    EXCERPT: "Article excerpt",
    AUTHOR: "Article author",
    TAGS: "Article tags",
    STATS: "Article statistics",
    READ_MORE: "Read full article",
  },
  LOADING: {
    ARTICLES: "Loading articles",
    PAGE: "Loading page",
    CONTENT: "Loading content",
  },
  ERROR: {
    RETRY: "Retry loading content",
    CLOSE: "Close error message",
  },
};

export const ROLES = {
  MAIN: "main",
  NAVIGATION: "navigation",
  BANNER: "banner",
  CONTENTINFO: "contentinfo",
  COMPLEMENTARY: "complementary",
  ARTICLE: "article",
  BUTTON: "button",
  LINK: "link",
  STATUS: "status",
  ALERT: "alert",
};
