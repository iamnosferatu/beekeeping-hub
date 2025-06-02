// frontend/src/utils/performanceOptimizer.js

/**
 * Performance Optimization Engine
 * 
 * Analyzes performance data and provides actionable optimization suggestions
 * for improving application performance across different metrics.
 */

import PerformanceMonitor from './performanceMonitoring';
import { getWebVitalsSummary, getCoreWebVitalsScore } from './webVitalsMonitor';

/**
 * Optimization categories
 */
export const OPTIMIZATION_CATEGORIES = {
  WEB_VITALS: 'web_vitals',
  API: 'api',
  COMPONENTS: 'components',
  MEMORY: 'memory',
  BUNDLE: 'bundle',
  IMAGES: 'images',
  CACHING: 'caching',
  NETWORK: 'network',
};

/**
 * Severity levels for optimization suggestions
 */
export const OPTIMIZATION_SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Performance Optimization Engine
 */
export class PerformanceOptimizer {
  constructor() {
    this.rules = new Map();
    this.setupOptimizationRules();
  }

  /**
   * Setup optimization rules
   */
  setupOptimizationRules() {
    // Web Vitals optimization rules
    this.addRule(OPTIMIZATION_CATEGORIES.WEB_VITALS, {
      name: 'LCP Optimization',
      condition: (data) => data.webVitals?.LCP?.value > 2500,
      severity: OPTIMIZATION_SEVERITY.HIGH,
      message: 'Largest Contentful Paint is slower than recommended',
      suggestions: [
        'Optimize and compress images',
        'Preload critical resources',
        'Remove unused CSS and JavaScript',
        'Use a Content Delivery Network (CDN)',
        'Optimize server response times',
        'Implement resource hints (preload, prefetch)',
      ],
      impact: 'User Experience',
      effort: 'Medium',
    });

    this.addRule(OPTIMIZATION_CATEGORIES.WEB_VITALS, {
      name: 'FID Optimization',
      condition: (data) => data.webVitals?.FID?.value > 100,
      severity: OPTIMIZATION_SEVERITY.HIGH,
      message: 'First Input Delay is higher than recommended',
      suggestions: [
        'Reduce JavaScript execution time',
        'Break up long-running tasks',
        'Use code splitting and lazy loading',
        'Implement web workers for heavy computations',
        'Defer non-critical JavaScript',
        'Optimize third-party scripts',
      ],
      impact: 'Interactivity',
      effort: 'High',
    });

    this.addRule(OPTIMIZATION_CATEGORIES.WEB_VITALS, {
      name: 'CLS Optimization',
      condition: (data) => data.webVitals?.CLS?.value > 0.1,
      severity: OPTIMIZATION_SEVERITY.MEDIUM,
      message: 'Cumulative Layout Shift is higher than recommended',
      suggestions: [
        'Set explicit width and height for images and videos',
        'Reserve space for dynamic content',
        'Avoid inserting content above existing content',
        'Use CSS aspect-ratio for responsive media',
        'Preload custom fonts',
        'Use transform instead of changing layout properties',
      ],
      impact: 'Visual Stability',
      effort: 'Medium',
    });

    // API optimization rules
    this.addRule(OPTIMIZATION_CATEGORIES.API, {
      name: 'Slow API Endpoints',
      condition: (data) => this.hasSlowApiEndpoints(data.analytics?.api),
      severity: OPTIMIZATION_SEVERITY.HIGH,
      message: 'Some API endpoints are responding slowly',
      suggestions: [
        'Implement caching strategies',
        'Add database indexing',
        'Optimize database queries',
        'Use pagination for large datasets',
        'Implement request deduplication',
        'Consider API response compression',
      ],
      impact: 'Loading Performance',
      effort: 'Medium',
    });

    this.addRule(OPTIMIZATION_CATEGORIES.API, {
      name: 'High API Error Rate',
      condition: (data) => this.hasHighApiErrorRate(data.analytics?.api),
      severity: OPTIMIZATION_SEVERITY.CRITICAL,
      message: 'Some API endpoints have high error rates',
      suggestions: [
        'Implement proper error handling',
        'Add retry mechanisms with exponential backoff',
        'Monitor and fix server errors',
        'Implement circuit breaker patterns',
        'Add request validation',
        'Monitor third-party service dependencies',
      ],
      impact: 'Reliability',
      effort: 'High',
    });

    // Component optimization rules
    this.addRule(OPTIMIZATION_CATEGORIES.COMPONENTS, {
      name: 'Slow Component Renders',
      condition: (data) => this.hasSlowComponents(data.analytics?.components),
      severity: OPTIMIZATION_SEVERITY.MEDIUM,
      message: 'Some components are rendering slowly',
      suggestions: [
        'Implement React.memo for pure components',
        'Use useMemo and useCallback for expensive calculations',
        'Implement virtualization for large lists',
        'Split large components into smaller ones',
        'Optimize re-rendering patterns',
        'Remove unnecessary dependencies from useEffect',
      ],
      impact: 'User Interface Responsiveness',
      effort: 'Medium',
    });

    // Memory optimization rules
    this.addRule(OPTIMIZATION_CATEGORIES.MEMORY, {
      name: 'High Memory Usage',
      condition: (data) => this.hasHighMemoryUsage(data.memory),
      severity: OPTIMIZATION_SEVERITY.HIGH,
      message: 'Application is using excessive memory',
      suggestions: [
        'Check for memory leaks in components',
        'Implement proper cleanup in useEffect',
        'Optimize image and data caching',
        'Use object pooling for frequently created objects',
        'Implement lazy loading for heavy components',
        'Review global state management',
      ],
      impact: 'Application Stability',
      effort: 'High',
    });

    this.addRule(OPTIMIZATION_CATEGORIES.MEMORY, {
      name: 'Memory Leak Detection',
      condition: (data) => data.memory?.leakDetected,
      severity: OPTIMIZATION_SEVERITY.CRITICAL,
      message: 'Potential memory leak detected',
      suggestions: [
        'Review event listeners for proper cleanup',
        'Check for circular references',
        'Ensure timers and intervals are cleared',
        'Review global variable usage',
        'Implement proper component unmounting',
        'Use Chrome DevTools to identify leak sources',
      ],
      impact: 'Application Stability',
      effort: 'High',
    });

    // Bundle optimization rules
    this.addRule(OPTIMIZATION_CATEGORIES.BUNDLE, {
      name: 'Large Bundle Size',
      condition: (data) => this.hasLargeBundleSize(data),
      severity: OPTIMIZATION_SEVERITY.MEDIUM,
      message: 'Application bundle size is large',
      suggestions: [
        'Implement code splitting',
        'Use dynamic imports for routes',
        'Remove unused dependencies',
        'Optimize third-party libraries',
        'Use tree shaking',
        'Implement bundle analysis',
      ],
      impact: 'Loading Performance',
      effort: 'Medium',
    });

    // Network optimization rules
    this.addRule(OPTIMIZATION_CATEGORIES.NETWORK, {
      name: 'Too Many Network Requests',
      condition: (data) => this.hasTooManyRequests(data),
      severity: OPTIMIZATION_SEVERITY.MEDIUM,
      message: 'Application is making too many network requests',
      suggestions: [
        'Implement request batching',
        'Use GraphQL for efficient data fetching',
        'Implement proper caching strategies',
        'Combine multiple API calls',
        'Use service workers for offline caching',
        'Implement request deduplication',
      ],
      impact: 'Loading Performance',
      effort: 'Medium',
    });
  }

  /**
   * Add optimization rule
   */
  addRule(category, rule) {
    if (!this.rules.has(category)) {
      this.rules.set(category, []);
    }
    this.rules.get(category).push(rule);
  }

  /**
   * Analyze performance data and generate suggestions
   */
  analyze(performanceData = null) {
    const data = performanceData || this.gatherPerformanceData();
    const suggestions = [];

    // Check all rules against the data
    for (const [category, rules] of this.rules) {
      for (const rule of rules) {
        try {
          if (rule.condition(data)) {
            suggestions.push({
              id: `${category}_${rule.name.replace(/\s+/g, '_').toLowerCase()}`,
              category,
              name: rule.name,
              severity: rule.severity,
              message: rule.message,
              suggestions: rule.suggestions,
              impact: rule.impact,
              effort: rule.effort,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          console.warn(`Error checking optimization rule ${rule.name}:`, error);
        }
      }
    }

    // Sort by severity
    return this.sortBySeverity(suggestions);
  }

  /**
   * Gather current performance data
   */
  gatherPerformanceData() {
    const analytics = PerformanceMonitor.getAnalytics();
    const webVitals = getWebVitalsSummary();
    const coreScore = getCoreWebVitalsScore();

    return {
      analytics,
      webVitals,
      coreScore,
      memory: this.getMemoryData(),
      network: this.getNetworkData(),
      bundle: this.getBundleData(),
    };
  }

  /**
   * Get memory data
   */
  getMemoryData() {
    if (!('memory' in performance)) return null;

    const memoryInfo = performance.memory;
    return {
      used: memoryInfo.usedJSHeapSize,
      total: memoryInfo.totalJSHeapSize,
      limit: memoryInfo.jsHeapSizeLimit,
      usagePercent: (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100,
    };
  }

  /**
   * Get network data
   */
  getNetworkData() {
    const analytics = PerformanceMonitor.getAnalytics();
    const apiData = analytics?.api || {};
    
    return {
      totalRequests: Object.values(apiData).reduce((sum, api) => sum + (api.count || 0), 0),
      averageResponseTime: this.calculateAverageResponseTime(apiData),
      errorRate: this.calculateOverallErrorRate(apiData),
    };
  }

  /**
   * Get bundle data (estimated)
   */
  getBundleData() {
    // This is a simplified estimation
    // In a real implementation, you'd get this from build tools
    return {
      estimatedSize: this.estimateBundleSize(),
      chunkCount: this.estimateChunkCount(),
    };
  }

  /**
   * Helper methods for rule conditions
   */
  hasSlowApiEndpoints(apiData) {
    if (!apiData) return false;
    return Object.values(apiData).some(api => api.average > 1000);
  }

  hasHighApiErrorRate(apiData) {
    if (!apiData) return false;
    return Object.values(apiData).some(api => (api.errorRate || 0) > 5);
  }

  hasSlowComponents(componentData) {
    if (!componentData) return false;
    return Object.values(componentData).some(comp => comp.average > 50);
  }

  hasHighMemoryUsage(memoryData) {
    if (!memoryData) return false;
    return memoryData.usagePercent > 70;
  }

  hasLargeBundleSize(data) {
    const bundleData = data.bundle;
    if (!bundleData) return false;
    return bundleData.estimatedSize > 5 * 1024 * 1024; // 5MB
  }

  hasTooManyRequests(data) {
    const networkData = data.network;
    if (!networkData) return false;
    return networkData.totalRequests > 100; // More than 100 requests
  }

  /**
   * Calculate average response time across all APIs
   */
  calculateAverageResponseTime(apiData) {
    const values = Object.values(apiData);
    if (values.length === 0) return 0;
    
    const totalTime = values.reduce((sum, api) => sum + (api.average || 0), 0);
    return totalTime / values.length;
  }

  /**
   * Calculate overall error rate
   */
  calculateOverallErrorRate(apiData) {
    const values = Object.values(apiData);
    if (values.length === 0) return 0;
    
    const totalErrorRate = values.reduce((sum, api) => sum + (api.errorRate || 0), 0);
    return totalErrorRate / values.length;
  }

  /**
   * Estimate bundle size (simplified)
   */
  estimateBundleSize() {
    // This is a rough estimation based on script tags
    const scripts = document.querySelectorAll('script[src]');
    return scripts.length * 200 * 1024; // Rough estimate: 200KB per script
  }

  /**
   * Estimate chunk count
   */
  estimateChunkCount() {
    const scripts = document.querySelectorAll('script[src*="chunk"]');
    return scripts.length;
  }

  /**
   * Sort suggestions by severity
   */
  sortBySeverity(suggestions) {
    const severityOrder = {
      [OPTIMIZATION_SEVERITY.CRITICAL]: 4,
      [OPTIMIZATION_SEVERITY.HIGH]: 3,
      [OPTIMIZATION_SEVERITY.MEDIUM]: 2,
      [OPTIMIZATION_SEVERITY.LOW]: 1,
    };

    return suggestions.sort((a, b) => {
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Filter suggestions by category
   */
  filterByCategory(suggestions, category) {
    return suggestions.filter(suggestion => suggestion.category === category);
  }

  /**
   * Filter suggestions by severity
   */
  filterBySeverity(suggestions, severity) {
    return suggestions.filter(suggestion => suggestion.severity === severity);
  }

  /**
   * Get prioritized action plan
   */
  getPrioritizedActionPlan(suggestions) {
    const actionPlan = {
      immediate: [], // Critical and High severity
      shortTerm: [], // Medium severity
      longTerm: [], // Low severity
    };

    suggestions.forEach(suggestion => {
      if (suggestion.severity === OPTIMIZATION_SEVERITY.CRITICAL || 
          suggestion.severity === OPTIMIZATION_SEVERITY.HIGH) {
        actionPlan.immediate.push(suggestion);
      } else if (suggestion.severity === OPTIMIZATION_SEVERITY.MEDIUM) {
        actionPlan.shortTerm.push(suggestion);
      } else {
        actionPlan.longTerm.push(suggestion);
      }
    });

    return actionPlan;
  }

  /**
   * Get performance score based on optimizations
   */
  getOptimizationScore(suggestions) {
    if (suggestions.length === 0) return 100;

    const severityWeights = {
      [OPTIMIZATION_SEVERITY.CRITICAL]: 25,
      [OPTIMIZATION_SEVERITY.HIGH]: 15,
      [OPTIMIZATION_SEVERITY.MEDIUM]: 10,
      [OPTIMIZATION_SEVERITY.LOW]: 5,
    };

    const totalDeduction = suggestions.reduce((sum, suggestion) => {
      return sum + (severityWeights[suggestion.severity] || 0);
    }, 0);

    return Math.max(0, 100 - totalDeduction);
  }

  /**
   * Generate performance report
   */
  generateReport() {
    const performanceData = this.gatherPerformanceData();
    const suggestions = this.analyze(performanceData);
    const actionPlan = this.getPrioritizedActionPlan(suggestions);
    const optimizationScore = this.getOptimizationScore(suggestions);

    return {
      timestamp: new Date().toISOString(),
      optimizationScore,
      totalSuggestions: suggestions.length,
      suggestions,
      actionPlan,
      performanceData,
      categories: this.groupByCategory(suggestions),
    };
  }

  /**
   * Group suggestions by category
   */
  groupByCategory(suggestions) {
    const grouped = {};
    
    suggestions.forEach(suggestion => {
      if (!grouped[suggestion.category]) {
        grouped[suggestion.category] = [];
      }
      grouped[suggestion.category].push(suggestion);
    });

    return grouped;
  }
}

// Global optimizer instance
const performanceOptimizer = new PerformanceOptimizer();

/**
 * Convenience functions
 */
export const analyzePerformance = () => {
  return performanceOptimizer.analyze();
};

export const generatePerformanceReport = () => {
  return performanceOptimizer.generateReport();
};

export const getOptimizationSuggestions = (category = null, severity = null) => {
  const suggestions = performanceOptimizer.analyze();
  
  let filtered = suggestions;
  if (category) {
    filtered = performanceOptimizer.filterByCategory(filtered, category);
  }
  if (severity) {
    filtered = performanceOptimizer.filterBySeverity(filtered, severity);
  }
  
  return filtered;
};

export const getPrioritizedActionPlan = () => {
  const suggestions = performanceOptimizer.analyze();
  return performanceOptimizer.getPrioritizedActionPlan(suggestions);
};

export { performanceOptimizer };
export default PerformanceOptimizer;