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
 * Get the full URL for any image (featured images, content images, etc.)
 * @param {string} imagePath - The image path from the database
 * @returns {string} The full URL to the image
 */
export const getImageUrl = (imagePath) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('🖼️ getImageUrl input:', imagePath);
    console.log('🖼️ Input type:', typeof imagePath);
    console.log('🖼️ Input length:', imagePath ? imagePath.length : 'N/A');
  }
  
  if (!imagePath) {
    return '';
  }

  let result;

  // If it's a relative path starting with /uploads/, prepend the backend URL
  if (imagePath.startsWith('/uploads/')) {
    result = `${ASSETS_URL}${imagePath}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ Using /uploads/ path logic');
    }
  }
  // If it's already a full URL, check if it needs localhost-to-network conversion
  else if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Convert localhost URLs to current network IP
    if (imagePath.includes('localhost:8080') || imagePath.includes('127.0.0.1:8080')) {
      result = imagePath.replace(/http:\/\/(localhost|127\.0\.0\.1):8080/, ASSETS_URL);
      if (process.env.NODE_ENV === 'development') {
        console.log('🖼️ Using full URL logic - converted localhost to network IP');
      }
    } else {
      result = imagePath;
      if (process.env.NODE_ENV === 'development') {
        console.log('🖼️ Using full URL logic - no conversion needed');
      }
    }
  }
  // For any other relative paths, prepend ASSETS_URL
  else if (imagePath.startsWith('/')) {
    result = `${ASSETS_URL}${imagePath}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ Using relative path logic');
    }
  }
  // Return as is for other cases
  else {
    result = imagePath;
    if (process.env.NODE_ENV === 'development') {
      console.log('🖼️ Using fallback logic');
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('🖼️ getImageUrl result:', result);
    console.log('🖼️ Result length:', result ? result.length : 'N/A');
    console.log('🖼️ ASSETS_URL:', ASSETS_URL);
  }

  return result;
};

/**
 * Get placeholder avatar URL
 * @returns {string} The placeholder avatar URL
 */
export const getPlaceholderAvatar = () => {
  return '/api/placeholder/200/200';
};