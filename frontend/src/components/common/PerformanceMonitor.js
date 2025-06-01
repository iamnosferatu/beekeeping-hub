// frontend/src/components/common/PerformanceMonitor.js
import { useEffect } from 'react';

/**
 * PerformanceMonitor - Tracks and reports app performance metrics
 * 
 * Monitors lazy loading effectiveness, route transition times,
 * and bundle loading performance for optimization insights.
 */
const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    // Track initial bundle load time
    const trackInitialLoad = () => {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        if (loadTime > 0) {
          // In a real app, you'd send this to analytics
          console.info(`🚀 App loaded in ${loadTime}ms`);
        }
      }
    };

    // Track when chunks are loaded
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(this, tagName);
      
      if (tagName.toLowerCase() === 'script' && element.src) {
        const chunkMatch = element.src.match(/(\d+)\.[a-f0-9]+\.chunk\.js/);
        if (chunkMatch) {
          const startTime = performance.now();
          element.addEventListener('load', () => {
            const loadTime = performance.now() - startTime;
            console.info(`📦 Chunk ${chunkMatch[1]} loaded in ${loadTime.toFixed(2)}ms`);
          });
        }
      }
      
      return element;
    };

    // Track route changes
    let lastUrl = window.location.pathname;
    const trackRouteChange = () => {
      const currentUrl = window.location.pathname;
      if (currentUrl !== lastUrl) {
        console.info(`🛣️ Route changed: ${lastUrl} → ${currentUrl}`);
        lastUrl = currentUrl;
      }
    };

    // Set up observers
    const loadTimer = setTimeout(trackInitialLoad, 100);
    const routeInterval = setInterval(trackRouteChange, 1000);

    return () => {
      clearTimeout(loadTimer);
      clearInterval(routeInterval);
      // Restore original createElement
      document.createElement = originalCreateElement;
    };
  }, []);

  return null; // This component renders nothing
};

export default PerformanceMonitor;