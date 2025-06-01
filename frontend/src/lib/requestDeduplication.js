// frontend/src/lib/requestDeduplication.js

/**
 * Request Deduplication and Batching Middleware
 * 
 * Provides intelligent request deduplication, batching, and caching
 * to optimize API calls and reduce server load.
 */

class RequestDeduplicator {
  constructor() {
    // Map of pending requests by unique key
    this.pendingRequests = new Map();
    
    // Request batching queue
    this.batchQueue = new Map();
    
    // Batch processing timers
    this.batchTimers = new Map();
    
    // Configuration
    this.config = {
      batchDelay: 50, // ms to wait before sending batch
      maxBatchSize: 10, // maximum requests per batch
      deduplicationTTL: 5000, // ms to keep deduplication cache
    };
    
    // Statistics for monitoring
    this.stats = {
      totalRequests: 0,
      deduplicatedRequests: 0,
      batchedRequests: 0,
      cacheHits: 0,
    };
  }

  /**
   * Generate a unique key for request deduplication
   */
  generateRequestKey(method, url, params = {}) {
    const paramsString = JSON.stringify(params, Object.keys(params).sort());
    return `${method.toLowerCase()}:${url}:${paramsString}`;
  }

  /**
   * Deduplicate identical requests
   */
  async deduplicateRequest(method, url, params, requestFn) {
    const requestKey = this.generateRequestKey(method, url, params);
    this.stats.totalRequests++;

    // Check if identical request is already pending
    if (this.pendingRequests.has(requestKey)) {
      this.stats.deduplicatedRequests++;
      console.debug('Deduplicating request:', requestKey);
      return this.pendingRequests.get(requestKey);
    }

    // Create and store the request promise
    const requestPromise = this.executeRequest(requestFn);
    this.pendingRequests.set(requestKey, requestPromise);

    // Clean up after request completes
    requestPromise
      .finally(() => {
        setTimeout(() => {
          this.pendingRequests.delete(requestKey);
        }, this.config.deduplicationTTL);
      });

    return requestPromise;
  }

  /**
   * Execute the actual request with error handling
   */
  async executeRequest(requestFn) {
    try {
      return await requestFn();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add request to batch queue for similar endpoints
   */
  addToBatch(batchKey, request) {
    if (!this.batchQueue.has(batchKey)) {
      this.batchQueue.set(batchKey, []);
    }

    const batch = this.batchQueue.get(batchKey);
    batch.push(request);

    // If batch is full, process immediately
    if (batch.length >= this.config.maxBatchSize) {
      this.processBatch(batchKey);
      return;
    }

    // Otherwise, set timer to process batch
    if (!this.batchTimers.has(batchKey)) {
      const timer = setTimeout(() => {
        this.processBatch(batchKey);
      }, this.config.batchDelay);
      
      this.batchTimers.set(batchKey, timer);
    }
  }

  /**
   * Process a batch of similar requests
   */
  async processBatch(batchKey) {
    const batch = this.batchQueue.get(batchKey);
    if (!batch || batch.length === 0) return;

    // Clear timer and remove from queue
    const timer = this.batchTimers.get(batchKey);
    if (timer) {
      clearTimeout(timer);
      this.batchTimers.delete(batchKey);
    }
    this.batchQueue.delete(batchKey);

    this.stats.batchedRequests += batch.length;
    console.debug(`Processing batch of ${batch.length} requests for:`, batchKey);

    // Execute all requests in parallel
    const results = await Promise.allSettled(
      batch.map(request => request.execute())
    );

    // Resolve individual promises with their results
    results.forEach((result, index) => {
      const request = batch[index];
      if (result.status === 'fulfilled') {
        request.resolve(result.value);
      } else {
        request.reject(result.reason);
      }
    });
  }

  /**
   * Get deduplication statistics
   */
  getStats() {
    return {
      ...this.stats,
      pendingRequests: this.pendingRequests.size,
      pendingBatches: this.batchQueue.size,
      deduplicationRatio: this.stats.totalRequests > 0 
        ? (this.stats.deduplicatedRequests / this.stats.totalRequests * 100).toFixed(2)
        : 0,
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRequests: 0,
      deduplicatedRequests: 0,
      batchedRequests: 0,
      cacheHits: 0,
    };
  }

  /**
   * Clear all pending requests and batches
   */
  clear() {
    this.pendingRequests.clear();
    this.batchQueue.clear();
    
    // Clear all timers
    this.batchTimers.forEach(timer => clearTimeout(timer));
    this.batchTimers.clear();
  }
}

// Global deduplicator instance
export const requestDeduplicator = new RequestDeduplicator();

/**
 * Request cache for faster repeated requests
 */
class RequestCache {
  constructor() {
    this.cache = new Map();
    this.config = {
      maxSize: 100,
      defaultTTL: 60000, // 1 minute
    };
  }

  /**
   * Generate cache key
   */
  generateCacheKey(method, url, params = {}) {
    return requestDeduplicator.generateRequestKey(method, url, params);
  }

  /**
   * Get cached response
   */
  get(method, url, params = {}) {
    const key = this.generateCacheKey(method, url, params);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    requestDeduplicator.stats.cacheHits++;
    return cached.data;
  }

  /**
   * Set cached response
   */
  set(method, url, params = {}, data, ttl = this.config.defaultTTL) {
    const key = this.generateCacheKey(method, url, params);
    
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
      createdAt: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.values());
    
    return {
      totalEntries: this.cache.size,
      validEntries: entries.filter(entry => now < entry.expiresAt).length,
      expiredEntries: entries.filter(entry => now >= entry.expiresAt).length,
      totalSize: entries.reduce((size, entry) => {
        return size + JSON.stringify(entry.data).length;
      }, 0),
    };
  }
}

// Global request cache instance
export const requestCache = new RequestCache();

/**
 * Smart request wrapper that combines deduplication, caching, and batching
 */
export const smartRequest = {
  /**
   * Execute a request with all optimizations applied
   */
  async execute(method, url, params = {}, requestFn, options = {}) {
    const {
      enableCache = true,
      enableDeduplication = true,
      enableBatching = false,
      cacheTTL = 60000,
      batchKey = null,
    } = options;

    // Check cache first
    if (enableCache && ['GET', 'HEAD'].includes(method.toUpperCase())) {
      const cached = requestCache.get(method, url, params);
      if (cached) {
        console.debug('Cache hit for:', method, url);
        return cached;
      }
    }

    // Use deduplication for GET requests
    if (enableDeduplication && ['GET', 'HEAD'].includes(method.toUpperCase())) {
      const result = await requestDeduplicator.deduplicateRequest(
        method, 
        url, 
        params, 
        requestFn
      );

      // Cache successful GET requests
      if (enableCache && result) {
        requestCache.set(method, url, params, result, cacheTTL);
      }

      return result;
    }

    // Use batching for specific endpoints
    if (enableBatching && batchKey) {
      return new Promise((resolve, reject) => {
        requestDeduplicator.addToBatch(batchKey, {
          execute: requestFn,
          resolve,
          reject,
        });
      });
    }

    // Execute request normally
    return requestFn();
  },

  /**
   * Get combined statistics
   */
  getStats() {
    return {
      deduplication: requestDeduplicator.getStats(),
      cache: requestCache.getStats(),
    };
  },

  /**
   * Clear all caches and pending requests
   */
  clear() {
    requestDeduplicator.clear();
    requestCache.clear();
  },

  /**
   * Reset all statistics
   */
  resetStats() {
    requestDeduplicator.resetStats();
  },
};

export default smartRequest;