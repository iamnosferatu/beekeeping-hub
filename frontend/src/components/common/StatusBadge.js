import React from 'react';
import { Badge } from 'react-bootstrap';
import { 
  BsCheckCircle, 
  BsXCircle, 
  BsClock, 
  BsShieldFill, 
  BsFileEarmarkText,
  BsExclamationTriangle,
  BsShieldX,
  BsPersonFill,
  BsPencilFill,
  BsEyeSlash,
  BsArchive
} from 'react-icons/bs';

/**
 * StatusBadge - A standardized component for displaying status badges
 * across the application with consistent styling and icons
 * 
 * @param {string} status - The status to display
 * @param {string} [type='general'] - The type of status (article, comment, user, role, forum, application)
 * @param {boolean} [showIcon=true] - Whether to show the icon
 * @param {string} [size='md'] - Badge size (sm, md, lg)
 * @param {object} [customConfig] - Custom configuration to override defaults
 * @param {string} [className] - Additional CSS classes
 */
const StatusBadge = ({ 
  status, 
  type = 'general', 
  showIcon = true, 
  size = 'md',
  customConfig,
  className = '' 
}) => {
  // Status configurations by type
  const statusConfigs = {
    // Article statuses
    article: {
      published: {
        variant: 'success',
        icon: <BsCheckCircle />,
        text: 'Published'
      },
      draft: {
        variant: 'secondary',
        icon: <BsFileEarmarkText />,
        text: 'Draft'
      },
      blocked: {
        variant: 'danger',
        icon: <BsShieldX />,
        text: 'Blocked'
      },
      archived: {
        variant: 'dark',
        icon: <BsArchive />,
        text: 'Archived'
      }
    },
    
    // Comment statuses
    comment: {
      approved: {
        variant: 'success',
        icon: <BsCheckCircle />,
        text: 'Approved'
      },
      pending: {
        variant: 'warning',
        icon: <BsClock />,
        text: 'Pending'
      },
      rejected: {
        variant: 'danger',
        icon: <BsXCircle />,
        text: 'Rejected'
      },
      reported: {
        variant: 'danger',
        icon: <BsExclamationTriangle />,
        text: 'Reported'
      }
    },
    
    // User roles
    role: {
      admin: {
        variant: 'danger',
        icon: <BsShieldFill />,
        text: 'Admin'
      },
      author: {
        variant: 'primary',
        icon: <BsPencilFill />,
        text: 'Author'
      },
      user: {
        variant: 'info',
        icon: <BsPersonFill />,
        text: 'User'
      }
    },
    
    // User statuses
    user: {
      active: {
        variant: 'success',
        icon: <BsCheckCircle />,
        text: 'Active'
      },
      inactive: {
        variant: 'secondary',
        icon: <BsEyeSlash />,
        text: 'Inactive'
      },
      banned: {
        variant: 'danger',
        icon: <BsXCircle />,
        text: 'Banned'
      },
      suspended: {
        variant: 'warning',
        icon: <BsExclamationTriangle />,
        text: 'Suspended'
      }
    },
    
    // Forum statuses
    forum: {
      open: {
        variant: 'success',
        icon: <BsCheckCircle />,
        text: 'Open'
      },
      closed: {
        variant: 'secondary',
        icon: <BsXCircle />,
        text: 'Closed'
      },
      locked: {
        variant: 'warning',
        icon: <BsShieldX />,
        text: 'Locked'
      },
      pinned: {
        variant: 'info',
        icon: <BsClock />,
        text: 'Pinned'
      }
    },
    
    // Author application statuses
    application: {
      pending: {
        variant: 'warning',
        icon: <BsClock />,
        text: 'Pending Review'
      },
      approved: {
        variant: 'success',
        icon: <BsCheckCircle />,
        text: 'Approved'
      },
      rejected: {
        variant: 'danger',
        icon: <BsXCircle />,
        text: 'Rejected'
      }
    },
    
    // General statuses (fallback)
    general: {
      active: {
        variant: 'success',
        icon: <BsCheckCircle />,
        text: 'Active'
      },
      inactive: {
        variant: 'secondary',
        icon: <BsXCircle />,
        text: 'Inactive'
      },
      pending: {
        variant: 'warning',
        icon: <BsClock />,
        text: 'Pending'
      },
      success: {
        variant: 'success',
        icon: <BsCheckCircle />,
        text: 'Success'
      },
      error: {
        variant: 'danger',
        icon: <BsXCircle />,
        text: 'Error'
      },
      warning: {
        variant: 'warning',
        icon: <BsExclamationTriangle />,
        text: 'Warning'
      }
    }
  };

  // Get configuration for the status
  const getStatusConfig = () => {
    // If custom config is provided, use it
    if (customConfig) {
      return customConfig;
    }

    // Normalize status to lowercase
    const normalizedStatus = status?.toLowerCase() || '';
    
    // Get type-specific config or fall back to general
    const typeConfig = statusConfigs[type] || statusConfigs.general;
    const config = typeConfig[normalizedStatus];
    
    // If no specific config found, create a default one
    if (!config) {
      return {
        variant: 'secondary',
        icon: null,
        text: status || 'Unknown'
      };
    }
    
    return config;
  };

  const config = getStatusConfig();
  
  // Size classes
  const sizeClasses = {
    sm: 'status-badge-sm',
    md: '',
    lg: 'status-badge-lg'
  };

  const badgeClasses = [
    'status-badge',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <Badge 
      bg={config.variant} 
      className={badgeClasses}
    >
      {showIcon && config.icon && (
        <span className="status-badge-icon me-1">
          {config.icon}
        </span>
      )}
      <span className="status-badge-text">
        {config.text}
      </span>
    </Badge>
  );
};

// Export predefined status types for consistency
export const StatusTypes = {
  ARTICLE: 'article',
  COMMENT: 'comment',
  USER: 'user',
  ROLE: 'role',
  FORUM: 'forum',
  APPLICATION: 'application',
  GENERAL: 'general'
};

// Export common status values
export const StatusValues = {
  // Article
  PUBLISHED: 'published',
  DRAFT: 'draft',
  BLOCKED: 'blocked',
  ARCHIVED: 'archived',
  
  // Comment
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
  REPORTED: 'reported',
  
  // User
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
  SUSPENDED: 'suspended',
  
  // Roles
  ADMIN: 'admin',
  AUTHOR: 'author',
  USER: 'user',
  
  // Forum
  OPEN: 'open',
  CLOSED: 'closed',
  LOCKED: 'locked',
  PINNED: 'pinned'
};

export default StatusBadge;