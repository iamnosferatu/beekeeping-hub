// frontend/src/hooks/usePerformanceTracking.js

import { useEffect, useRef, useCallback, useState } from 'react';
import PerformanceMonitor, { METRIC_TYPES } from '../utils/performanceMonitoring';
import { getWebVitals } from '../utils/webVitalsMonitor';

/**
 * Hook for tracking component performance
 * 
 * Provides comprehensive performance tracking for React components including:
 * - Render timing
 * - Effect execution timing
 * - Re-render frequency
 * - Memory usage during component lifecycle
 */
export const usePerformanceTracking = (componentName, options = {}) => {
  const {
    trackRenders = true,
    trackEffects = true,
    trackMemory = false,
    trackProps = false,
    threshold = 16, // 60fps threshold
  } = options;

  const renderStartTime = useRef(null);
  const mountTime = useRef(null);
  const renderCount = useRef(0);
  const lastProps = useRef(null);
  const effectTimers = useRef(new Map());

  useEffect(() => {
    mountTime.current = performance.now();
    
    return () => {
      // Record component unmount
      if (mountTime.current) {
        const mountDuration = performance.now() - mountTime.current;
        PerformanceMonitor.record(METRIC_TYPES.COMPONENT, `${componentName}_mount_duration`, mountDuration, {
          renderCount: renderCount.current,
          event: 'unmount',
        });
      }
    };
  }, [componentName]);

  // Track renders
  useEffect(() => {
    if (trackRenders) {
      const renderTime = performance.now();
      if (renderStartTime.current) {
        const renderDuration = renderTime - renderStartTime.current;
        renderCount.current++;
        
        PerformanceMonitor.record(METRIC_TYPES.COMPONENT, `${componentName}_render`, renderDuration, {
          renderNumber: renderCount.current,
          slow: renderDuration > threshold,
          event: 'render',
        });
      }
      renderStartTime.current = renderTime;
    }
  });

  // Track memory usage
  useEffect(() => {
    if (trackMemory) {
      PerformanceMonitor.recordMemory({
        component: componentName,
        event: 'render',
        renderCount: renderCount.current,
      });
    }
  });

  /**
   * Start timing an effect
   */
  const startEffectTiming = useCallback((effectName) => {
    if (trackEffects) {
      effectTimers.current.set(effectName, performance.now());
    }
  }, [trackEffects]);

  /**
   * End timing an effect
   */
  const endEffectTiming = useCallback((effectName, metadata = {}) => {
    if (trackEffects && effectTimers.current.has(effectName)) {
      const startTime = effectTimers.current.get(effectName);
      const duration = performance.now() - startTime;
      
      PerformanceMonitor.record(METRIC_TYPES.COMPONENT, `${componentName}_effect_${effectName}`, duration, {
        ...metadata,
        event: 'effect',
      });
      
      effectTimers.current.delete(effectName);
    }
  }, [trackEffects, componentName]);

  /**
   * Time an async operation
   */
  const timeAsyncOperation = useCallback(async (operationName, operation, metadata = {}) => {
    return PerformanceMonitor.measureAsync(`${componentName}_${operationName}`, operation, {
      ...metadata,
      component: componentName,
    });
  }, [componentName]);

  /**
   * Time a synchronous operation
   */
  const timeOperation = useCallback((operationName, operation, metadata = {}) => {
    return PerformanceMonitor.measure(`${componentName}_${operationName}`, operation, {
      ...metadata,
      component: componentName,
    });
  }, [componentName]);

  /**
   * Record custom metric
   */
  const recordMetric = useCallback((metricName, value, metadata = {}) => {
    PerformanceMonitor.record(METRIC_TYPES.COMPONENT, `${componentName}_${metricName}`, value, {
      ...metadata,
      component: componentName,
    });
  }, [componentName]);

  return {
    startEffectTiming,
    endEffectTiming,
    timeAsyncOperation,
    timeOperation,
    recordMetric,
    renderCount: renderCount.current,
  };
};

/**
 * Hook for tracking API performance
 */
export const useApiPerformanceTracking = () => {
  const activeRequests = useRef(new Map());

  /**
   * Start tracking an API request
   */
  const startApiRequest = useCallback((method, url, options = {}) => {
    const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    const startTime = performance.now();
    
    activeRequests.current.set(requestId, {
      method,
      url,
      startTime,
      options,
    });
    
    return requestId;
  }, []);

  /**
   * End tracking an API request
   */
  const endApiRequest = useCallback((requestId, status, responseSize = null, error = null) => {
    const request = activeRequests.current.get(requestId);
    if (!request) return;

    const duration = performance.now() - request.startTime;
    
    PerformanceMonitor.recordApi(
      request.method,
      request.url,
      duration,
      status,
      {
        ...request.options,
        responseSize,
        error: error?.message,
        success: !error && status < 400,
      }
    );
    
    activeRequests.current.delete(requestId);
    
    return {
      duration,
      method: request.method,
      url: request.url,
      status,
      success: !error && status < 400,
    };
  }, []);

  /**
   * Track an API request automatically
   */
  const trackApiRequest = useCallback(async (method, url, requestFn, options = {}) => {
    const requestId = startApiRequest(method, url, options);
    
    try {
      const result = await requestFn();
      endApiRequest(requestId, 200);
      return result;
    } catch (error) {
      endApiRequest(requestId, error.status || 500, null, error);
      throw error;
    }
  }, [startApiRequest, endApiRequest]);

  return {
    startApiRequest,
    endApiRequest,
    trackApiRequest,
  };
};

/**
 * Hook for tracking navigation performance
 */
export const useNavigationPerformanceTracking = () => {
  const navigationStart = useRef(null);

  /**
   * Start navigation timing
   */
  const startNavigation = useCallback((from, to) => {
    navigationStart.current = {
      from,
      to,
      startTime: performance.now(),
    };
  }, []);

  /**
   * End navigation timing
   */
  const endNavigation = useCallback((metadata = {}) => {
    if (!navigationStart.current) return;

    const duration = performance.now() - navigationStart.current.startTime;
    
    PerformanceMonitor.recordNavigation(
      navigationStart.current.from,
      navigationStart.current.to,
      duration,
      metadata
    );
    
    const result = {
      ...navigationStart.current,
      duration,
      metadata,
    };
    
    navigationStart.current = null;
    return result;
  }, []);

  return {
    startNavigation,
    endNavigation,
  };
};

/**
 * Hook for tracking user interactions
 */
export const useInteractionPerformanceTracking = () => {
  const interactionTimers = useRef(new Map());

  /**
   * Start tracking an interaction
   */
  const startInteraction = useCallback((type, target) => {
    const interactionId = `${type}_${target}_${Date.now()}`;
    interactionTimers.current.set(interactionId, {
      type,
      target,
      startTime: performance.now(),
    });
    return interactionId;
  }, []);

  /**
   * End tracking an interaction
   */
  const endInteraction = useCallback((interactionId, metadata = {}) => {
    const interaction = interactionTimers.current.get(interactionId);
    if (!interaction) return;

    const duration = performance.now() - interaction.startTime;
    
    PerformanceMonitor.recordInteraction(
      interaction.type,
      interaction.target,
      duration,
      metadata
    );
    
    interactionTimers.current.delete(interactionId);
    
    return {
      ...interaction,
      duration,
      metadata,
    };
  }, []);

  /**
   * Track click interaction
   */
  const trackClick = useCallback((target, handler, metadata = {}) => {
    return async (event) => {
      const interactionId = startInteraction('click', target);
      try {
        const result = await handler(event);
        endInteraction(interactionId, { ...metadata, success: true });
        return result;
      } catch (error) {
        endInteraction(interactionId, { ...metadata, success: false, error: error.message });
        throw error;
      }
    };
  }, [startInteraction, endInteraction]);

  /**
   * Track form submission
   */
  const trackFormSubmit = useCallback((formName, handler, metadata = {}) => {
    return async (event) => {
      const interactionId = startInteraction('form_submit', formName);
      try {
        const result = await handler(event);
        endInteraction(interactionId, { ...metadata, success: true });
        return result;
      } catch (error) {
        endInteraction(interactionId, { ...metadata, success: false, error: error.message });
        throw error;
      }
    };
  }, [startInteraction, endInteraction]);

  return {
    startInteraction,
    endInteraction,
    trackClick,
    trackFormSubmit,
  };
};

/**
 * Hook for tracking memory usage
 */
export const useMemoryTracking = (componentName, interval = 30000) => {
  const [memoryStats, setMemoryStats] = useState(null);

  useEffect(() => {
    let intervalId;

    const trackMemory = () => {
      const memory = PerformanceMonitor.recordMemory({
        component: componentName,
        event: 'periodic_check',
      });
      
      if (memory) {
        setMemoryStats({
          used: memory.metadata.usedJSHeapSize,
          total: memory.metadata.totalJSHeapSize,
          limit: memory.metadata.jsHeapSizeLimit,
          timestamp: memory.timestamp,
        });
      }
    };

    // Initial measurement
    trackMemory();

    // Set up periodic measurements
    if (interval > 0) {
      intervalId = setInterval(trackMemory, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [componentName, interval]);

  return memoryStats;
};

/**
 * Hook for getting performance analytics
 */
export const usePerformanceAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [webVitals, setWebVitals] = useState(null);

  const refreshAnalytics = useCallback(() => {
    const performanceAnalytics = PerformanceMonitor.getAnalytics();
    const vitalsMonitor = getWebVitals();
    const vitalsData = vitalsMonitor.getSummary();
    
    setAnalytics(performanceAnalytics);
    setWebVitals(vitalsData);
  }, []);

  useEffect(() => {
    refreshAnalytics();
    
    // Set up periodic refresh
    const interval = setInterval(refreshAnalytics, 30000);
    
    return () => clearInterval(interval);
  }, [refreshAnalytics]);

  return {
    analytics,
    webVitals,
    refreshAnalytics,
  };
};

/**
 * Hook for performance optimization suggestions
 */
export const usePerformanceOptimizations = () => {
  const [optimizations, setOptimizations] = useState([]);

  useEffect(() => {
    const analytics = PerformanceMonitor.getAnalytics();
    setOptimizations(analytics.recommendations || []);
  }, []);

  const refreshOptimizations = useCallback(() => {
    const analytics = PerformanceMonitor.getAnalytics();
    setOptimizations(analytics.recommendations || []);
  }, []);

  return {
    optimizations,
    refreshOptimizations,
  };
};

export default usePerformanceTracking;