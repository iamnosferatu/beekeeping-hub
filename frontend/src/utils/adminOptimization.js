// frontend/src/utils/adminOptimization.js

/**
 * Admin Section Optimization Utilities
 * 
 * Provides utilities and information about how admin sections are optimized
 * to only load for admin users, improving performance for regular users.
 */

/**
 * Check if admin components should be loaded
 * @param {object} user - Current user object
 * @param {boolean} authLoading - Whether authentication is loading
 * @returns {boolean} Whether admin components should be loaded
 */
export const shouldLoadAdminComponents = (user, authLoading) => {
  // Load admin components if:
  // 1. Auth is still loading (we don't know user role yet)
  // 2. No user is logged in (handles direct admin URL access)
  // 3. User is an admin
  return authLoading || !user || user.role === 'admin';
};

/**
 * Get admin optimization information
 * @param {object} user - Current user object
 * @returns {object} Optimization information
 */
export const getAdminOptimizationInfo = (user) => {
  const isAdmin = user?.role === 'admin';
  
  return {
    isAdmin,
    optimizationEnabled: !isAdmin,
    componentsLoaded: isAdmin ? 'all' : 'none',
    description: isAdmin 
      ? 'All admin components are available and preloaded'
      : 'Admin components are not loaded to improve performance',
    benefits: isAdmin 
      ? ['Full admin functionality', 'Fast navigation between admin pages']
      : [
          'Reduced bundle size',
          'Faster initial page load',
          'No unnecessary admin code download',
          'Better performance for regular users'
        ],
    loadingStrategy: {
      routes: isAdmin ? 'rendered' : 'not rendered',
      preloading: isAdmin ? 'enabled' : 'disabled',
      cacheWarming: isAdmin ? 'admin data included' : 'user data only',
      bundleInclusion: 'lazy-loaded chunks only when accessed'
    }
  };
};

/**
 * Get performance metrics for admin optimization
 * @param {object} user - Current user object
 * @returns {object} Performance metrics
 */
export const getAdminPerformanceMetrics = (user) => {
  const isAdmin = user?.role === 'admin';
  
  // Estimated bundle size savings (these would be actual measurements in production)
  const estimatedSavings = {
    adminComponents: '~50KB', // Estimated size of all admin components
    adminStyles: '~8KB',      // Estimated size of admin-specific styles
    adminUtilities: '~15KB',  // Estimated size of admin utilities and hooks
    total: '~73KB'            // Total estimated savings for non-admin users
  };
  
  return {
    userType: isAdmin ? 'admin' : 'regular',
    bundleOptimization: {
      enabled: !isAdmin,
      estimatedSavings: isAdmin ? null : estimatedSavings,
      loadingStrategy: 'lazy with role-based conditions'
    },
    routeOptimization: {
      adminRoutesRendered: isAdmin,
      preloadingEnabled: isAdmin,
      description: isAdmin 
        ? 'Admin routes are rendered and preloaded for fast navigation'
        : 'Admin routes are not rendered, reducing React tree size'
    },
    cacheOptimization: {
      adminDataCached: isAdmin,
      userDataCached: true,
      description: isAdmin
        ? 'Both user and admin data are cached and warmed'
        : 'Only user-relevant data is cached, saving memory'
    }
  };
};

/**
 * Log admin optimization status (for development)
 * @param {object} user - Current user object
 */
export const logAdminOptimizationStatus = (user) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  const info = getAdminOptimizationInfo(user);
  const metrics = getAdminPerformanceMetrics(user);
  
  console.group('🔧 Admin Section Optimization Status');
  console.log('User Type:', metrics.userType);
  console.log('Optimization Enabled:', info.optimizationEnabled);
  console.log('Components Loaded:', info.componentsLoaded);
  console.log('Benefits:', info.benefits);
  
  if (!info.isAdmin) {
    console.log('Estimated Bundle Savings:', metrics.bundleOptimization.estimatedSavings);
  }
  
  console.log('Loading Strategy:', info.loadingStrategy);
  console.groupEnd();
};

export default {
  shouldLoadAdminComponents,
  getAdminOptimizationInfo,
  getAdminPerformanceMetrics,
  logAdminOptimizationStatus
};