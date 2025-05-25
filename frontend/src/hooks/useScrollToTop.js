// frontend/src/hooks/useScrollToTop.js
import { useCallback } from "react";

/**
 * Custom hook for scroll management
 *
 * Provides utilities for scrolling to specific positions on the page.
 * Useful for pagination, navigation, and user experience improvements.
 */
const useScrollToTop = () => {
  /**
   * Scroll to top of the page with smooth animation
   */
  const scrollToTop = useCallback((behavior = "smooth") => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior,
    });
  }, []);

  /**
   * Scroll to a specific element by ID
   */
  const scrollToElement = useCallback(
    (elementId, behavior = "smooth", offset = 0) => {
      const element = document.getElementById(elementId);
      if (element) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
          top: elementPosition,
          behavior,
        });
      }
    },
    []
  );

  /**
   * Scroll to a specific Y position
   */
  const scrollToPosition = useCallback((y, behavior = "smooth") => {
    window.scrollTo({
      top: y,
      behavior,
    });
  }, []);

  /**
   * Check if user is at the top of the page
   */
  const isAtTop = useCallback(() => {
    return window.scrollY === 0;
  }, []);

  /**
   * Get current scroll position
   */
  const getScrollPosition = useCallback(() => {
    return {
      x: window.scrollX,
      y: window.scrollY,
    };
  }, []);

  return {
    scrollToTop,
    scrollToElement,
    scrollToPosition,
    isAtTop,
    getScrollPosition,
  };
};

export default useScrollToTop;
