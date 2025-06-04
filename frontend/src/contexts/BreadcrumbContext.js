// frontend/src/contexts/BreadcrumbContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * BreadcrumbContext
 * 
 * Provides a way to set dynamic breadcrumb data from anywhere in the app.
 * This is useful for pages that load data asynchronously and need to update
 * breadcrumb labels once the data is available.
 */
const BreadcrumbContext = createContext({
  dynamicBreadcrumbs: {},
  setDynamicBreadcrumb: () => {},
  clearDynamicBreadcrumbs: () => {}
});

export const BreadcrumbProvider = ({ children }) => {
  const [dynamicBreadcrumbs, setDynamicBreadcrumbs] = useState({});

  // Set a dynamic breadcrumb for a specific path
  const setDynamicBreadcrumb = useCallback((path, data) => {
    setDynamicBreadcrumbs(prev => ({
      ...prev,
      [path]: data
    }));
  }, []);

  // Clear all dynamic breadcrumbs
  const clearDynamicBreadcrumbs = useCallback(() => {
    setDynamicBreadcrumbs({});
  }, []);

  // Clear specific dynamic breadcrumb
  const clearDynamicBreadcrumb = useCallback((path) => {
    setDynamicBreadcrumbs(prev => {
      const newBreadcrumbs = { ...prev };
      delete newBreadcrumbs[path];
      return newBreadcrumbs;
    });
  }, []);

  const value = {
    dynamicBreadcrumbs,
    setDynamicBreadcrumb,
    clearDynamicBreadcrumbs,
    clearDynamicBreadcrumb
  };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

// Hook to use breadcrumb context
export const useBreadcrumb = () => {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within a BreadcrumbProvider');
  }
  return context;
};

export default BreadcrumbContext;