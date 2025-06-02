// frontend/src/utils/performanceMonitoring.js

import { isCategoryAllowed, COOKIE_CATEGORIES } from './cookieConsent';

/**
 * Comprehensive Performance Monitoring System
 * 
 * Tracks and analyzes application performance metrics including:
 * - Web Vitals (LCP, FID, CLS, TTFB, FCP)
 * - Component render performance
 * - API response times
 * - Memory usage
 * - Resource loading
 * - User interactions
 * 
 * Respects user cookie consent for performance and analytics data collection.
 */

/**
 * Performance metric types
 */
export const METRIC_TYPES = {
  WEB_VITAL: 'web_vital',
  COMPONENT: 'component',
  API: 'api',
  NAVIGATION: 'navigation',
  RESOURCE: 'resource',
  INTERACTION: 'interaction',
  MEMORY: 'memory',
  BUNDLE: 'bundle',
};

/**
 * Performance thresholds for classification
 */
export const PERFORMANCE_THRESHOLDS = {
  WEB_VITALS: {
    LCP: { good: 2500, needs_improvement: 4000 },
    FID: { good: 100, needs_improvement: 300 },
    CLS: { good: 0.1, needs_improvement: 0.25 },
    TTFB: { good: 800, needs_improvement: 1800 },
    FCP: { good: 1800, needs_improvement: 3000 },
  },
  API: {
    fast: 200,
    slow: 1000,
    timeout: 5000,
  },
  COMPONENT: {
    fast: 16, // 60fps = 16ms per frame
    slow: 50,
    very_slow: 100,
  },
  MEMORY: {
    low: 50 * 1024 * 1024, // 50MB
    high: 100 * 1024 * 1024, // 100MB
    critical: 200 * 1024 * 1024, // 200MB
  },
};

/**
 * Performance data storage and management
 */
class PerformanceStore {
  constructor() {
    this.metrics = new Map();
    this.sessions = new Map();
    this.watchers = new Set();
    this.currentSession = this.createSession();
    this.bufferSize = 1000; // Keep last 1000 metrics
    this.flushInterval = 30000; // Flush every 30 seconds
    
    this.initializeStorage();
    this.startPeriodicFlush();
  }

  /**
   * Initialize performance storage
   */
  initializeStorage() {
    try {
      const stored = localStorage.getItem('performance_metrics');
      if (stored) {
        const data = JSON.parse(stored);
        this.loadStoredMetrics(data);
      }
    } catch (error) {
      console.warn('Failed to load stored performance metrics:', error);
    }
  }

  /**
   * Create new performance session
   */
  createSession() {
    const session = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      startTime: performance.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      connection: this.getConnectionInfo(),
      metrics: new Map(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Get connection information
   */
  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData,
      };
    }
    return null;
  }

  /**
   * Store performance metric
   */
  storeMetric(metric) {
    const enhancedMetric = {
      ...metric,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      timestamp: Date.now(),
      sessionId: this.currentSession.id,
      url: window.location.href,
      performance: {
        timing: performance.timing,
        navigation: performance.navigation,
        memory: this.getMemoryInfo(),
      },
    };

    // Store in current session
    this.currentSession.metrics.set(enhancedMetric.id, enhancedMetric);
    
    // Store in global metrics
    this.metrics.set(enhancedMetric.id, enhancedMetric);
    
    // Maintain buffer size
    this.pruneMetrics();
    
    // Notify watchers
    this.notifyWatchers(enhancedMetric);
    
    return enhancedMetric;
  }

  /**
   * Get memory information
   */
  getMemoryInfo() {
    if ('memory' in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Prune old metrics to maintain buffer size
   */
  pruneMetrics() {
    if (this.metrics.size > this.bufferSize) {
      const sortedEntries = Array.from(this.metrics.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = sortedEntries.slice(0, this.metrics.size - this.bufferSize);
      toRemove.forEach(([id]) => this.metrics.delete(id));
    }
  }

  /**
   * Add performance watcher
   */
  addWatcher(callback) {
    this.watchers.add(callback);
    return () => this.watchers.delete(callback);
  }

  /**
   * Notify watchers of new metrics
   */
  notifyWatchers(metric) {
    this.watchers.forEach(callback => {
      try {
        callback(metric);
      } catch (error) {
        console.warn('Performance watcher error:', error);
      }
    });
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type) {
    return Array.from(this.metrics.values()).filter(m => m.type === type);
  }

  /**
   * Get metrics by time range
   */
  getMetricsByTimeRange(startTime, endTime) {
    return Array.from(this.metrics.values()).filter(
      m => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const metrics = Array.from(this.metrics.values());
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;
    
    const recentMetrics = metrics.filter(m => m.timestamp >= lastHour);
    
    return {
      total: metrics.length,
      recent: recentMetrics.length,
      byType: this.groupByType(metrics),
      recentByType: this.groupByType(recentMetrics),
      sessions: this.sessions.size,
      currentSession: this.currentSession.id,
      timeRange: {
        start: metrics.length > 0 ? Math.min(...metrics.map(m => m.timestamp)) : now,
        end: now,
      },
    };
  }

  /**
   * Group metrics by type
   */
  groupByType(metrics) {
    const grouped = {};
    metrics.forEach(metric => {
      if (!grouped[metric.type]) {
        grouped[metric.type] = [];
      }
      grouped[metric.type].push(metric);
    });
    return grouped;
  }

  /**
   * Start periodic flush to storage
   */
  startPeriodicFlush() {
    setInterval(() => {
      this.flushToStorage();
    }, this.flushInterval);
  }

  /**
   * Flush metrics to localStorage
   */
  flushToStorage() {
    try {
      const data = {
        sessions: Array.from(this.sessions.entries()),
        metrics: Array.from(this.metrics.entries()).slice(-100), // Keep last 100
        timestamp: Date.now(),
      };
      
      localStorage.setItem('performance_metrics', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to flush performance metrics:', error);
    }
  }

  /**
   * Load stored metrics
   */
  loadStoredMetrics(data) {
    try {
      if (data.metrics) {
        data.metrics.forEach(([id, metric]) => {
          this.metrics.set(id, metric);
        });
      }
      
      if (data.sessions) {
        data.sessions.forEach(([id, session]) => {
          this.sessions.set(id, session);
        });
      }
    } catch (error) {
      console.warn('Failed to load stored metrics:', error);
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics.clear();
    this.sessions.clear();
    this.currentSession = this.createSession();
    localStorage.removeItem('performance_metrics');
  }
}

// Global performance store
const performanceStore = new PerformanceStore();

/**
 * Performance monitoring utilities
 */
export class PerformanceMonitor {
  /**
   * Record a performance metric
   */
  static record(type, name, value, metadata = {}) {
    // Check cookie consent before recording performance data
    const canCollectPerformance = isCategoryAllowed(COOKIE_CATEGORIES.PERFORMANCE);
    const canCollectAnalytics = isCategoryAllowed(COOKIE_CATEGORIES.ANALYTICS);
    
    // Only record if appropriate consent is given
    if (!canCollectPerformance && !canCollectAnalytics) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance metric skipped - no consent: ${type}:${name}`);
      }
      return null;
    }

    const metric = {
      type,
      name,
      value,
      metadata: canCollectAnalytics ? metadata : {}, // Only include metadata if analytics allowed
      classification: this.classifyMetric(type, name, value),
      timestamp: Date.now(),
      consentLevel: {
        performance: canCollectPerformance,
        analytics: canCollectAnalytics,
      },
    };

    return performanceStore.storeMetric(metric);
  }

  /**
   * Classify metric performance
   */
  static classifyMetric(type, name, value) {
    const thresholds = PERFORMANCE_THRESHOLDS[type.toUpperCase()];
    if (!thresholds) return 'unknown';

    if (type === METRIC_TYPES.WEB_VITAL) {
      const vitalThresholds = thresholds[name.toUpperCase()];
      if (vitalThresholds) {
        if (value <= vitalThresholds.good) return 'good';
        if (value <= vitalThresholds.needs_improvement) return 'needs_improvement';
        return 'poor';
      }
    }

    if (type === METRIC_TYPES.API) {
      if (value <= thresholds.fast) return 'fast';
      if (value <= thresholds.slow) return 'slow';
      return 'very_slow';
    }

    if (type === METRIC_TYPES.COMPONENT) {
      if (value <= thresholds.fast) return 'fast';
      if (value <= thresholds.slow) return 'slow';
      return 'very_slow';
    }

    return 'unknown';
  }

  /**
   * Start timing a performance measurement
   */
  static startTiming(name) {
    const startTime = performance.now();
    return {
      end: (metadata = {}) => {
        const duration = performance.now() - startTime;
        return this.record(METRIC_TYPES.COMPONENT, name, duration, {
          ...metadata,
          startTime,
          endTime: performance.now(),
        });
      },
    };
  }

  /**
   * Measure function execution time
   */
  static async measureAsync(name, fn, metadata = {}) {
    const timer = this.startTiming(name);
    try {
      const result = await fn();
      timer.end({ ...metadata, success: true });
      return result;
    } catch (error) {
      timer.end({ ...metadata, success: false, error: error.message });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution
   */
  static measure(name, fn, metadata = {}) {
    const timer = this.startTiming(name);
    try {
      const result = fn();
      timer.end({ ...metadata, success: true });
      return result;
    } catch (error) {
      timer.end({ ...metadata, success: false, error: error.message });
      throw error;
    }
  }

  /**
   * Record API performance
   */
  static recordApi(method, url, duration, status, metadata = {}) {
    return this.record(METRIC_TYPES.API, `${method} ${url}`, duration, {
      ...metadata,
      method,
      url,
      status,
    });
  }

  /**
   * Record navigation performance
   */
  static recordNavigation(from, to, duration, metadata = {}) {
    return this.record(METRIC_TYPES.NAVIGATION, `${from} -> ${to}`, duration, {
      ...metadata,
      from,
      to,
    });
  }

  /**
   * Record resource loading performance
   */
  static recordResource(type, name, duration, size = null, metadata = {}) {
    return this.record(METRIC_TYPES.RESOURCE, `${type}:${name}`, duration, {
      ...metadata,
      resourceType: type,
      resourceName: name,
      size,
    });
  }

  /**
   * Record user interaction performance
   */
  static recordInteraction(type, target, duration, metadata = {}) {
    return this.record(METRIC_TYPES.INTERACTION, `${type}:${target}`, duration, {
      ...metadata,
      interactionType: type,
      target,
    });
  }

  /**
   * Record memory usage
   */
  static recordMemory(metadata = {}) {
    const memoryInfo = performanceStore.getMemoryInfo();
    if (memoryInfo) {
      return this.record(METRIC_TYPES.MEMORY, 'heap_usage', memoryInfo.usedJSHeapSize, {
        ...metadata,
        ...memoryInfo,
      });
    }
    return null;
  }

  /**
   * Get performance analytics
   */
  static getAnalytics() {
    const summary = performanceStore.getSummary();
    const metrics = Array.from(performanceStore.metrics.values());
    
    return {
      summary,
      webVitals: this.analyzeWebVitals(metrics),
      api: this.analyzeApiPerformance(metrics),
      components: this.analyzeComponentPerformance(metrics),
      memory: this.analyzeMemoryUsage(metrics),
      trends: this.analyzeTrends(metrics),
      recommendations: this.generateRecommendations(metrics),
    };
  }

  /**
   * Analyze Web Vitals
   */
  static analyzeWebVitals(metrics) {
    const webVitalMetrics = metrics.filter(m => m.type === METRIC_TYPES.WEB_VITAL);
    const analysis = {};

    ['LCP', 'FID', 'CLS', 'TTFB', 'FCP'].forEach(vital => {
      const vitalMetrics = webVitalMetrics.filter(m => m.name === vital);
      if (vitalMetrics.length > 0) {
        const values = vitalMetrics.map(m => m.value);
        analysis[vital] = {
          count: values.length,
          latest: values[values.length - 1],
          average: values.reduce((a, b) => a + b, 0) / values.length,
          median: this.calculateMedian(values),
          p95: this.calculatePercentile(values, 95),
          trend: this.calculateTrend(vitalMetrics),
          classification: this.classifyMetric(METRIC_TYPES.WEB_VITAL, vital, values[values.length - 1]),
        };
      }
    });

    return analysis;
  }

  /**
   * Analyze API performance
   */
  static analyzeApiPerformance(metrics) {
    const apiMetrics = metrics.filter(m => m.type === METRIC_TYPES.API);
    const grouped = {};

    apiMetrics.forEach(metric => {
      const key = `${metric.metadata.method} ${metric.metadata.url}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(metric);
    });

    const analysis = {};
    Object.entries(grouped).forEach(([endpoint, endpointMetrics]) => {
      const values = endpointMetrics.map(m => m.value);
      const errors = endpointMetrics.filter(m => !m.metadata.success || m.metadata.status >= 400);
      
      analysis[endpoint] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        median: this.calculateMedian(values),
        p95: this.calculatePercentile(values, 95),
        errorRate: (errors.length / values.length) * 100,
        trend: this.calculateTrend(endpointMetrics),
        latest: endpointMetrics[endpointMetrics.length - 1],
      };
    });

    return analysis;
  }

  /**
   * Analyze component performance
   */
  static analyzeComponentPerformance(metrics) {
    const componentMetrics = metrics.filter(m => m.type === METRIC_TYPES.COMPONENT);
    const grouped = {};

    componentMetrics.forEach(metric => {
      if (!grouped[metric.name]) {
        grouped[metric.name] = [];
      }
      grouped[metric.name].push(metric);
    });

    const analysis = {};
    Object.entries(grouped).forEach(([component, componentMetrics]) => {
      const values = componentMetrics.map(m => m.value);
      
      analysis[component] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        median: this.calculateMedian(values),
        p95: this.calculatePercentile(values, 95),
        slowCount: values.filter(v => v > PERFORMANCE_THRESHOLDS.COMPONENT.slow).length,
        trend: this.calculateTrend(componentMetrics),
        classification: this.classifyMetric(METRIC_TYPES.COMPONENT, component, values[values.length - 1]),
      };
    });

    return analysis;
  }

  /**
   * Analyze memory usage
   */
  static analyzeMemoryUsage(metrics) {
    const memoryMetrics = metrics.filter(m => m.type === METRIC_TYPES.MEMORY);
    if (memoryMetrics.length === 0) return null;

    const values = memoryMetrics.map(m => m.value);
    const latest = memoryMetrics[memoryMetrics.length - 1];
    
    return {
      count: values.length,
      current: latest.value,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      peak: Math.max(...values),
      trend: this.calculateTrend(memoryMetrics),
      heapInfo: latest.metadata,
      classification: this.classifyMemoryUsage(latest.value),
    };
  }

  /**
   * Classify memory usage
   */
  static classifyMemoryUsage(value) {
    const thresholds = PERFORMANCE_THRESHOLDS.MEMORY;
    if (value <= thresholds.low) return 'low';
    if (value <= thresholds.high) return 'normal';
    if (value <= thresholds.critical) return 'high';
    return 'critical';
  }

  /**
   * Analyze performance trends
   */
  static analyzeTrends(metrics) {
    const now = Date.now();
    const periods = {
      '1h': now - 60 * 60 * 1000,
      '6h': now - 6 * 60 * 60 * 1000,
      '24h': now - 24 * 60 * 60 * 1000,
    };

    const trends = {};
    Object.entries(periods).forEach(([period, startTime]) => {
      const periodMetrics = metrics.filter(m => m.timestamp >= startTime);
      trends[period] = {
        total: periodMetrics.length,
        webVitals: periodMetrics.filter(m => m.type === METRIC_TYPES.WEB_VITAL).length,
        api: periodMetrics.filter(m => m.type === METRIC_TYPES.API).length,
        components: periodMetrics.filter(m => m.type === METRIC_TYPES.COMPONENT).length,
        errors: periodMetrics.filter(m => m.metadata.success === false).length,
      };
    });

    return trends;
  }

  /**
   * Generate performance recommendations
   */
  static generateRecommendations(metrics) {
    const recommendations = [];
    const analysis = this.getAnalytics();

    // API recommendations
    Object.entries(analysis.api).forEach(([endpoint, data]) => {
      if (data.average > PERFORMANCE_THRESHOLDS.API.slow) {
        recommendations.push({
          type: 'api',
          severity: 'high',
          message: `API endpoint "${endpoint}" is slow (${data.average.toFixed(0)}ms average)`,
          suggestion: 'Consider optimizing database queries, adding caching, or implementing pagination',
        });
      }
      if (data.errorRate > 5) {
        recommendations.push({
          type: 'api',
          severity: 'high',
          message: `API endpoint "${endpoint}" has high error rate (${data.errorRate.toFixed(1)}%)`,
          suggestion: 'Check error logs and implement better error handling',
        });
      }
    });

    // Component recommendations
    Object.entries(analysis.components).forEach(([component, data]) => {
      if (data.average > PERFORMANCE_THRESHOLDS.COMPONENT.slow) {
        recommendations.push({
          type: 'component',
          severity: 'medium',
          message: `Component "${component}" is slow to render (${data.average.toFixed(0)}ms average)`,
          suggestion: 'Consider memoization, code splitting, or virtualization',
        });
      }
    });

    // Memory recommendations
    if (analysis.memory && analysis.memory.classification === 'high') {
      recommendations.push({
        type: 'memory',
        severity: 'high',
        message: `High memory usage detected (${(analysis.memory.current / 1024 / 1024).toFixed(0)}MB)`,
        suggestion: 'Check for memory leaks, optimize data structures, or implement cleanup',
      });
    }

    // Web Vitals recommendations
    Object.entries(analysis.webVitals).forEach(([vital, data]) => {
      if (data.classification === 'poor') {
        recommendations.push({
          type: 'web_vital',
          severity: 'high',
          message: `Poor ${vital} score (${data.latest})`,
          suggestion: this.getWebVitalSuggestion(vital),
        });
      }
    });

    return recommendations.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Get Web Vital optimization suggestions
   */
  static getWebVitalSuggestion(vital) {
    const suggestions = {
      LCP: 'Optimize images, preload key resources, reduce server response times',
      FID: 'Minimize JavaScript execution time, code splitting, web workers',
      CLS: 'Set image dimensions, avoid dynamic content insertion, use transform animations',
      TTFB: 'Optimize server response times, use CDN, implement caching',
      FCP: 'Optimize critical rendering path, inline critical CSS, preload fonts',
    };
    return suggestions[vital] || 'Review performance best practices';
  }

  /**
   * Calculate statistical functions
   */
  static calculateMedian(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  }

  static calculatePercentile(values, percentile) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  static calculateTrend(metrics) {
    if (metrics.length < 2) return 'stable';
    
    const recent = metrics.slice(-5);
    const older = metrics.slice(-10, -5);
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, m) => sum + m.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, m) => sum + m.value, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 10) return 'improving';
    if (change < -10) return 'degrading';
    return 'stable';
  }

  /**
   * Add performance watcher
   */
  static addWatcher(callback) {
    return performanceStore.addWatcher(callback);
  }

  /**
   * Clear all performance data
   */
  static clear() {
    performanceStore.clear();
  }

  /**
   * Export performance data
   */
  static export() {
    return {
      summary: performanceStore.getSummary(),
      analytics: this.getAnalytics(),
      rawMetrics: Array.from(performanceStore.metrics.values()),
      sessions: Array.from(performanceStore.sessions.values()),
    };
  }
}

export { performanceStore };
export default PerformanceMonitor;