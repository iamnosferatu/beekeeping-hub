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
    
    // Preload critical routes after a delay
    const preloadTimer = setTimeout(() => {
      // Preload most common routes based on user role
      const criticalRoutes = [
        preloadRoutes['/articles']?.(),
        preloadRoutes['/contact']?.(),
      ];

      // Add user-specific critical routes
      if (user) {
        criticalRoutes.push(preloadRoutes['/profile']?.());
        
        // Preload author routes for authors/admins
        if (user.role === 'author' || user.role === 'admin') {
          criticalRoutes.push(preloadRoutes['/my-articles']?.());
        }
        
        // Preload admin dashboard for admin users
        if (user.role === 'admin') {
          criticalRoutes.push(preloadRoutes['/admin']?.());
        }
      }

      Promise.all(criticalRoutes.filter(Boolean)).catch(() => {
        // Silently fail
      });
    }, 2000);

    return () => {
      document.removeEventListener('mouseover', preloadOnHover);
      clearTimeout(preloadTimer);
    };
  }, [user]); // Re-run when user changes

  return null; // This component renders nothing
};

export default RoutePreloader;