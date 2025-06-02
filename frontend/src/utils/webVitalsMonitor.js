// frontend/src/utils/webVitalsMonitor.js

/**
 * Web Vitals Monitoring System
 * 
 * Tracks Core Web Vitals and other important performance metrics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - TTFB (Time to First Byte)
 * - FCP (First Contentful Paint)
 * - TTI (Time to Interactive)
 */

import PerformanceMonitor, { METRIC_TYPES } from './performanceMonitoring';

/**
 * Web Vitals configuration
 */
const WEB_VITALS_CONFIG = {
  LCP: {
    name: 'Largest Contentful Paint',
    thresholds: { good: 2500, needs_improvement: 4000 },
    description: 'Measures loading performance',
  },
  FID: {
    name: 'First Input Delay',
    thresholds: { good: 100, needs_improvement: 300 },
    description: 'Measures interactivity',
  },
  CLS: {
    name: 'Cumulative Layout Shift',
    thresholds: { good: 0.1, needs_improvement: 0.25 },
    description: 'Measures visual stability',
  },
  TTFB: {
    name: 'Time to First Byte',
    thresholds: { good: 800, needs_improvement: 1800 },
    description: 'Measures server response time',
  },
  FCP: {
    name: 'First Contentful Paint',
    thresholds: { good: 1800, needs_improvement: 3000 },
    description: 'Measures perceived loading',
  },
  TTI: {
    name: 'Time to Interactive',
    thresholds: { good: 3800, needs_improvement: 7300 },
    description: 'Measures full interactivity',
  },
};

/**
 * Web Vitals Monitor class
 */
export class WebVitalsMonitor {
  constructor() {
    this.isSupported = this.checkSupport();
    this.observers = new Map();
    this.vitals = new Map();
    this.initialized = false;
    
    if (this.isSupported) {
      this.init();
    }
  }

  /**
   * Check if Web Vitals APIs are supported
   */
  checkSupport() {
    return (
      typeof window !== 'undefined' &&
      'performance' in window &&
      'PerformanceObserver' in window &&
      'requestIdleCallback' in window
    );
  }

  /**
   * Initialize Web Vitals monitoring
   */
  init() {
    if (this.initialized) return;
    
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      this.setupObservers();
    } else {
      window.addEventListener('load', () => this.setupObservers());
    }
    
    this.initialized = true;
  }

  /**
   * Setup performance observers for all vitals
   */
  setupObservers() {
    // Setup individual vital observers
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeTTFB();
    this.observeFCP();
    this.observeTTI();
    
    // Setup navigation timing observer
    this.observeNavigation();
    
    // Setup resource timing observer
    this.observeResources();
    
    // Monitor page visibility changes
    this.setupVisibilityHandler();
  }

  /**
   * Observe Largest Contentful Paint
   */
  observeLCP() {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.recordVital('LCP', lastEntry.startTime, {
          element: lastEntry.element ? this.getElementInfo(lastEntry.element) : null,
          size: lastEntry.size,
          url: lastEntry.url,
          id: lastEntry.id,
        });
      });
      
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.set('LCP', observer);
    } catch (error) {
      console.warn('LCP observer not supported:', error);
    }
  }

  /**
   * Observe First Input Delay
   */
  observeFID() {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.recordVital('FID', entry.processingStart - entry.startTime, {
            name: entry.name,
            startTime: entry.startTime,
            processingStart: entry.processingStart,
            processingEnd: entry.processingEnd,
            target: entry.target ? this.getElementInfo(entry.target) : null,
          });
        });
      });
      
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.set('FID', observer);
    } catch (error) {
      console.warn('FID observer not supported:', error);
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  observeCLS() {
    try {
      let clsValue = 0;
      let sessionValue = 0;
      let sessionEntries = [];
      
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        
        entries.forEach(entry => {
          // Only count layout shifts without recent user input
          if (!entry.hadRecentInput) {
            const firstSessionEntry = sessionEntries[0];
            const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
            
            // If the entry occurred less than 1 second after the previous entry
            // and less than 5 seconds after the first entry in the session,
            // include the entry in the current session
            if (sessionValue &&
                entry.startTime - lastSessionEntry.startTime < 1000 &&
                entry.startTime - firstSessionEntry.startTime < 5000) {
              sessionValue += entry.value;
              sessionEntries.push(entry);
            } else {
              // Start a new session
              sessionValue = entry.value;
              sessionEntries = [entry];
            }
            
            // Update the CLS value if the current session value is larger
            if (sessionValue > clsValue) {
              clsValue = sessionValue;
              
              this.recordVital('CLS', clsValue, {
                sessionEntries: sessionEntries.length,
                largestShift: entry.value,
                sources: entry.sources ? entry.sources.map(source => ({
                  element: this.getElementInfo(source.node),
                  previousRect: source.previousRect,
                  currentRect: source.currentRect,
                })) : [],
              });
            }
          }
        });
      });
      
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.set('CLS', observer);
    } catch (error) {
      console.warn('CLS observer not supported:', error);
    }
  }

  /**
   * Observe Time to First Byte
   */
  observeTTFB() {
    try {
      const navTiming = performance.getEntriesByType('navigation')[0];
      if (navTiming) {
        const ttfb = navTiming.responseStart - navTiming.requestStart;
        
        this.recordVital('TTFB', ttfb, {
          requestStart: navTiming.requestStart,
          responseStart: navTiming.responseStart,
          responseEnd: navTiming.responseEnd,
          transferSize: navTiming.transferSize,
          encodedBodySize: navTiming.encodedBodySize,
          decodedBodySize: navTiming.decodedBodySize,
        });
      }
    } catch (error) {
      console.warn('TTFB measurement failed:', error);
    }
  }

  /**
   * Observe First Contentful Paint
   */
  observeFCP() {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            this.recordVital('FCP', entry.startTime, {
              entryType: entry.entryType,
              name: entry.name,
            });
          }
        });
      });
      
      observer.observe({ type: 'paint', buffered: true });
      this.observers.set('FCP', observer);
    } catch (error) {
      console.warn('FCP observer not supported:', error);
    }
  }

  /**
   * Observe Time to Interactive (estimated)
   */
  observeTTI() {
    try {
      // TTI is complex to measure accurately, so we'll use a simplified approach
      // This is an approximation based on when the main thread becomes idle
      
      if ('requestIdleCallback' in window) {
        const startTime = performance.now();
        
        requestIdleCallback((deadline) => {
          const tti = performance.now() - startTime;
          
          this.recordVital('TTI', tti, {
            timeRemaining: deadline.timeRemaining(),
            didTimeout: deadline.didTimeout,
            estimatedMethod: 'requestIdleCallback',
          });
        });
      } else {
        // Fallback: use load event + small delay
        window.addEventListener('load', () => {
          setTimeout(() => {
            const tti = performance.now();
            this.recordVital('TTI', tti, {
              estimatedMethod: 'load_event_fallback',
            });
          }, 100);
        });
      }
    } catch (error) {
      console.warn('TTI measurement failed:', error);
    }
  }

  /**
   * Observe navigation timing
   */
  observeNavigation() {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.recordNavigationTiming(entry);
        });
      });
      
      observer.observe({ type: 'navigation', buffered: true });
      this.observers.set('navigation', observer);
    } catch (error) {
      console.warn('Navigation observer not supported:', error);
    }
  }

  /**
   * Observe resource loading
   */
  observeResources() {
    try {
      const observer = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          this.recordResourceTiming(entry);
        });
      });
      
      observer.observe({ type: 'resource', buffered: true });
      this.observers.set('resource', observer);
    } catch (error) {
      console.warn('Resource observer not supported:', error);
    }
  }

  /**
   * Record a Web Vital metric
   */
  recordVital(name, value, metadata = {}) {
    const vital = {
      name,
      value,
      metadata,
      timestamp: Date.now(),
      rating: this.getRating(name, value),
    };
    
    this.vitals.set(name, vital);
    
    // Record in performance monitoring system
    PerformanceMonitor.record(METRIC_TYPES.WEB_VITAL, name, value, {
      ...metadata,
      rating: vital.rating,
      config: WEB_VITALS_CONFIG[name],
    });
    
    // Trigger custom event for listeners
    this.dispatchVitalEvent(vital);
  }

  /**
   * Record navigation timing details
   */
  recordNavigationTiming(entry) {
    const timings = {
      redirectTime: entry.redirectEnd - entry.redirectStart,
      dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
      connectTime: entry.connectEnd - entry.connectStart,
      sslTime: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      requestTime: entry.responseStart - entry.requestStart,
      responseTime: entry.responseEnd - entry.responseStart,
      domParsingTime: entry.domContentLoadedEventStart - entry.responseEnd,
      domContentLoadedTime: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      loadEventTime: entry.loadEventEnd - entry.loadEventStart,
      totalTime: entry.loadEventEnd - entry.navigationStart,
    };
    
    Object.entries(timings).forEach(([name, value]) => {
      if (value > 0) {
        PerformanceMonitor.record('navigation_timing', name, value, {
          navigationType: entry.type,
          redirectCount: entry.redirectCount,
          transferSize: entry.transferSize,
          encodedBodySize: entry.encodedBodySize,
          decodedBodySize: entry.decodedBodySize,
        });
      }
    });
  }

  /**
   * Record resource timing details
   */
  recordResourceTiming(entry) {
    const duration = entry.responseEnd - entry.startTime;
    const resourceType = this.getResourceType(entry.name);
    
    PerformanceMonitor.recordResource(
      resourceType,
      entry.name,
      duration,
      entry.transferSize,
      {
        initiatorType: entry.initiatorType,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
        decodedBodySize: entry.decodedBodySize,
        redirectTime: entry.redirectEnd - entry.redirectStart,
        dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
        connectTime: entry.connectEnd - entry.connectStart,
        requestTime: entry.responseStart - entry.requestStart,
        responseTime: entry.responseEnd - entry.responseStart,
      }
    );
  }

  /**
   * Get resource type from URL
   */
  getResourceType(url) {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
    if (url.includes('/api/')) return 'api';
    return 'other';
  }

  /**
   * Get element information for debugging
   */
  getElementInfo(element) {
    if (!element) return null;
    
    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      selector: this.getElementSelector(element),
    };
  }

  /**
   * Get CSS selector for element
   */
  getElementSelector(element) {
    if (!element) return '';
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  /**
   * Get performance rating for a vital
   */
  getRating(name, value) {
    const config = WEB_VITALS_CONFIG[name];
    if (!config) return 'unknown';
    
    if (value <= config.thresholds.good) return 'good';
    if (value <= config.thresholds.needs_improvement) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Dispatch custom event for vital measurement
   */
  dispatchVitalEvent(vital) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('webvital', {
        detail: vital,
      }));
    }
  }

  /**
   * Setup page visibility change handler
   */
  setupVisibilityHandler() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          // Record final values when page becomes hidden
          this.recordFinalValues();
        }
      });
    }
  }

  /**
   * Record final values before page unload
   */
  recordFinalValues() {
    // CLS final value
    if (this.vitals.has('CLS')) {
      const cls = this.vitals.get('CLS');
      PerformanceMonitor.record(METRIC_TYPES.WEB_VITAL, 'CLS_FINAL', cls.value, {
        ...cls.metadata,
        final: true,
      });
    }
    
    // Record current memory usage
    PerformanceMonitor.recordMemory({ event: 'page_hidden' });
  }

  /**
   * Get all recorded vitals
   */
  getVitals() {
    return Array.from(this.vitals.values());
  }

  /**
   * Get specific vital
   */
  getVital(name) {
    return this.vitals.get(name);
  }

  /**
   * Get vitals summary
   */
  getSummary() {
    const vitals = this.getVitals();
    const summary = {};
    
    vitals.forEach(vital => {
      summary[vital.name] = {
        value: vital.value,
        rating: vital.rating,
        timestamp: vital.timestamp,
        config: WEB_VITALS_CONFIG[vital.name],
      };
    });
    
    return summary;
  }

  /**
   * Check if all core vitals are measured
   */
  hasAllCoreVitals() {
    return ['LCP', 'FID', 'CLS'].every(vital => this.vitals.has(vital));
  }

  /**
   * Get core vitals score (0-100)
   */
  getCoreVitalsScore() {
    const coreVitals = ['LCP', 'FID', 'CLS'];
    let score = 0;
    let measured = 0;
    
    coreVitals.forEach(vitalName => {
      const vital = this.vitals.get(vitalName);
      if (vital) {
        measured++;
        if (vital.rating === 'good') score += 100;
        else if (vital.rating === 'needs-improvement') score += 50;
        // 'poor' adds 0
      }
    });
    
    return measured > 0 ? Math.round(score / measured) : 0;
  }

  /**
   * Disconnect all observers
   */
  disconnect() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Error disconnecting observer:', error);
      }
    });
    this.observers.clear();
  }
}

// Global instance
let webVitalsMonitor = null;

/**
 * Initialize Web Vitals monitoring
 */
export const initWebVitals = () => {
  if (!webVitalsMonitor) {
    webVitalsMonitor = new WebVitalsMonitor();
  }
  return webVitalsMonitor;
};

/**
 * Get Web Vitals instance
 */
export const getWebVitals = () => {
  return webVitalsMonitor || initWebVitals();
};

/**
 * Add Web Vitals event listener
 */
export const onWebVital = (callback) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('webvital', (event) => {
      callback(event.detail);
    });
  }
};

/**
 * Get current Web Vitals summary
 */
export const getWebVitalsSummary = () => {
  const monitor = getWebVitals();
  return monitor.getSummary();
};

/**
 * Get Core Web Vitals score
 */
export const getCoreWebVitalsScore = () => {
  const monitor = getWebVitals();
  return monitor.getCoreVitalsScore();
};

export { WEB_VITALS_CONFIG };
export default WebVitalsMonitor;