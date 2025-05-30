// frontend/src/utils/imageHelpers.js
import { ASSETS_URL } from '../config';

/**
 * Get the full URL for an avatar image
 * @param {string} avatarPath - The avatar path from the database
 * @returns {string} The full URL to the avatar image
 */
export const getAvatarUrl = (avatarPath) => {
  if (!avatarPath) {
    return '/api/placeholder/200/200';
  }

  // If it's a relative path starting with /uploads/, prepend the backend URL
  if (avatarPath.startsWith('/uploads/')) {
    return `${ASSETS_URL}${avatarPath}`;
  }

  // If it's already a full URL, return as is
  if (avatarPath.startsWith('http://') || avatarPath.startsWith('https://')) {
    return avatarPath;
  }

  // For placeholder or other paths
  return avatarPath;
};

/**
 * Get placeholder avatar URL
 * @returns {string} The placeholder avatar URL
 */
export const getPlaceholderAvatar = () => {
  return '/api/placeholder/200/200';
};