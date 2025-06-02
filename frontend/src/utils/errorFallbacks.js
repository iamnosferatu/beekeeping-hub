// frontend/src/utils/errorFallbacks.js
import { ERROR_TYPES, ERROR_SEVERITY } from './errorReporting';

/**
 * Error Fallback Strategies
 * 
 * Provides fallback mechanisms and recovery strategies for different types of errors.
 * Similar to backend circuit breaker patterns and graceful degradation.
 */

/**
 * Generic fallback strategies based on error type
 */
export const FALLBACK_STRATEGIES = {
  CACHE_FIRST: 'cache_first',
  OFFLINE_MODE: 'offline_mode',
  RETRY_WITH_BACKOFF: 'retry_with_backoff',
  GRACEFUL_DEGRADATION: 'graceful_degradation',
  ALTERNATIVE_ENDPOINT: 'alternative_endpoint',
  LOCAL_STORAGE: 'local_storage',
  DEFAULT_DATA: 'default_data',
};

/**
 * Default fallback configurations for different error types
 */
const DEFAULT_FALLBACK_CONFIG = {
  [ERROR_TYPES.NETWORK]: {
    strategy: FALLBACK_STRATEGIES.CACHE_FIRST,
    enableOfflineMode: true,
    retryCount: 3,
    retryDelay: 1000,
  },
  [ERROR_TYPES.SERVER]: {
    strategy: FALLBACK_STRATEGIES.RETRY_WITH_BACKOFF,
    retryCount: 2,
    retryDelay: 2000,
  },
  [ERROR_TYPES.AUTHENTICATION]: {
    strategy: FALLBACK_STRATEGIES.GRACEFUL_DEGRADATION,
    redirectToLogin: true,
  },
  [ERROR_TYPES.AUTHORIZATION]: {
    strategy: FALLBACK_STRATEGIES.GRACEFUL_DEGRADATION,
    showLimitedContent: true,
  },
  [ERROR_TYPES.NOT_FOUND]: {
    strategy: FALLBACK_STRATEGIES.DEFAULT_DATA,
    useEmptyState: true,
  },
  [ERROR_TYPES.VALIDATION]: {
    strategy: FALLBACK_STRATEGIES.GRACEFUL_DEGRADATION,
    showFieldErrors: true,
  },
};

/**
 * Cache-based fallback for network errors
 */
export class CacheFallback {
  constructor() {
    this.cache = new Map();
    this.cacheKeys = new Set();
  }

  /**
   * Store data in cache
   */
  set(key, data, ttl = 300000) { // 5 minutes default TTL
    const entry = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    
    this.cache.set(key, entry);
    this.cacheKeys.add(key);
    
    // Clean up old entries
    this.cleanup();
  }

  /**
   * Get data from cache
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.cacheKeys.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Check if cache has valid data
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Clear expired entries
   */
  cleanup() {
    const now = Date.now();
    
    for (const key of this.cacheKeys) {
      const entry = this.cache.get(key);
      if (entry && now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.cacheKeys.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    this.cacheKeys.clear();
  }
}

// Global cache instance
const globalCache = new CacheFallback();

/**
 * Offline mode handler
 */
export class OfflineHandler {
  constructor() {
    this.isOnline = navigator.onLine;
    this.offlineQueue = [];
    this.listeners = new Set();
    
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  handleOnline() {
    this.isOnline = true;
    this.processOfflineQueue();
    this.notifyListeners('online');
  }

  handleOffline() {
    this.isOnline = false;
    this.notifyListeners('offline');
  }

  /**
   * Add request to offline queue
   */
  queueRequest(request) {
    this.offlineQueue.push({
      ...request,
      timestamp: Date.now(),
    });
  }

  /**
   * Process queued requests when back online
   */
  async processOfflineQueue() {
    if (!this.isOnline || this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const request of queue) {
      try {
        if (request.callback) {
          await request.callback();
        }
      } catch (error) {
        console.warn('Failed to process offline request:', error);
        // Could re-queue or handle differently
      }
    }
  }

  /**
   * Add event listener
   */
  addEventListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Notify listeners of status change
   */
  notifyListeners(status) {
    this.listeners.forEach(listener => {
      try {
        listener(status, this.isOnline);
      } catch (error) {
        console.warn('Error in offline handler listener:', error);
      }
    });
  }
}

// Global offline handler
const offlineHandler = new OfflineHandler();

/**
 * Main fallback executor
 */
export class FallbackExecutor {
  constructor(config = {}) {
    this.config = { ...DEFAULT_FALLBACK_CONFIG, ...config };
    this.circuitBreakers = new Map();
  }

  /**
   * Execute fallback strategy for given error
   */
  async execute(error, options = {}) {
    const {
      cacheKey = null,
      defaultData = null,
      alternativeFunction = null,
      context = {},
    } = options;

    const errorType = error.type || ERROR_TYPES.UNKNOWN;
    const fallbackConfig = this.config[errorType] || this.config[ERROR_TYPES.UNKNOWN];

    if (!fallbackConfig) {
      throw error; // No fallback available
    }

    const strategy = fallbackConfig.strategy;

    switch (strategy) {
      case FALLBACK_STRATEGIES.CACHE_FIRST:
        return this.executeCacheFirst(error, cacheKey, defaultData, fallbackConfig);

      case FALLBACK_STRATEGIES.OFFLINE_MODE:
        return this.executeOfflineMode(error, options, fallbackConfig);

      case FALLBACK_STRATEGIES.RETRY_WITH_BACKOFF:
        return this.executeRetryWithBackoff(error, options, fallbackConfig);

      case FALLBACK_STRATEGIES.GRACEFUL_DEGRADATION:
        return this.executeGracefulDegradation(error, options, fallbackConfig);

      case FALLBACK_STRATEGIES.ALTERNATIVE_ENDPOINT:
        return this.executeAlternativeEndpoint(error, alternativeFunction, fallbackConfig);

      case FALLBACK_STRATEGIES.LOCAL_STORAGE:
        return this.executeLocalStorage(error, cacheKey, defaultData, fallbackConfig);

      case FALLBACK_STRATEGIES.DEFAULT_DATA:
        return this.executeDefaultData(error, defaultData, fallbackConfig);

      default:
        throw error;
    }
  }

  /**
   * Cache-first fallback
   */
  async executeCacheFirst(error, cacheKey, defaultData, config) {
    if (cacheKey && globalCache.has(cacheKey)) {
      const cachedData = globalCache.get(cacheKey);
      return {
        success: true,
        data: cachedData,
        source: 'cache',
        error: null,
      };
    }

    if (defaultData) {
      return {
        success: true,
        data: defaultData,
        source: 'default',
        error: null,
      };
    }

    throw error;
  }

  /**
   * Offline mode fallback
   */
  async executeOfflineMode(error, options, config) {
    if (!offlineHandler.isOnline) {
      // Queue for later execution
      offlineHandler.queueRequest({
        ...options,
        callback: options.retryCallback,
      });

      // Return cached data or default
      return this.executeCacheFirst(error, options.cacheKey, options.defaultData, config);
    }

    throw error;
  }

  /**
   * Retry with backoff fallback
   */
  async executeRetryWithBackoff(error, options, config) {
    const { retryCount = 0, maxRetries = config.retryCount || 3 } = options;

    if (retryCount < maxRetries) {
      const delay = config.retryDelay * Math.pow(2, retryCount);
      
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            if (options.retryCallback) {
              const result = await options.retryCallback();
              resolve({
                success: true,
                data: result,
                source: 'retry',
                retryCount: retryCount + 1,
              });
            } else {
              reject(error);
            }
          } catch (retryError) {
            // Try fallback again with incremented retry count
            try {
              const fallbackResult = await this.executeRetryWithBackoff(retryError, {
                ...options,
                retryCount: retryCount + 1,
              }, config);
              resolve(fallbackResult);
            } catch (finalError) {
              reject(finalError);
            }
          }
        }, delay);
      });
    }

    throw error;
  }

  /**
   * Graceful degradation fallback
   */
  async executeGracefulDegradation(error, options, config) {
    const degradedData = {
      isLimited: true,
      error: error.message,
      availableFeatures: options.availableFeatures || [],
      redirectRequired: config.redirectToLogin && error.type === ERROR_TYPES.AUTHENTICATION,
    };

    return {
      success: true,
      data: degradedData,
      source: 'degraded',
      error: null,
    };
  }

  /**
   * Alternative endpoint fallback
   */
  async executeAlternativeEndpoint(error, alternativeFunction, config) {
    if (!alternativeFunction) {
      throw error;
    }

    try {
      const result = await alternativeFunction();
      return {
        success: true,
        data: result,
        source: 'alternative',
        error: null,
      };
    } catch (altError) {
      throw error; // Return original error if alternative also fails
    }
  }

  /**
   * Local storage fallback
   */
  async executeLocalStorage(error, cacheKey, defaultData, config) {
    if (!cacheKey) {
      throw error;
    }

    try {
      const stored = localStorage.getItem(cacheKey);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          success: true,
          data: data,
          source: 'localStorage',
          error: null,
        };
      }
    } catch (storageError) {
      // Fall through to default data
    }

    return this.executeDefaultData(error, defaultData, config);
  }

  /**
   * Default data fallback
   */
  async executeDefaultData(error, defaultData, config) {
    if (defaultData !== null && defaultData !== undefined) {
      return {
        success: true,
        data: defaultData,
        source: 'default',
        error: null,
      };
    }

    throw error;
  }

  /**
   * Check circuit breaker status
   */
  checkCircuitBreaker(key) {
    const breaker = this.circuitBreakers.get(key);
    if (!breaker) return true; // Allow if no breaker set

    const now = Date.now();
    if (now - breaker.lastFailure > breaker.timeout) {
      // Reset circuit breaker
      this.circuitBreakers.delete(key);
      return true;
    }

    return breaker.failures < breaker.threshold;
  }

  /**
   * Update circuit breaker
   */
  updateCircuitBreaker(key, failed = false) {
    const breaker = this.circuitBreakers.get(key) || {
      failures: 0,
      threshold: 5,
      timeout: 60000, // 1 minute
      lastFailure: 0,
    };

    if (failed) {
      breaker.failures++;
      breaker.lastFailure = Date.now();
    } else {
      breaker.failures = 0;
    }

    this.circuitBreakers.set(key, breaker);
  }
}

// Global fallback executor
const globalFallbackExecutor = new FallbackExecutor();

/**
 * Convenience functions
 */
export const executeWithFallback = async (fn, options = {}) => {
  try {
    const result = await fn();
    
    // Cache successful result if cacheKey provided
    if (options.cacheKey && result) {
      globalCache.set(options.cacheKey, result, options.cacheTTL);
    }
    
    return {
      success: true,
      data: result,
      source: 'primary',
      error: null,
    };
  } catch (error) {
    return globalFallbackExecutor.execute(error, {
      ...options,
      retryCallback: fn,
    });
  }
};

export const withCaching = (cacheKey, ttl) => (fn) => {
  return async (...args) => {
    return executeWithFallback(fn, {
      cacheKey: `${cacheKey}_${JSON.stringify(args)}`,
      cacheTTL: ttl,
    });
  };
};

export const withOfflineSupport = (fn, options = {}) => {
  return async (...args) => {
    if (!offlineHandler.isOnline && options.cacheKey) {
      // Try to get from cache when offline
      const cached = globalCache.get(options.cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          source: 'cache_offline',
          error: null,
        };
      }
    }

    return executeWithFallback(() => fn(...args), options);
  };
};

export { globalCache, offlineHandler, globalFallbackExecutor };