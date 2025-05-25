// frontend/src/utils/urlHelpers.js

import { generateRoute, ROUTES } from "../constants/routes";

/**
 * URL Helper Functions
 * Functions for generating and manipulating URLs
 */

/**
 * Generate article URL
 * @param {string} slug - Article slug
 * @returns {string} Article URL
 */
export const getArticleUrl = (slug) => {
  return generateRoute(ROUTES.ARTICLE_DETAIL, { slug });
};

/**
 * Generate tag URL
 * @param {string} slug - Tag slug
 * @returns {string} Tag URL
 */
export const getTagUrl = (slug) => {
  return generateRoute(ROUTES.TAG_DETAIL, { slug });
};

/**
 * Generate author URL
 * @param {string} username - Author username
 * @returns {string} Author URL
 */
export const getAuthorUrl = (username) => {
  return generateRoute(ROUTES.AUTHOR_PROFILE, { username });
};

/**
 * Build search URL with parameters
 * @param {Object} params - Search parameters
 * @returns {string} Search URL with query string
 */
export const buildSearchUrl = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${ROUTES.SEARCH}?${queryString}` : ROUTES.SEARCH;
};
