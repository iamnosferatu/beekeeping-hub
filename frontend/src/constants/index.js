// frontend/src/constants/index.js
/**
 * Centralized Constants Export
 * Barrel export for all constants to simplify imports
 *
 * Usage:
 * import { PAGINATION_CONFIG, ARIA_LABELS, ROUTES } from '../constants';
 */

// Re-export all UI constants
export {
  PAGINATION_CONFIG,
  ARTICLE_CONFIG,
  ERROR_CONFIG,
  LOADING_CONFIG,
  BREAKPOINTS,
  ANIMATION_CONFIG,
} from "./ui";

// Re-export all accessibility constants
export { ARIA_LABELS, ROLES } from "./accessibility";

// Re-export all route constants
export { ROUTES, generateRoute } from "./routes";

// Re-export all icon constants
export { ICONS } from "./icons";
