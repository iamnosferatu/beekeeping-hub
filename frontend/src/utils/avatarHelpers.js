// frontend/src/utils/avatarHelpers.js
// No need to import from config anymore

/**
 * Generate initials from a user's name
 * @param {Object} user - User object with username, first_name, last_name
 * @returns {string} Initials (max 2 characters)
 */
export const getUserInitials = (user) => {
  if (!user) return 'U';
  
  const { first_name, last_name, username } = user;
  
  // Try to get initials from first and last name
  if (first_name && last_name) {
    return `${first_name[0]}${last_name[0]}`.toUpperCase();
  }
  
  // Fall back to first two letters of username
  if (username && username.length >= 2) {
    return username.substring(0, 2).toUpperCase();
  }
  
  // Fall back to first letter of username
  if (username) {
    return username[0].toUpperCase();
  }
  
  return 'U'; // Default
};

/**
 * Generate a consistent color based on username
 * @param {string} username - Username to generate color from
 * @returns {string} Hex color
 */
export const getAvatarColor = (username) => {
  if (!username) return '#6c757d'; // Default gray
  
  // Array of pleasant colors for avatars
  const colors = [
    '#007bff', // Blue
    '#28a745', // Green
    '#dc3545', // Red
    '#ffc107', // Yellow
    '#17a2b8', // Cyan
    '#6610f2', // Indigo
    '#e83e8c', // Pink
    '#fd7e14', // Orange
    '#20c997', // Teal
    '#6f42c1', // Purple
  ];
  
  // Generate a hash from username
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Use hash to select a color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Get avatar URL or generate default avatar data
 * @param {Object} user - User object
 * @returns {Object} Avatar data with url or initials and color
 */
export const getAvatarData = (user) => {
  if (user?.avatar) {
    // If avatar path is relative (starts with /), prepend the backend URL
    let avatarUrl = user.avatar;
    
    if (avatarUrl.startsWith('/')) {
      // Always use localhost:8080 for backend assets in development
      // In production, this should be configured via environment variables
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
      avatarUrl = `${backendUrl}${avatarUrl}`;
    }
    
    return {
      type: 'image',
      url: avatarUrl
    };
  }
  
  return {
    type: 'initials',
    initials: getUserInitials(user),
    color: getAvatarColor(user?.username)
  };
};