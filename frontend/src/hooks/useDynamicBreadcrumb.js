// frontend/src/hooks/useDynamicBreadcrumb.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useBreadcrumb } from '../contexts/BreadcrumbContext';

/**
 * Hook to set dynamic breadcrumb data for the current page
 * 
 * @param {Object} data - Dynamic data for the breadcrumb
 * @param {string} data.title - Title to display in breadcrumb
 * @param {string} data.name - Alternative to title
 * @param {Array} deps - Dependencies array for when to update
 */
export const useDynamicBreadcrumb = (data, deps = []) => {
  const location = useLocation();
  const { setDynamicBreadcrumb, clearDynamicBreadcrumb } = useBreadcrumb();

  useEffect(() => {
    if (data && (data.title || data.name)) {
      setDynamicBreadcrumb(location.pathname, data);
    }

    // Clean up on unmount
    return () => {
      clearDynamicBreadcrumb(location.pathname);
    };
  }, [location.pathname, ...deps]);
};

export default useDynamicBreadcrumb;