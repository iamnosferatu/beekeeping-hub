// frontend/src/lib/cacheWarming.js

/**
 * Cache Warming and Intelligent Prefetching
 * 
 * Provides smart cache warming strategies to improve perceived performance
 * by preloading critical data and predicting user navigation patterns.
 */

import { cacheUtils, requestUtils } from './queryClient';
import { ARTICLES_QUERY_KEYS } from '../hooks/queries/useArticles';
import { COMMENTS_QUERY_KEYS } from '../hooks/queries/useComments';
import { TAGS_QUERY_KEYS } from '../hooks/queries/useTags';

class CacheWarmingManager {
  constructor() {
    this.warmingStrategies = new Map();
    this.prefetchQueue = [];
    this.isWarming = false;
    this.userBehaviorData = this.loadUserBehavior();
    
    // Performance tracking
    this.stats = {
      totalWarmups: 0,
      successfulWarmups: 0,
      failedWarmups: 0,
      averageWarmupTime: 0,
      prefetchHits: 0,
      prefetchMisses: 0,
    };
    
    this.setupDefaultStrategies();
    this.startBehaviorTracking();
  }

  /**
   * Setup default cache warming strategies
   */
  setupDefaultStrategies() {
    // App initialization strategy
    this.addStrategy('app.init', {
      priority: 'critical',
      triggers: ['app.mount'],
      prefetch: async () => {
        // SIMPLIFIED CACHE WARMING - Only warm the most critical query
        // Use the exact same query function as components to avoid conflicts
        const apiService = await this.getApiService();
        
        const strategies = [
          // Only warm the HomePage article list (limit: 8) - the most important one
          {
            queryKey: ARTICLES_QUERY_KEYS.list({ limit: 8 }),
            queryFn: async () => {
              // Use identical logic to component hook
              const response = await apiService.articles.getAll({ limit: 8 });
              if (!response.success) {
                throw new Error(response.error?.message || 'Failed to fetch articles');
              }
              return response.data;
            },
            staleTime: 5 * 60 * 1000,
          },
        ];


        await cacheUtils.warmCache(strategies);
      },
    });

    // Article page strategy
    this.addStrategy('article.view', {
      priority: 'high',
      triggers: ['route.article'],
      prefetch: async (context) => {
        const { articleId } = context;
        const strategies = [];

        // Prefetch related articles
        if (articleId) {
          strategies.push({
            queryKey: ARTICLES_QUERY_KEYS.related(articleId),
            queryFn: () => this.getApiService().then(api => api.articles.getRelated(articleId)),
            staleTime: 5 * 60 * 1000,
          });
        }

        // Prefetch comments
        if (articleId) {
          strategies.push({
            queryKey: COMMENTS_QUERY_KEYS.byArticle(articleId),
            queryFn: () => this.getApiService().then(api => api.comments.getByArticle(articleId)),
            staleTime: 2 * 60 * 1000,
          });
        }

        await cacheUtils.warmCache(strategies);
      },
    });

    // User authentication strategy
    this.addStrategy('user.login', {
      priority: 'high',
      triggers: ['auth.login'],
      prefetch: async (context) => {
        const { userId, userRole } = context;
        const strategies = [];

        // Prefetch user's articles if author/admin
        if (['author', 'admin'].includes(userRole)) {
          strategies.push({
            queryKey: ARTICLES_QUERY_KEYS.userArticles(userId),
            queryFn: () => this.getApiService().then(api => api.articles.getUserArticles(userId)),
            staleTime: 5 * 60 * 1000,
          });
        }

        // Prefetch admin data if admin
        if (userRole === 'admin') {
          strategies.push({
            queryKey: ['admin', 'stats'],
            queryFn: () => this.getApiService().then(api => api.admin.getStats()),
            staleTime: 5 * 60 * 1000,
          });
        }

        if (strategies.length > 0) {
          await cacheUtils.warmCache(strategies);
        }
      },
    });

    // Navigation prediction strategy
    this.addStrategy('navigation.predict', {
      priority: 'medium',
      triggers: ['hover.link', 'scroll.bottom'],
      prefetch: async (context) => {
        const { predictedPages } = context;
        
        for (const page of predictedPages) {
          await this.prefetchPage(page);
        }
      },
    });

    // Idle prefetching strategy
    this.addStrategy('idle.prefetch', {
      priority: 'low',
      triggers: ['user.idle'],
      prefetch: async () => {
        // Prefetch likely next pages based on user behavior
        const likelyPages = this.predictNextPages();
        
        for (const page of likelyPages) {
          await this.prefetchPage(page);
        }
      },
    });
  }

  /**
   * Add custom warming strategy
   */
  addStrategy(name, strategy) {
    this.warmingStrategies.set(name, strategy);
  }

  /**
   * Execute warming strategy
   */
  async executeStrategy(strategyName, context = {}) {
    const strategy = this.warmingStrategies.get(strategyName);
    if (!strategy) {
      console.warn('Unknown warming strategy:', strategyName);
      return;
    }

    this.stats.totalWarmups++;
    const startTime = Date.now();

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔥 Executing cache warming strategy:', strategyName, context);
      }
      await strategy.prefetch(context);
      
      this.stats.successfulWarmups++;
      const warmupTime = Date.now() - startTime;
      this.updateAverageWarmupTime(warmupTime);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Cache warming completed: ${strategyName} (${warmupTime}ms)`);
      }
    } catch (error) {
      this.stats.failedWarmups++;
      console.warn('❌ Cache warming failed:', strategyName, error);
      // Don't throw error to prevent breaking app initialization
    }
  }

  /**
   * Intelligent page prefetching
   */
  async prefetchPage(pageInfo) {
    const { type, params } = pageInfo;
    
    try {
      switch (type) {
        case 'article':
          await this.prefetchArticle(params.slug || params.id);
          break;
        
        case 'articleList':
          await this.prefetchArticleList(params);
          break;
        
        case 'tag':
          await this.prefetchTag(params.slug);
          break;
        
        case 'user':
          await this.prefetchUser(params.userId);
          break;
        
        default:
          console.warn('Unknown page type for prefetching:', type);
      }
    } catch (error) {
      console.warn('Page prefetch failed:', pageInfo, error);
    }
  }

  /**
   * Prefetch article and related data
   */
  async prefetchArticle(slugOrId) {
    // Prevent prefetching the current article to avoid cache conflicts
    const currentPath = window.location.pathname;
    const currentArticleMatch = currentPath.match(/^\/articles\/(.+)$/);
    
    if (currentArticleMatch) {
      const currentSlug = currentArticleMatch[1];
      // Don't prefetch if this is the current article
      if (slugOrId === currentSlug || slugOrId.toString() === currentSlug) {
        console.log('🚫 Skipping prefetch for current article:', slugOrId);
        return;
      }
    }

    const api = await this.getApiService();
    const strategies = [];

    if (isNaN(slugOrId)) {
      // It's a slug
      strategies.push({
        queryKey: ARTICLES_QUERY_KEYS.bySlug(slugOrId),
        queryFn: () => api.articles.getBySlug(slugOrId),
        staleTime: 10 * 60 * 1000,
      });
    } else {
      // It's an ID
      strategies.push({
        queryKey: ARTICLES_QUERY_KEYS.detail(slugOrId),
        queryFn: () => api.articles.getById(slugOrId),
        staleTime: 10 * 60 * 1000,
      });
    }

    await cacheUtils.warmCache(strategies);
  }

  /**
   * Prefetch article list
   */
  async prefetchArticleList(params = {}) {
    // Don't prefetch article list if user is currently on an individual article page
    // This prevents cache interference with the current article's images and data
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/articles/') && currentPath !== '/articles') {
      console.log('🚫 Skipping article list prefetch - user is on individual article page');
      return;
    }

    const api = await this.getApiService();
    
    const strategy = {
      queryKey: ARTICLES_QUERY_KEYS.list(params),
      queryFn: () => api.articles.getAll(params),
      staleTime: 5 * 60 * 1000,
    };

    await cacheUtils.warmCache([strategy]);
  }

  /**
   * Prefetch tag and related articles
   */
  async prefetchTag(slug) {
    const api = await this.getApiService();
    const strategies = [
      {
        queryKey: TAGS_QUERY_KEYS.bySlug(slug),
        queryFn: () => api.tags.getBySlug(slug),
        staleTime: 15 * 60 * 1000,
      },
      {
        queryKey: ARTICLES_QUERY_KEYS.list({ tag: slug, limit: 10 }),
        queryFn: () => api.articles.getAll({ tag: slug, limit: 10 }),
        staleTime: 5 * 60 * 1000,
      },
    ];

    await cacheUtils.warmCache(strategies);
  }

  /**
   * Prefetch user profile and content
   */
  async prefetchUser(userId) {
    await requestUtils.intelligentPrefetch.prefetchUserContent(userId);
  }

  /**
   * Predict next pages based on user behavior
   */
  predictNextPages() {
    const predictions = [];
    const currentPath = window.location.pathname;
    
    // Common navigation patterns
    if (currentPath === '/') {
      predictions.push({ type: 'articleList', params: {} });
      predictions.push({ type: 'articleList', params: { popular: true } });
    } else if (currentPath.startsWith('/articles/')) {
      // On article page, likely to view more articles
      predictions.push({ type: 'articleList', params: {} });
    } else if (currentPath === '/articles') {
      // On article list, likely to view individual articles
      const recentArticles = this.getRecentlyViewedArticles();
      recentArticles.forEach(article => {
        predictions.push({ type: 'article', params: { slug: article.slug } });
      });
    }

    // User behavior-based predictions
    const behaviorPredictions = this.getBehaviorBasedPredictions();
    predictions.push(...behaviorPredictions);

    return predictions.slice(0, 5); // Limit to 5 predictions
  }

  /**
   * Get recently viewed articles from user behavior
   */
  getRecentlyViewedArticles() {
    return this.userBehaviorData.recentArticles || [];
  }

  /**
   * Get predictions based on user behavior patterns
   */
  getBehaviorBasedPredictions() {
    const predictions = [];
    const { frequentTags, preferredCategories } = this.userBehaviorData;

    // Predict based on frequent tags
    if (frequentTags && frequentTags.length > 0) {
      const topTag = frequentTags[0];
      predictions.push({ type: 'tag', params: { slug: topTag.slug } });
    }

    // Predict based on preferred categories
    if (preferredCategories && preferredCategories.length > 0) {
      const topCategory = preferredCategories[0];
      predictions.push({ 
        type: 'articleList', 
        params: { category: topCategory } 
      });
    }

    return predictions;
  }

  /**
   * Load user behavior data from localStorage
   */
  loadUserBehavior() {
    try {
      const stored = localStorage.getItem('user_behavior_data');
      return stored ? JSON.parse(stored) : {
        recentArticles: [],
        frequentTags: [],
        preferredCategories: [],
        navigationPatterns: [],
      };
    } catch (error) {
      return {
        recentArticles: [],
        frequentTags: [],
        preferredCategories: [],
        navigationPatterns: [],
      };
    }
  }

  /**
   * Save user behavior data to localStorage
   */
  saveUserBehavior() {
    try {
      localStorage.setItem('user_behavior_data', JSON.stringify(this.userBehaviorData));
    } catch (error) {
      console.warn('Failed to save user behavior data:', error);
    }
  }

  /**
   * Track user behavior for better predictions
   */
  startBehaviorTracking() {
    if (typeof window === 'undefined') return;

    // Track page views
    this.trackPageViews();
    
    // Track link hovers for prefetching
    this.trackLinkHovers();
    
    // Track scroll behavior
    this.trackScrollBehavior();
    
    // Track user idle state
    this.trackUserIdleState();
  }

  /**
   * Track page views
   */
  trackPageViews() {
    const trackPageView = () => {
      const path = window.location.pathname;
      
      // Track article views
      const articleMatch = path.match(/^\/articles\/(.+)$/);
      if (articleMatch) {
        const slug = articleMatch[1];
        this.recordArticleView(slug);
      }
      
      // Track tag views
      const tagMatch = path.match(/^\/tags\/(.+)$/);
      if (tagMatch) {
        const slug = tagMatch[1];
        this.recordTagView(slug);
      }
    };

    // Track initial page load
    trackPageView();
    
    // Track navigation changes
    window.addEventListener('popstate', trackPageView);
  }

  /**
   * Track link hovers for intelligent prefetching
   */
  trackLinkHovers() {
    let hoverTimeout;
    
    document.addEventListener('mouseover', (event) => {
      const link = event.target.closest('a[href]');
      if (!link) return;
      
      clearTimeout(hoverTimeout);
      hoverTimeout = setTimeout(() => {
        this.handleLinkHover(link);
      }, 100); // 100ms delay to avoid excessive prefetching
    });
    
    document.addEventListener('mouseout', () => {
      clearTimeout(hoverTimeout);
    });
  }

  /**
   * Handle link hover for prefetching
   */
  handleLinkHover(link) {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#')) return;
    
    const pageInfo = this.parseUrlForPrefetch(href);
    if (pageInfo) {
      this.executeStrategy('navigation.predict', { 
        predictedPages: [pageInfo] 
      });
    }
  }

  /**
   * Parse URL for prefetching
   */
  parseUrlForPrefetch(url) {
    // Article URLs
    const articleMatch = url.match(/^\/articles\/(.+)$/);
    if (articleMatch) {
      return { type: 'article', params: { slug: articleMatch[1] } };
    }
    
    // Tag URLs
    const tagMatch = url.match(/^\/tags\/(.+)$/);
    if (tagMatch) {
      return { type: 'tag', params: { slug: tagMatch[1] } };
    }
    
    // Article list - but only prefetch if not already on an individual article page
    if (url === '/articles') {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith('/articles/') && currentPath !== '/articles') {
        // Skip article list prefetch when on individual article pages to prevent interference
        return null;
      }
      return { type: 'articleList', params: {} };
    }
    
    return null;
  }

  /**
   * Track scroll behavior
   */
  trackScrollBehavior() {
    let scrollTimeout;
    
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        
        if (scrollPercent > 80) {
          // User is near bottom, might navigate to next page
          this.executeStrategy('navigation.predict', {
            predictedPages: this.predictNextPages()
          });
        }
      }, 500);
    });
  }

  /**
   * Track user idle state
   */
  trackUserIdleState() {
    let idleTimeout;
    const IDLE_TIME = 3000; // 3 seconds
    
    const resetIdleTimer = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        this.executeStrategy('idle.prefetch');
      }, IDLE_TIME);
    };
    
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });
    
    resetIdleTimer();
  }

  /**
   * Record article view
   */
  recordArticleView(slug) {
    const recent = this.userBehaviorData.recentArticles;
    const existing = recent.findIndex(a => a.slug === slug);
    
    if (existing !== -1) {
      recent.splice(existing, 1);
    }
    
    recent.unshift({ slug, timestamp: Date.now() });
    this.userBehaviorData.recentArticles = recent.slice(0, 10);
    
    this.saveUserBehavior();
  }

  /**
   * Record tag view
   */
  recordTagView(slug) {
    const frequent = this.userBehaviorData.frequentTags;
    const existing = frequent.find(t => t.slug === slug);
    
    if (existing) {
      existing.count++;
    } else {
      frequent.push({ slug, count: 1 });
    }
    
    frequent.sort((a, b) => b.count - a.count);
    this.userBehaviorData.frequentTags = frequent.slice(0, 5);
    
    this.saveUserBehavior();
  }

  /**
   * Lazy load API service
   */
  async getApiService() {
    const { default: apiService } = await import('../services/api');
    return apiService;
  }

  /**
   * Update average warmup time
   */
  updateAverageWarmupTime(newTime) {
    const total = this.stats.averageWarmupTime * (this.stats.successfulWarmups - 1) + newTime;
    this.stats.averageWarmupTime = total / this.stats.successfulWarmups;
  }

  /**
   * Get cache warming statistics
   */
  getStats() {
    return {
      ...this.stats,
      strategies: this.warmingStrategies.size,
      pendingPrefetches: this.prefetchQueue.length,
      behaviorData: {
        recentArticles: this.userBehaviorData.recentArticles.length,
        frequentTags: this.userBehaviorData.frequentTags.length,
      },
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalWarmups: 0,
      successfulWarmups: 0,
      failedWarmups: 0,
      averageWarmupTime: 0,
      prefetchHits: 0,
      prefetchMisses: 0,
    };
  }

  /**
   * Clear all cached data
   */
  clear() {
    this.prefetchQueue = [];
    this.userBehaviorData = {
      recentArticles: [],
      frequentTags: [],
      preferredCategories: [],
      navigationPatterns: [],
    };
    this.saveUserBehavior();
  }
}

// Global cache warming manager
export const cacheWarmingManager = new CacheWarmingManager();

// Convenience functions
export const warmCache = {
  // Execute specific strategies
  onAppInit: () => cacheWarmingManager.executeStrategy('app.init'),
  onArticleView: (context) => cacheWarmingManager.executeStrategy('article.view', context),
  onUserLogin: (context) => cacheWarmingManager.executeStrategy('user.login', context),
  
  // Manual prefetching
  prefetchArticle: (slug) => cacheWarmingManager.prefetchArticle(slug),
  prefetchArticleList: (params) => cacheWarmingManager.prefetchArticleList(params),
  prefetchTag: (slug) => cacheWarmingManager.prefetchTag(slug),
  prefetchUser: (userId) => cacheWarmingManager.prefetchUser(userId),
  
  // Statistics and debugging
  getStats: () => cacheWarmingManager.getStats(),
  clear: () => cacheWarmingManager.clear(),
};

export default cacheWarmingManager;