// frontend/src/utils/publicAssets.js

/**
 * Utility for managing public assets paths
 * All paths are relative to the public folder
 */

// Image paths
export const PUBLIC_IMAGES = {
  // Hero images
  heroBackground: '/images/openart-image_6lnGx5V4_1748601542121_raw.jpg',
  
  // Placeholder images
  articlePlaceholder: '/images/article-placeholder.jpg',
  avatarPlaceholder: '/images/avatar-placeholder.png',
  
  // Logo and branding
  logo: '/images/logo.png',
  logoWhite: '/images/logo-white.png',
  
  // Patterns and backgrounds
  hexagonPattern: '/images/hexagon-pattern.svg',
  honeycombBg: '/images/honeycomb-bg.jpg',
  
  // Icons
  beeIcon: '/images/bee-icon.svg',
};

/**
 * Get the full URL for a public image
 * @param {string} imagePath - Path relative to public folder (e.g., '/images/hero.jpg')
 * @returns {string} The image path
 */
export const getPublicImageUrl = (imagePath) => {
  // In production, React will serve these from the correct path
  return imagePath;
};

/**
 * Check if an image exists (for development)
 * @param {string} imagePath - Path to check
 * @returns {Promise<boolean>} Whether the image exists
 */
export const checkImageExists = async (imagePath) => {
  try {
    const response = await fetch(imagePath, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};