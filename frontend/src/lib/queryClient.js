// frontend/src/lib/queryClient.js
import { QueryClient } from '@tanstack/react-query';

// Cache configuration constants
const CACHE_CONFIG = {
  // Stale times for different data types
  STALE_TIME: {
    STATIC: 30 * 60 * 1000,     // 30 minutes - for static content
    ARTICLES: 5 * 60 * 1000,    // 5 minutes - for articles
    COMMENTS: 2 * 60 * 1000,    // 2 minutes - for comments
    USER: 10 * 60 * 1000,       // 10 minutes - for user data
    TAGS: 15 * 60 * 1000,       // 15 minutes - for tags
    SEARCH: 1 * 60 * 1000,      // 1 minute - for search results
  },
  // Garbage collection times
  GC_TIME: {
    SHORT: 5 * 60 * 1000,       // 5 minutes - for frequently changing data
    MEDIUM: 15 * 60 * 1000,     // 15 minutes - for moderately stable data
    LONG: 60 * 60 * 1000,       // 1 hour - for stable data
  },
  // Retry configuration
  RETRY: {
    DEFAULT: 3,
    MUTATIONS: 1,
    NETWORK_ONLY: 2,
  },
};

// Advanced cache invalidation patterns
const CACHE_PATTERNS = {
  // Hierarchical invalidation
  ARTICLES: {
    all: ['articles'],
    lists: ['articles', 'list'],
    details: ['articles', 'detail'],
    user: ['articles', 'user'],
    search: ['articles', 'search'],
  },
  COMMENTS: {
    all: ['comments'],
    byArticle: ['comments', 'article'],
  },
  TAGS: {
    all: ['tags'],
    popular: ['tags', 'popular'],
  },
  USER: {
    all: ['user'],
    profile: ['user', 'profile'],
  },
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default stale time
      staleTime: CACHE_CONFIG.STALE_TIME.ARTICLES,
      // Default garbage collection time
      gcTime: CACHE_CONFIG.GC_TIME.MEDIUM,
      // Retry configuration with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry network errors and 5xx errors
        return failureCount < CACHE_CONFIG.RETRY.DEFAULT;
      },
      // Smart retry delay with jitter
      retryDelay: (attemptIndex) => {
        const baseDelay = Math.min(1000 * 2 ** attemptIndex, 30000);
        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 0.1 * baseDelay;
        return baseDelay + jitter;
      },
      // Background refetching settings
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      // Network mode for offline support
      networkMode: 'online',
      // Error handling
      throwOnError: false,
      // Request deduplication
      structuralSharing: true,
    },
    mutations: {
      // Retry failed mutations
      retry: CACHE_CONFIG.RETRY.MUTATIONS,
      // Network mode
      networkMode: 'online',
      // Error handling
      throwOnError: false,
    },
  },
});

// Set specific cache defaults for different query types
queryClient.setQueryDefaults(['articles'], {
  staleTime: CACHE_CONFIG.STALE_TIME.ARTICLES,
  gcTime: CACHE_CONFIG.GC_TIME.MEDIUM,
});

queryClient.setQueryDefaults(['comments'], {
  staleTime: CACHE_CONFIG.STALE_TIME.COMMENTS,
  gcTime: CACHE_CONFIG.GC_TIME.SHORT,
});

queryClient.setQueryDefaults(['user'], {
  staleTime: CACHE_CONFIG.STALE_TIME.USER,
  gcTime: CACHE_CONFIG.GC_TIME.LONG,
});

queryClient.setQueryDefaults(['tags'], {
  staleTime: CACHE_CONFIG.STALE_TIME.TAGS,
  gcTime: CACHE_CONFIG.GC_TIME.LONG,
});

queryClient.setQueryDefaults(['search'], {
  staleTime: CACHE_CONFIG.STALE_TIME.SEARCH,
  gcTime: CACHE_CONFIG.GC_TIME.SHORT,
});

// Advanced cache utilities
export const cacheUtils = {
  // Smart invalidation based on patterns
  invalidatePattern: (pattern) => {
    return queryClient.invalidateQueries({ queryKey: pattern });
  },

  // Prefetch with error handling
  prefetch: async (queryKey, queryFn, options = {}) => {
    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options.staleTime || CACHE_CONFIG.STALE_TIME.ARTICLES,
        ...options,
      });
    } catch (error) {
      console.warn('Prefetch failed:', queryKey, error);
    }
  },

  // Cache warming for critical data
  warmCache: async (warmingStrategies) => {
    const warmingPromises = warmingStrategies.map(async (strategy) => {
      try {
        await queryClient.prefetchQuery(strategy);
      } catch (error) {
        console.warn('Cache warming failed for:', strategy.queryKey, error);
      }
    });

    await Promise.allSettled(warmingPromises);
  },

  // Selective cache clearing
  clearByPattern: (pattern) => {
    queryClient.removeQueries({ queryKey: pattern });
  },

  // Get cache statistics
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      freshQueries: queries.filter(q => !q.isStale()).length,
      fetchingQueries: queries.filter(q => q.isFetching()).length,
      errorQueries: queries.filter(q => q.isError()).length,
      cacheSize: queries.reduce((size, query) => {
        return size + JSON.stringify(query.state.data || {}).length;
      }, 0),
    };
  },

  // Export cache for debugging
  exportCache: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return queries.map(query => ({
      queryKey: query.queryKey,
      state: query.state.status,
      dataUpdatedAt: query.state.dataUpdatedAt,
      staleTime: query.options.staleTime,
      gcTime: query.options.gcTime,
      dataSize: JSON.stringify(query.state.data || {}).length,
    }));
  },
};

// Request deduplication and batching utilities
export const requestUtils = {
  // Batch multiple queries
  batchQueries: async (queries) => {
    const results = await Promise.allSettled(
      queries.map(({ queryKey, queryFn, options }) =>
        queryClient.fetchQuery({
          queryKey,
          queryFn,
          ...options,
        })
      )
    );

    return results.map((result, index) => ({
      queryKey: queries[index].queryKey,
      status: result.status,
      data: result.status === 'fulfilled' ? result.value : null,
      error: result.status === 'rejected' ? result.reason : null,
    }));
  },

  // Intelligent prefetching based on user behavior
  intelligentPrefetch: {
    // Prefetch related articles when viewing an article
    prefetchRelatedArticles: async (articleId) => {
      const relatedQueryKey = ['articles', 'related', articleId];
      await cacheUtils.prefetch(
        relatedQueryKey,
        () => import('../services/api').then(api => api.default.articles.getRelated(articleId)),
        { staleTime: CACHE_CONFIG.STALE_TIME.ARTICLES }
      );
    },

    // Prefetch user articles when viewing profile
    prefetchUserContent: async (userId) => {
      const strategies = [
        {
          queryKey: ['articles', 'user', userId],
          queryFn: () => import('../services/api').then(api => api.default.articles.getUserArticles(userId)),
          staleTime: CACHE_CONFIG.STALE_TIME.ARTICLES,
        },
        {
          queryKey: ['comments', 'user', userId],
          queryFn: () => import('../services/api').then(api => api.default.comments.getByUser(userId)),
          staleTime: CACHE_CONFIG.STALE_TIME.COMMENTS,
        },
      ];

      await cacheUtils.warmCache(strategies);
    },

    // Prefetch popular content on app load
    prefetchPopularContent: async () => {
      const strategies = [
        {
          queryKey: ['articles', 'popular'],
          queryFn: () => import('../services/api').then(api => api.default.articles.getAll({ sort: 'popular', limit: 10 })),
          staleTime: CACHE_CONFIG.STALE_TIME.ARTICLES,
        },
        {
          queryKey: ['tags', 'popular'],
          queryFn: () => import('../services/api').then(api => api.default.tags.getPopular(10)),
          staleTime: CACHE_CONFIG.STALE_TIME.TAGS,
        },
      ];

      await cacheUtils.warmCache(strategies);
    },
  },
};

// Cache persistence utilities
export const persistenceUtils = {
  // Save critical cache data to localStorage
  saveToStorage: () => {
    try {
      const cache = queryClient.getQueryCache();
      const criticalQueries = cache.getAll().filter(query => {
        const [type] = query.queryKey;
        return ['user', 'tags'].includes(type) && !query.isStale();
      });

      const cacheData = criticalQueries.map(query => ({
        queryKey: query.queryKey,
        data: query.state.data,
        dataUpdatedAt: query.state.dataUpdatedAt,
      }));

      localStorage.setItem('react-query-cache', JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  },

  // Restore cache data from localStorage
  restoreFromStorage: () => {
    try {
      const cacheData = localStorage.getItem('react-query-cache');
      if (!cacheData) return;

      const parsedData = JSON.parse(cacheData);
      const maxAge = 10 * 60 * 1000; // 10 minutes

      parsedData.forEach(({ queryKey, data, dataUpdatedAt }) => {
        const age = Date.now() - dataUpdatedAt;
        if (age < maxAge) {
          queryClient.setQueryData(queryKey, data);
        }
      });
    } catch (error) {
      console.warn('Failed to restore cache from storage:', error);
    }
  },

  // Clear stored cache
  clearStorage: () => {
    try {
      localStorage.removeItem('react-query-cache');
    } catch (error) {
      console.warn('Failed to clear cache storage:', error);
    }
  },
};

// Auto-save cache on app unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', persistenceUtils.saveToStorage);
}

// Export configuration and patterns for use in hooks
export { CACHE_CONFIG, CACHE_PATTERNS };

export default queryClient;