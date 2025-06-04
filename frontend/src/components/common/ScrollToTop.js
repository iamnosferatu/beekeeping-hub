// frontend/src/components/common/ScrollToTop.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to top of page on route changes.
 * This prevents the issue where pages load scrolled to bottom
 * or maintain scroll position from previous pages.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top whenever the pathname changes
    // Using requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Instant scroll on route change
      });
    });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;