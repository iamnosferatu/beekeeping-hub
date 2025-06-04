// frontend/src/components/common/EnhancedBreadcrumbs.js
import React, { useMemo, useEffect } from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';
import { useBreadcrumb } from '../../contexts/BreadcrumbContext';

/**
 * EnhancedBreadcrumbs Component
 * 
 * An advanced breadcrumb component that:
 * - Automatically generates breadcrumbs from the current route
 * - Integrates with BreadcrumbContext for dynamic labels
 * - Handles special cases like article slugs, user profiles, etc.
 * - Provides a clean, consistent breadcrumb experience across the site
 */
const EnhancedBreadcrumbs = ({ 
  className = '',
  showHome = true,
  maxItems = 5,
  separator = '/',
  ...props 
}) => {
  const location = useLocation();
  const params = useParams();
  const { dynamicBreadcrumbs } = useBreadcrumb();

  // Route configuration with patterns and labels
  const routeConfig = {
    // Article routes
    '/articles': {
      label: 'Articles',
      children: {
        '/:slug': {
          label: (slug) => dynamicBreadcrumbs[`/articles/${slug}`]?.title || formatSlug(slug),
          children: {
            '/edit': { label: 'Edit' }
          }
        },
        '/new': { label: 'New Article' }
      }
    },
    
    // User routes
    '/profile': {
      label: 'My Profile',
      children: {
        '/:username': {
          label: (username) => dynamicBreadcrumbs[`/profile/${username}`]?.name || username
        }
      }
    },
    '/my-articles': { label: 'My Articles' },
    
    // Forum routes
    '/forum': {
      label: 'Forum',
      children: {
        '/categories': {
          label: null, // Skip this segment in breadcrumbs
          skipInBreadcrumb: true,
          children: {
            '/:slug': {
              label: (slug) => dynamicBreadcrumbs[`/forum/categories/${slug}`]?.name || formatSlug(slug),
              children: {
                '/new-thread': { label: 'New Thread' }
              }
            }
          }
        },
        '/threads': {
          label: null, // Skip this segment in breadcrumbs
          skipInBreadcrumb: true,
          children: {
            '/:slug': {
              label: (slug) => dynamicBreadcrumbs[`/forum/threads/${slug}`]?.title || formatSlug(slug)
            }
          }
        },
        '/new-thread': { label: 'New Thread' }
      }
    },
    
    // Admin routes
    '/admin': {
      label: 'Admin',
      children: {
        '/dashboard': { label: 'Dashboard' },
        '/users': { label: 'Users' },
        '/articles': { label: 'Articles' },
        '/comments': { label: 'Comments' },
        '/tags': { label: 'Tags' },
        '/newsletter': { label: 'Newsletter' },
        '/settings': { label: 'Settings' },
        '/site-settings': { label: 'Site Settings' },
        '/author-applications': { label: 'Author Applications' },
        '/ads': { label: 'Advertisements' },
        '/diagnostics': { label: 'Diagnostics' },
        '/forum-management': { label: 'Forum Management' }
      }
    },
    
    // Static pages
    '/about': { label: 'About' },
    '/contact': { label: 'Contact' },
    '/privacy': { label: 'Privacy Policy' },
    '/terms': { label: 'Terms of Service' },
    '/cookies': { label: 'Cookie Policy' },
    '/sitemap': { label: 'Sitemap' },
    
    // Auth pages
    '/login': { label: 'Login' },
    '/register': { label: 'Register' },
    '/forgot-password': { label: 'Forgot Password' },
    '/reset-password': { label: 'Reset Password' },
    '/verify-email': { label: 'Verify Email' },
    
    // Search
    '/search': { label: 'Search Results' },
    
    // Tag pages
    '/tags': {
      label: 'Tags',
      children: {
        '/:slug': {
          label: (slug) => dynamicBreadcrumbs[`/tags/${slug}`]?.name || formatSlug(slug)
        }
      }
    }
  };

  // Helper function to format slugs into readable text
  function formatSlug(slug) {
    if (!slug) return '';
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Generate breadcrumb items from current path
  const breadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname
      .split('/')
      .filter(segment => segment.length > 0);

    if (pathSegments.length === 0) return [];

    const items = [];
    let currentPath = '';
    let currentConfig = routeConfig;

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;

      // Check for exact match first
      let config = currentConfig[`/${segment}`];
      
      // Check for parameter match if no exact match
      if (!config) {
        const paramKey = Object.keys(currentConfig).find(key => key.startsWith('/:'));
        if (paramKey) {
          config = currentConfig[paramKey];
        }
      }

      if (config) {
        // Skip this segment if configured to do so
        if (!config.skipInBreadcrumb) {
          let label = config.label;
          
          // If label is a function, call it with the segment value
          if (typeof label === 'function') {
            // For dynamic segments, pass the actual segment value
            label = label(segment);
          }

          if (label) {
            items.push({
              label,
              path: currentPath,
              active: i === pathSegments.length - 1
            });
          }
        }

        // Move to children for next iteration
        currentConfig = config.children || {};
      } else {
        // No config found, use formatted segment
        items.push({
          label: formatSlug(segment),
          path: currentPath,
          active: i === pathSegments.length - 1
        });
        
        // Reset config for next iteration
        currentConfig = {};
      }
    }

    // Limit items if needed
    if (maxItems && items.length > maxItems) {
      const start = items.slice(0, 1);
      const end = items.slice(-(maxItems - 2));
      return [
        ...start,
        { label: '...', path: null, active: false },
        ...end
      ];
    }

    // Special handling for forum threads to show category
    if (location.pathname.startsWith('/forum/threads/')) {
      // Find the thread in the breadcrumb items
      const threadIndex = items.findIndex(item => item.path.startsWith('/forum/threads/'));
      if (threadIndex !== -1) {
        // Get thread data from dynamicBreadcrumbs
        const threadData = dynamicBreadcrumbs[location.pathname];
        
        if (threadData?.category) {
          // Insert category breadcrumb before the thread
          items.splice(threadIndex, 0, {
            label: threadData.category.name || formatSlug(threadData.category.slug),
            path: `/forum/categories/${threadData.category.slug}`,
            active: false
          });
        }
      }
    }

    return items;
  }, [location.pathname, dynamicBreadcrumbs, maxItems]);

  // Don't render on home page
  if (location.pathname === '/') {
    return null;
  }

  // Don't render if only home would be shown
  if (breadcrumbItems.length === 0 && !showHome) {
    return null;
  }

  return (
    <Breadcrumb className={`enhanced-breadcrumbs ${className}`} {...props}>
      {showHome && (
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          <FaHome className="me-1" />
          Home
        </Breadcrumb.Item>
      )}
      
      {breadcrumbItems.map((item, index) => (
        <Breadcrumb.Item
          key={item.path || `ellipsis-${index}`}
          active={item.active}
          linkAs={item.path && !item.active ? Link : undefined}
          linkProps={item.path && !item.active ? { to: item.path } : undefined}
        >
          {item.label}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default EnhancedBreadcrumbs;