// frontend/src/components/common/Avatar.js
import React, { useState } from 'react';
import { getAvatarData, getUserInitials, getAvatarColor } from '../../utils/avatarHelpers';
import './Avatar.scss';

/**
 * Avatar Component
 * 
 * Displays a user avatar - either their uploaded image or generated initials
 * 
 * @param {Object} user - User object with avatar, username, first_name, last_name
 * @param {number} size - Avatar size in pixels (default: 40)
 * @param {string} className - Additional CSS classes
 * @param {Object} style - Additional inline styles
 */
const Avatar = ({ user, size = 40, className = '', style = {} }) => {
  const [imageError, setImageError] = useState(false);
  const avatarData = getAvatarData(user);
  
  const baseStyle = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.4}px`,
    ...style
  };
  
  const handleImageError = () => {
    setImageError(true);
  };
  
  if (avatarData.type === 'image' && !imageError) {
    return (
      <img
        src={avatarData.url}
        alt={user?.username || 'User'}
        className={`avatar avatar-image ${className}`}
        style={baseStyle}
        onError={handleImageError}
      />
    );
  }
  
  // Initials avatar (fallback or no image)
  const initials = imageError ? getUserInitials(user) : avatarData.initials;
  const color = imageError ? getAvatarColor(user?.username) : avatarData.color;
  
  return (
    <div
      className={`avatar avatar-initials ${className}`}
      style={{
        ...baseStyle,
        backgroundColor: color
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;