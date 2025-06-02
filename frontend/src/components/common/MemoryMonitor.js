// frontend/src/components/common/MemoryMonitor.js

import { useEffect, useState, useCallback } from 'react';
import PerformanceMonitor, { METRIC_TYPES } from '../../utils/performanceMonitoring';

/**
 * Memory monitoring component and utilities
 * 
 * Tracks JavaScript heap usage, detects memory leaks,
 * and provides memory optimization recommendations.
 */

/**
 * Memory monitoring hook
 */
export const useMemoryMonitor = (options = {}) => {
  const {
    interval = 30000, // 30 seconds default
    alertThreshold = 50 * 1024 * 1024, // 50MB
    criticalThreshold = 100 * 1024 * 1024, // 100MB
    onAlert = null,
    onCritical = null,
  } = options;

  const [memoryData, setMemoryData] = useState(null);
  const [memoryHistory, setMemoryHistory] = useState([]);
  const [memoryLeakDetected, setMemoryLeakDetected] = useState(false);
  const [memoryTrend, setMemoryTrend] = useState('stable');

  /**
   * Get current memory information
   */
  const getCurrentMemoryInfo = useCallback(() => {
    if (!('memory' in performance)) {
      return null;
    }

    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit,
      timestamp: Date.now(),
    };
  }, []);

  /**
   * Record memory usage
   */
  const recordMemoryUsage = useCallback((context = {}) => {
    const memoryInfo = getCurrentMemoryInfo();
    if (!memoryInfo) return null;

    // Record in performance monitoring system
    const metric = PerformanceMonitor.recordMemory({
      ...context,
      component: 'MemoryMonitor',
    });

    // Update local state
    setMemoryData(memoryInfo);

    // Add to history (keep last 100 measurements)
    setMemoryHistory(prev => {
      const newHistory = [...prev, memoryInfo].slice(-100);
      
      // Analyze trend
      if (newHistory.length >= 10) {
        const trend = analyzeMemoryTrend(newHistory);
        setMemoryTrend(trend);
        
        // Detect potential memory leaks
        if (trend === 'increasing' && newHistory.length >= 20) {
          const leak = detectMemoryLeak(newHistory);
          setMemoryLeakDetected(leak);
        }
      }
      
      return newHistory;
    });

    // Check thresholds
    if (memoryInfo.used >= criticalThreshold && onCritical) {
      onCritical(memoryInfo);
    } else if (memoryInfo.used >= alertThreshold && onAlert) {
      onAlert(memoryInfo);
    }

    return metric;
  }, [getCurrentMemoryInfo, alertThreshold, criticalThreshold, onAlert, onCritical]);

  /**
   * Start periodic monitoring
   */
  useEffect(() => {
    if (interval <= 0) return;

    // Initial measurement
    recordMemoryUsage({ event: 'monitor_start' });

    // Set up periodic measurements
    const intervalId = setInterval(() => {
      recordMemoryUsage({ event: 'periodic_check' });
    }, interval);

    return () => {
      clearInterval(intervalId);
      recordMemoryUsage({ event: 'monitor_stop' });
    };
  }, [interval, recordMemoryUsage]);

  /**
   * Force garbage collection (if available)
   */
  const forceGarbageCollection = useCallback(() => {
    if (window.gc && typeof window.gc === 'function') {
      try {
        window.gc();
        setTimeout(() => {
          recordMemoryUsage({ event: 'gc_forced' });
        }, 100);
        return true;
      } catch (error) {
        console.warn('Failed to force garbage collection:', error);
      }
    }
    return false;
  }, [recordMemoryUsage]);

  /**
   * Get memory usage percentage
   */
  const getMemoryUsagePercentage = useCallback(() => {
    if (!memoryData) return 0;
    return (memoryData.used / memoryData.limit) * 100;
  }, [memoryData]);

  /**
   * Get memory classification
   */
  const getMemoryClassification = useCallback(() => {
    if (!memoryData) return 'unknown';
    
    const used = memoryData.used;
    if (used <= 25 * 1024 * 1024) return 'low'; // < 25MB
    if (used <= 50 * 1024 * 1024) return 'normal'; // < 50MB
    if (used <= 100 * 1024 * 1024) return 'high'; // < 100MB
    return 'critical'; // >= 100MB
  }, [memoryData]);

  return {
    memoryData,
    memoryHistory,
    memoryLeakDetected,
    memoryTrend,
    recordMemoryUsage,
    forceGarbageCollection,
    getMemoryUsagePercentage,
    getMemoryClassification,
    isSupported: 'memory' in performance,
  };
};

/**
 * Analyze memory trend
 */
const analyzeMemoryTrend = (history) => {
  if (history.length < 5) return 'stable';

  const recent = history.slice(-5);
  const older = history.slice(-10, -5);

  if (older.length === 0) return 'stable';

  const recentAvg = recent.reduce((sum, item) => sum + item.used, 0) / recent.length;
  const olderAvg = older.reduce((sum, item) => sum + item.used, 0) / older.length;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (change > 10) return 'increasing';
  if (change < -10) return 'decreasing';
  return 'stable';
};

/**
 * Detect potential memory leaks
 */
const detectMemoryLeak = (history) => {
  if (history.length < 20) return false;

  // Check if memory is consistently increasing over time
  const segments = 4;
  const segmentSize = Math.floor(history.length / segments);
  const segmentAverages = [];

  for (let i = 0; i < segments; i++) {
    const start = i * segmentSize;
    const end = start + segmentSize;
    const segment = history.slice(start, end);
    const avg = segment.reduce((sum, item) => sum + item.used, 0) / segment.length;
    segmentAverages.push(avg);
  }

  // Check if each segment is higher than the previous
  let consistentIncrease = true;
  for (let i = 1; i < segmentAverages.length; i++) {
    if (segmentAverages[i] <= segmentAverages[i - 1]) {
      consistentIncrease = false;
      break;
    }
  }

  // Also check the rate of increase
  const firstSegment = segmentAverages[0];
  const lastSegment = segmentAverages[segmentAverages.length - 1];
  const increaseRate = ((lastSegment - firstSegment) / firstSegment) * 100;

  return consistentIncrease && increaseRate > 25; // 25% increase is suspicious
};

/**
 * Memory optimization utilities
 */
export const MemoryOptimizer = {
  /**
   * Get memory optimization suggestions
   */
  getSuggestions: (memoryData, history, leakDetected) => {
    const suggestions = [];

    if (!memoryData) return suggestions;

    const usageMB = memoryData.used / 1024 / 1024;
    const usagePercent = (memoryData.used / memoryData.limit) * 100;

    // High memory usage
    if (usageMB > 100) {
      suggestions.push({
        type: 'critical',
        message: `High memory usage detected (${usageMB.toFixed(0)}MB)`,
        recommendations: [
          'Check for memory leaks in components',
          'Implement component cleanup in useEffect',
          'Consider virtualizing large lists',
          'Optimize image and data caching',
        ],
      });
    }

    // Memory leak detected
    if (leakDetected) {
      suggestions.push({
        type: 'warning',
        message: 'Potential memory leak detected',
        recommendations: [
          'Review event listeners for proper cleanup',
          'Check for circular references',
          'Ensure timers and intervals are cleared',
          'Review global variable usage',
        ],
      });
    }

    // High memory percentage
    if (usagePercent > 80) {
      suggestions.push({
        type: 'warning',
        message: `Memory usage is ${usagePercent.toFixed(0)}% of limit`,
        recommendations: [
          'Close unused browser tabs',
          'Refresh the page to clear memory',
          'Consider code splitting for large components',
        ],
      });
    }

    // Rapid memory growth
    if (history.length >= 10) {
      const trend = analyzeMemoryTrend(history);
      if (trend === 'increasing') {
        suggestions.push({
          type: 'info',
          message: 'Memory usage is steadily increasing',
          recommendations: [
            'Monitor for potential memory leaks',
            'Review recent feature additions',
            'Consider implementing lazy loading',
          ],
        });
      }
    }

    return suggestions;
  },

  /**
   * Format memory size for display
   */
  formatSize: (bytes) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  },

  /**
   * Get memory health status
   */
  getHealthStatus: (memoryData) => {
    if (!memoryData) return { status: 'unknown', color: 'secondary' };

    const usageMB = memoryData.used / 1024 / 1024;
    const usagePercent = (memoryData.used / memoryData.limit) * 100;

    if (usageMB > 100 || usagePercent > 90) {
      return { status: 'critical', color: 'danger', message: 'High memory usage' };
    }
    
    if (usageMB > 50 || usagePercent > 70) {
      return { status: 'warning', color: 'warning', message: 'Elevated memory usage' };
    }
    
    if (usageMB > 25 || usagePercent > 50) {
      return { status: 'normal', color: 'info', message: 'Normal memory usage' };
    }
    
    return { status: 'good', color: 'success', message: 'Low memory usage' };
  },
};

/**
 * Memory monitoring component
 */
export const MemoryMonitorDisplay = ({ 
  showDetails = false, 
  showHistory = false,
  interval = 30000,
  onAlert = null,
}) => {
  const {
    memoryData,
    memoryHistory,
    memoryLeakDetected,
    memoryTrend,
    forceGarbageCollection,
    getMemoryUsagePercentage,
    getMemoryClassification,
    isSupported,
  } = useMemoryMonitor({
    interval,
    onAlert,
    onCritical: (data) => {
      console.warn('Critical memory usage detected:', data);
      if (onAlert) onAlert(data);
    },
  });

  if (!isSupported) {
    return null;
  }

  const healthStatus = MemoryOptimizer.getHealthStatus(memoryData);
  const suggestions = MemoryOptimizer.getSuggestions(memoryData, memoryHistory, memoryLeakDetected);

  return {
    memoryData,
    memoryHistory,
    memoryLeakDetected,
    memoryTrend,
    healthStatus,
    suggestions,
    forceGarbageCollection,
    getMemoryUsagePercentage,
    getMemoryClassification,
    formatSize: MemoryOptimizer.formatSize,
  };
};

export default useMemoryMonitor;