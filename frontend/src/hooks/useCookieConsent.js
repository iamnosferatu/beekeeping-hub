// frontend/src/hooks/useCookieConsent.js

import { useState, useEffect, useCallback } from 'react';
import {
  getCookieConsent,
  saveCookieConsent,
  isCookieAllowed,
  isCategoryAllowed,
  shouldShowConsentBanner,
  withdrawCookieConsent,
  getCookieConfig,
  getConsentSummary,
  COOKIE_CATEGORIES
} from '../utils/cookieConsent';
import cookieConsentManager from '../utils/cookieConsent';

/**
 * Cookie Consent Hook
 * 
 * Provides a React hook interface for managing cookie consent
 * throughout the application components.
 */
export const useCookieConsent = () => {
  const [consent, setConsent] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Update consent state
  const updateConsentState = useCallback(() => {
    const currentConsent = getCookieConsent();
    const shouldShow = shouldShowConsentBanner();
    
    setConsent(currentConsent);
    setShowBanner(shouldShow);
    setIsLoading(false);
  }, []);

  // Initialize and listen for consent changes
  useEffect(() => {
    updateConsentState();

    // Listen for consent changes
    const removeListener = cookieConsentManager.addEventListener((event, data) => {
      if (event === 'consent_saved' || event === 'consent_withdrawn' || event === 'consent_expired') {
        updateConsentState();
      }
    });

    return removeListener;
  }, [updateConsentState]);

  // Save consent preferences
  const saveConsent = useCallback((preferences) => {
    const success = saveCookieConsent(preferences);
    if (success) {
      updateConsentState();
    }
    return success;
  }, [updateConsentState]);

  // Withdraw consent
  const withdrawConsent = useCallback(() => {
    withdrawCookieConsent();
    updateConsentState();
  }, [updateConsentState]);

  // Check if a specific cookie is allowed
  const checkCookieAllowed = useCallback((cookieName) => {
    return isCookieAllowed(cookieName);
  }, []);

  // Check if a specific category is allowed
  const checkCategoryAllowed = useCallback((category) => {
    return isCategoryAllowed(category);
  }, []);

  // Get default consent (necessary only)
  const getDefaultConsent = useCallback(() => {
    const config = getCookieConfig();
    const defaultConsent = {};
    
    Object.entries(config).forEach(([category, categoryConfig]) => {
      defaultConsent[category] = categoryConfig.required;
    });
    
    return defaultConsent;
  }, []);

  // Get all consent (accept all)
  const getAllConsent = useCallback(() => {
    const config = getCookieConfig();
    const allConsent = {};
    
    Object.keys(config).forEach(category => {
      allConsent[category] = true;
    });
    
    return allConsent;
  }, []);

  return {
    // State
    consent,
    showBanner,
    isLoading,
    
    // Actions
    saveConsent,
    withdrawConsent,
    
    // Utilities
    checkCookieAllowed,
    checkCategoryAllowed,
    getDefaultConsent,
    getAllConsent,
    getConsentSummary,
    getCookieConfig,
    
    // Constants
    COOKIE_CATEGORIES,
  };
};

/**
 * Cookie Category Hook
 * 
 * Hook for checking if a specific cookie category is allowed
 */
export const useCookieCategory = (category) => {
  const [isAllowed, setIsAllowed] = useState(false);
  
  useEffect(() => {
    const checkCategory = () => {
      setIsAllowed(isCategoryAllowed(category));
    };
    
    checkCategory();
    
    // Listen for consent changes
    const removeListener = cookieConsentManager.addEventListener((event) => {
      if (event === 'consent_saved' || event === 'consent_withdrawn' || event === 'consent_expired') {
        checkCategory();
      }
    });
    
    return removeListener;
  }, [category]);
  
  return isAllowed;
};

/**
 * Analytics Cookie Hook
 * 
 * Convenience hook for checking analytics cookie consent
 */
export const useAnalyticsCookies = () => {
  return useCookieCategory(COOKIE_CATEGORIES.ANALYTICS);
};

/**
 * Performance Cookie Hook
 * 
 * Convenience hook for checking performance cookie consent
 */
export const usePerformanceCookies = () => {
  return useCookieCategory(COOKIE_CATEGORIES.PERFORMANCE);
};

/**
 * Marketing Cookie Hook
 * 
 * Convenience hook for checking marketing cookie consent
 */
export const useMarketingCookies = () => {
  return useCookieCategory(COOKIE_CATEGORIES.MARKETING);
};

/**
 * Functional Cookie Hook
 * 
 * Convenience hook for checking functional cookie consent
 */
export const useFunctionalCookies = () => {
  return useCookieCategory(COOKIE_CATEGORIES.FUNCTIONAL);
};

/**
 * Conditional Execution Hook
 * 
 * Hook that conditionally executes a function based on cookie consent
 */
export const useConditionalExecution = (category, dependencies = []) => {
  const isAllowed = useCookieCategory(category);
  
  const executeIfAllowed = useCallback((fn, ...args) => {
    if (isAllowed && typeof fn === 'function') {
      return fn(...args);
    }
    return null;
  }, [isAllowed]);
  
  // Effect that runs when consent changes
  const executeEffect = useCallback((effect, cleanup) => {
    if (isAllowed) {
      const cleanupFn = effect();
      return () => {
        if (cleanup && typeof cleanup === 'function') {
          cleanup();
        }
        if (cleanupFn && typeof cleanupFn === 'function') {
          cleanupFn();
        }
      };
    }
    return () => {};
  }, [isAllowed, ...dependencies]);
  
  return {
    isAllowed,
    executeIfAllowed,
    executeEffect,
  };
};

export default useCookieConsent;