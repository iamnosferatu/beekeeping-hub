// frontend/src/constants/routes.js
/**
 * Route Constants
 * Centralized route definitions
 */

export const ROUTES = {
  HOME: "/",
  ARTICLES: "/articles",
  ARTICLE_DETAIL: "/articles/:slug",
  TAGS: "/tags",
  TAG_DETAIL: "/tags/:slug",
  SEARCH: "/search",
  AUTHOR_PROFILE: "/author/:username",
  LOGIN: "/login",
  REGISTER: "/register",
  PROFILE: "/profile",
  EDITOR: "/editor",
  EDIT_ARTICLE: "/editor/:id",
  MY_ARTICLES: "/my-articles",
  ADMIN: "/admin",
};

/**
 * Generate route with parameters
 * @param {string} route - Route template
 * @param {Object} params - Parameters to replace
 * @returns {string} Generated route
 */
export const generateRoute = (route, params = {}) => {
  let generatedRoute = route;

  Object.entries(params).forEach(([key, value]) => {
    generatedRoute = generatedRoute.replace(`:${key}`, value);
  });

  return generatedRoute;
};
