// frontend/src/components/common/RoutePreloader.js
import { useEffect, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';

/**
 * RoutePreloader - Preloads route components on hover/focus for better UX
 * 
 * This component preloads lazy-loaded route components when users hover over
 * navigation links, providing instant navigation without loading delays.
 * Only preloads admin routes for admin users to prevent unnecessary loading.
 */
const RoutePreloader = () => {
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    // Base routes available to all users
    const basePreloadRoutes = {
      '/articles': () => import('../../pages/ArticleListPage'),
      '/contact': () => import('../../pages/ContactPage'),
      '/about': () => import('../../pages/AboutPage'),
    };

    // User-specific routes
    const userPreloadRoutes = user ? {
      '/profile': () => import('../../pages/ProfilePage'),
    } : {};

    // Author-specific routes
    const authorPreloadRoutes = (user && (user.role === 'author' || user.role === 'admin')) ? {
      '/my-articles': () => import('../../pages/MyArticlesPage'),
      '/editor': () => import('../../pages/ArticleEditorPage'),
    } : {};

    // Admin-specific routes - only load for admin users
    const adminPreloadRoutes = (user && user.role === 'admin') ? {
      '/admin': () => import('../../layouts/AdminLayout'),
      '/admin/articles': () => import('../../pages/admin/ArticlesPage'),
      '/admin/users': () => import('../../pages/admin/UsersPage'),
      '/admin/comments': () => import('../../pages/admin/CommentsPage'),
      '/admin/tags': () => import('../../pages/admin/TagsPage'),
      '/admin/settings': () => import('../../pages/admin/SiteSettingsPage'),
      '/admin/newsletter': () => import('../../pages/admin/NewsletterPage'),
      '/admin/diagnostics': () => import('../../pages/admin/DiagnosticsPage'),
    } : {};

    // Combine all available routes based on user role
    const preloadRoutes = {
      ...basePreloadRoutes,
      ...userPreloadRoutes,
      ...authorPreloadRoutes,
      ...adminPreloadRoutes,
    };

    const preloadOnHover = (event) => {
      const link = event.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (href && preloadRoutes[href]) {
        // Preload the route component
        preloadRoutes[href]().catch(() => {
          // Silently fail - component will load normally when navigated to
        });
      }
    };

    // Add event listeners for hover preloading
    document.addEventListener('mouseover', preloadOnHover);
    
    // Preload critical routes after a longer delay to avoid interfering with page rendering
    // Use requestIdleCallback if available, otherwise fallback to longer timeout
    const schedulePreload = () => {
      // Get current path to avoid preloading current page components
      const currentPath = window.location.pathname;
      const criticalRoutes = [];

      // Only preload routes that are NOT the current page
      if (!currentPath.startsWith('/articles')) {
        criticalRoutes.push(preloadRoutes['/articles']?.());
      }
      if (currentPath !== '/contact') {
        criticalRoutes.push(preloadRoutes['/contact']?.());
      }

      // Add user-specific critical routes (avoiding current page)
      if (user) {
        if (currentPath !== '/profile') {
          criticalRoutes.push(preloadRoutes['/profile']?.());
        }
        
        // Preload author routes for authors/admins
        if (user.role === 'author' || user.role === 'admin') {
          if (currentPath !== '/my-articles') {
            criticalRoutes.push(preloadRoutes['/my-articles']?.());
          }
        }
        
        // Preload admin dashboard for admin users
        if (user.role === 'admin') {
          if (!currentPath.startsWith('/admin')) {
            criticalRoutes.push(preloadRoutes['/admin']?.());
          }
        }
      }

      console.log('🔄 Preloading routes (excluding current page):', criticalRoutes.length);
      Promise.all(criticalRoutes.filter(Boolean)).catch(() => {
        // Silently fail
      });
    };

    // Smart preloading that avoids current page components
    let preloadTimer = null;
    if ('requestIdleCallback' in window) {
      preloadTimer = requestIdleCallback(schedulePreload, { timeout: 30000 }); // 30 seconds
    } else {
      preloadTimer = setTimeout(schedulePreload, 30000); // 30 seconds
    }

    return () => {
      document.removeEventListener('mouseover', preloadOnHover);
      if (preloadTimer) {
        if ('requestIdleCallback' in window && typeof preloadTimer !== 'number') {
          cancelIdleCallback(preloadTimer);
        } else {
          clearTimeout(preloadTimer);
        }
      }
    };
  }, [user]); // Re-run when user changes

  return null; // This component renders nothing
};

export default RoutePreloader;