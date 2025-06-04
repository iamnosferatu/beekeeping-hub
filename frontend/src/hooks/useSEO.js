// frontend/src/hooks/useSEO.js
import { useEffect } from 'react';
import { useSEO as useSEOContext } from '../contexts/SEOContext';

/**
 * Hook for setting page SEO meta tags
 * Simpler alternative to using the SEO component directly
 */
export const useSEO = ({ title, description, ...props }) => {
  const seo = useSEOContext();
  
  useEffect(() => {
    // Set document title immediately for better UX
    if (title) {
      document.title = seo.titleTemplate.replace('%s', title);
    } else {
      document.title = seo.defaultTitle;
    }
    
    // Clean up on unmount
    return () => {
      document.title = seo.defaultTitle;
    };
  }, [title, seo.titleTemplate, seo.defaultTitle]);
  
  return seo;
};

export default useSEO;