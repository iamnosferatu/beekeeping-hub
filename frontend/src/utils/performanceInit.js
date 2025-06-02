// frontend/src/utils/performanceInit.js

/**
 * Performance Monitoring Initialization
 * 
 * Initializes and configures all performance monitoring systems
 * for the application. Should be called early in the app lifecycle.
 */

import { initWebVitals, onWebVital } from './webVitalsMonitor';
import PerformanceMonitor from './performanceMonitoring';
import { performanceOptimizer } from './performanceOptimizer';

/**
 * Initialize performance monitoring
 */
export const initPerformanceMonitoring = (options = {}) => {
  const {
    enableWebVitals = true,
    enableApiMonitoring = true,
    enableComponentTracking = true,
    enableMemoryTracking = true,
    reportInterval = 60000, // 1 minute
    onPerformanceData = null,
    debug = process.env.NODE_ENV === 'development',
  } = options;

  console.log('🚀 Initializing Performance Monitoring...');

  // Initialize Web Vitals monitoring
  if (enableWebVitals) {
    try {
      const webVitalsMonitor = initWebVitals();
      
      // Listen for Web Vitals events
      onWebVital((vital) => {
        if (debug) {
          console.log(`📊 Web Vital ${vital.name}:`, vital.value, vital.rating);
        }
        
        if (onPerformanceData) {
          onPerformanceData({
            type: 'web_vital',
            data: vital,
          });
        }
      });
      
      console.log('✅ Web Vitals monitoring initialized');
    } catch (error) {
      console.warn('❌ Failed to initialize Web Vitals monitoring:', error);
    }
  }

  // Set up performance data reporting
  if (reportInterval > 0) {
    setInterval(() => {
      try {
        const report = performanceOptimizer.generateReport();
        
        if (debug && report.suggestions.length > 0) {
          console.log('📈 Performance Report:', {
            score: report.optimizationScore,
            suggestions: report.totalSuggestions,
            critical: report.suggestions.filter(s => s.severity === 'critical').length,
          });
        }
        
        if (onPerformanceData) {
          onPerformanceData({
            type: 'performance_report',
            data: report,
          });
        }
      } catch (error) {
        console.warn('Failed to generate performance report:', error);
      }
    }, reportInterval);
  }

  // Set up memory monitoring (if supported)
  if (enableMemoryTracking && 'memory' in performance) {
    try {
      // Record initial memory usage
      PerformanceMonitor.recordMemory({ event: 'app_start' });
      
      // Set up periodic memory checks
      setInterval(() => {
        PerformanceMonitor.recordMemory({ event: 'periodic_check' });
      }, 30000); // Every 30 seconds
      
      console.log('✅ Memory monitoring initialized');
    } catch (error) {
      console.warn('❌ Failed to initialize memory monitoring:', error);
    }
  }

  // Monitor page visibility changes
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      const event = document.visibilityState === 'hidden' ? 'page_hidden' : 'page_visible';
      PerformanceMonitor.recordMemory({ event });
      
      if (debug) {
        console.log(`👁️ Page visibility changed: ${document.visibilityState}`);
      }
    });
  }

  // Monitor page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      try {
        // Record final metrics before page unload
        PerformanceMonitor.recordMemory({ event: 'page_unload' });
        
        // Send any pending data (if using beacon API)
        if ('sendBeacon' in navigator && onPerformanceData) {
          const finalReport = performanceOptimizer.generateReport();
          const data = JSON.stringify({
            type: 'final_report',
            data: finalReport,
          });
          
          navigator.sendBeacon('/api/performance', data);
        }
      } catch (error) {
        console.warn('Error recording final metrics:', error);
      }
    });
  }

  // Monitor errors that might impact performance
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      PerformanceMonitor.record('error', 'javascript_error', 1, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      PerformanceMonitor.record('error', 'unhandled_promise_rejection', 1, {
        reason: event.reason?.message || 'Unknown',
      });
    });
  }

  console.log('🎯 Performance monitoring fully initialized');
  
  return {
    getReport: () => performanceOptimizer.generateReport(),
    getAnalytics: () => PerformanceMonitor.getAnalytics(),
    clearData: () => PerformanceMonitor.clear(),
  };
};

/**
 * Performance monitoring hook for React components
 */
export const withPerformanceMonitoring = (WrappedComponent, componentName) => {
  return function PerformanceMonitoredComponent(props) {
    React.useEffect(() => {
      const timer = PerformanceMonitor.startTiming(`${componentName}_mount`);
      
      return () => {
        timer.end({ event: 'unmount' });
      };
    }, []);

    return React.createElement(WrappedComponent, props);
  };
};

/**
 * Auto-initialize performance monitoring if in browser environment
 */
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
  // Auto-initialize with default options
  // Can be overridden by calling initPerformanceMonitoring explicitly
  let autoInitialized = false;
  
  const autoInit = () => {
    if (!autoInitialized) {
      autoInitialized = true;
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          initPerformanceMonitoring({
            debug: process.env.NODE_ENV === 'development',
          });
        });
      } else {
        initPerformanceMonitoring({
          debug: process.env.NODE_ENV === 'development',
        });
      }
    }
  };
  
  // Initialize on next tick to allow for manual initialization
  setTimeout(autoInit, 0);
}

export default initPerformanceMonitoring;