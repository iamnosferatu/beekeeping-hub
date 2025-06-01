// frontend/src/components/common/RoutePreloader.js
import { useEffect } from 'react';

/**
 * RoutePreloader - Preloads route components on hover/focus for better UX
 * 
 * This component preloads lazy-loaded route components when users hover over
 * navigation links, providing instant navigation without loading delays.
 */
const RoutePreloader = () => {
  useEffect(() => {
    const preloadRoutes = {
      '/articles': () => import('../../pages/ArticleListPage'),
      '/profile': () => import('../../pages/ProfilePage'),
      '/my-articles': () => import('../../pages/MyArticlesPage'),
      '/editor': () => import('../../pages/ArticleEditorPage'),
      '/admin': () => import('../../layouts/AdminLayout'),
      '/admin/articles': () => import('../../pages/admin/ArticlesPage'),
      '/admin/users': () => import('../../pages/admin/UsersPage'),
      '/admin/comments': () => import('../../pages/admin/CommentsPage'),
      '/admin/tags': () => import('../../pages/admin/TagsPage'),
      '/admin/settings': () => import('../../pages/admin/SiteSettingsPage'),
      '/admin/newsletter': () => import('../../pages/admin/NewsletterPage'),
      '/admin/diagnostics': () => import('../../pages/admin/DiagnosticsPage'),
      '/contact': () => import('../../pages/ContactPage'),
      '/about': () => import('../../pages/AboutPage'),
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
      // Preload most common routes
      Promise.all([
        preloadRoutes['/articles']?.(),
        preloadRoutes['/contact']?.(),
      ]).catch(() => {
        // Silently fail
      });
    }, 2000);

    return () => {
      document.removeEventListener('mouseover', preloadOnHover);
      clearTimeout(preloadTimer);
    };
  }, []);

  return null; // This component renders nothing
};

export default RoutePreloader;