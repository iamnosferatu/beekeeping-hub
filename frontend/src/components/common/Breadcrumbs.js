// frontend/src/components/common/Breadcrumbs.js
import React, { useMemo } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

/**
 * Breadcrumbs Component
 * 
 * A flexible breadcrumb component that automatically generates breadcrumbs
 * based on the current route, with support for custom configurations.
 * 
 * @param {Object} props
 * @param {Array} props.items - Custom breadcrumb items (overrides auto-generation)
 * @param {Object} props.customLabels - Custom labels for specific paths
 * @param {boolean} props.showHome - Whether to show home link (default: true)
 * @param {string} props.className - Additional CSS classes
 */
const Breadcrumbs = ({ 
  items, 
  customLabels = {}, 
  showHome = true,
  className = ''
}) => {
  const location = useLocation();

  // Default path-to-label mappings
  const defaultLabels = {
    // Main sections
    'articles': 'Articles',
    'about': 'About',
    'contact': 'Contact',
    'privacy': 'Privacy Policy',
    'terms': 'Terms of Service',
    'cookies': 'Cookie Policy',
    'sitemap': 'Sitemap',
    'search': 'Search Results',
    
    // User sections
    'login': 'Login',
    'register': 'Register',
    'profile': 'My Profile',
    'my-articles': 'My Articles',
    'verify-email': 'Verify Email',
    'forgot-password': 'Forgot Password',
    'reset-password': 'Reset Password',
    
    // Author sections
    'new': 'New Article',
    'edit': 'Edit Article',
    
    // Forum sections
    'forum': 'Forum',
    'categories': 'Categories',
    'threads': 'Threads',
    'new-thread': 'New Thread',
    
    // Admin sections
    'admin': 'Admin',
    'dashboard': 'Dashboard',
    'users': 'Users',
    'comments': 'Comments',
    'tags': 'Tags',
    'settings': 'Settings',
    'newsletter': 'Newsletter',
    'ads': 'Advertisements',
    'author-applications': 'Author Applications',
    'site-settings': 'Site Settings',
    'diagnostics': 'Diagnostics',
    'forum-management': 'Forum Management',
    
    // Merged labels
    ...customLabels
  };

  // Generate breadcrumb items from current path
  const breadcrumbItems = useMemo(() => {
    // If custom items provided, use them
    if (items && items.length > 0) {
      return items;
    }

    // Parse current path
    const pathSegments = location.pathname
      .split('/')
      .filter(segment => segment.length > 0);

    // Build breadcrumb items
    const generatedItems = [];
    let currentPath = '';

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip certain segments (like IDs or slugs)
      if (segment.match(/^\d+$/) || segment === 'edit') {
        return;
      }

      // Determine label
      let label = defaultLabels[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Special handling for dynamic segments
      if (index === pathSegments.length - 1) {
        // Last segment might be a slug or ID
        if (segment.match(/^[a-z0-9-]+$/i) && !defaultLabels[segment]) {
          // This is likely a slug - we'll need to get the actual title
          // For now, format it nicely
          label = segment
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }
      }

      generatedItems.push({
        label,
        path: currentPath,
        active: index === pathSegments.length - 1
      });
    });

    return generatedItems;
  }, [location.pathname, items, defaultLabels]);

  // Don't render if no items (besides home)
  if (breadcrumbItems.length === 0 && !showHome) {
    return null;
  }

  // Don't render breadcrumbs on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Breadcrumb className={`breadcrumbs ${className}`}>
      {showHome && (
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          <FaHome className="me-1" />
          Home
        </Breadcrumb.Item>
      )}
      
      {breadcrumbItems.map((item, index) => (
        <Breadcrumb.Item
          key={item.path || index}
          active={item.active}
          linkAs={item.active ? undefined : Link}
          linkProps={item.active ? undefined : { to: item.path }}
        >
          {item.icon && <span className="me-1">{item.icon}</span>}
          {item.label}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default Breadcrumbs;