// frontend/src/lib/cacheInvalidation.js

/**
 * Intelligent Cache Invalidation Manager
 * 
 * Provides smart cache invalidation strategies based on data relationships,
 * user actions, and time-based policies.
 */

import { queryClient, CACHE_PATTERNS } from './queryClient';
import { requestCache } from './requestDeduplication';

class CacheInvalidationManager {
  constructor() {
    this.invalidationRules = new Map();
    this.setupDefaultRules();
    
    // Statistics
    this.stats = {
      totalInvalidations: 0,
      invalidationsByType: {},
      cascadeInvalidations: 0,
    };
  }

  /**
   * Setup default invalidation rules
   */
  setupDefaultRules() {
    // Article-related invalidations
    this.addRule('article.created', (data) => {
      this.invalidatePattern(['articles', 'list']);
      this.invalidatePattern(['articles', 'search']);
      this.invalidatePattern(['tags', 'popular']);
      
      // Invalidate user's articles if available
      if (data.user_id) {
        this.invalidatePattern(['articles', 'user', data.user_id]);
      }
    });

    this.addRule('article.updated', (data) => {
      this.invalidatePattern(['articles', 'detail', data.id]);
      this.invalidatePattern(['articles', 'slug', data.slug]);
      this.invalidatePattern(['articles', 'list']);
      this.invalidatePattern(['articles', 'related', data.id]);
      
      // Invalidate user's articles
      if (data.user_id) {
        this.invalidatePattern(['articles', 'user', data.user_id]);
      }
    });

    this.addRule('article.deleted', (data) => {
      this.invalidatePattern(['articles']);
      this.invalidatePattern(['comments', 'article', data.id]);
      this.invalidatePattern(['tags', 'popular']);
      
      // Remove from request cache
      requestCache.clear();
    });

    // Comment-related invalidations
    this.addRule('comment.created', (data) => {
      this.invalidatePattern(['comments', 'article', data.article_id]);
      
      // Update article comment count if cached
      this.updateArticleCommentCount(data.article_id, 1);
    });

    this.addRule('comment.updated', (data) => {
      this.invalidatePattern(['comments', 'article', data.article_id]);
      this.invalidatePattern(['comments', 'detail', data.id]);
    });

    this.addRule('comment.deleted', (data) => {
      this.invalidatePattern(['comments', 'article', data.article_id]);
      
      // Update article comment count if cached
      this.updateArticleCommentCount(data.article_id, -1);
    });

    // Like-related invalidations
    this.addRule('like.toggled', (data) => {
      this.invalidatePattern(['articles', 'detail', data.article_id]);
      this.invalidatePattern(['articles', 'slug', data.article_slug]);
      
      // Update like count optimistically in cache
      this.updateArticleLikeCount(data.article_id, data.isLiked, data.likeCount);
    });

    // User-related invalidations
    this.addRule('user.updated', (data) => {
      this.invalidatePattern(['user', 'profile']);
      this.invalidatePattern(['articles', 'user', data.id]);
      this.invalidatePattern(['comments', 'user', data.id]);
    });

    // Tag-related invalidations
    this.addRule('tag.created', () => {
      this.invalidatePattern(['tags']);
    });

    this.addRule('tag.updated', (data) => {
      this.invalidatePattern(['tags']);
      this.invalidatePattern(['tags', 'slug', data.old_slug]);
      this.invalidatePattern(['tags', 'slug', data.new_slug]);
    });

    this.addRule('tag.deleted', () => {
      this.invalidatePattern(['tags']);
      this.invalidatePattern(['articles', 'list']); // Articles might be affected
    });

    // Time-based invalidation rules
    this.addRule('time.hourly', () => {
      // Invalidate search results (they get stale quickly)
      this.invalidatePattern(['articles', 'search']);
      this.invalidatePattern(['comments', 'recent']);
    });

    this.addRule('time.daily', () => {
      // Invalidate popular content
      this.invalidatePattern(['tags', 'popular']);
      this.invalidatePattern(['articles', 'popular']);
    });
  }

  /**
   * Add custom invalidation rule
   */
  addRule(event, handler) {
    if (!this.invalidationRules.has(event)) {
      this.invalidationRules.set(event, []);
    }
    this.invalidationRules.get(event).push(handler);
  }

  /**
   * Trigger invalidation for specific event
   */
  invalidate(event, data = {}) {
    const rules = this.invalidationRules.get(event);
    if (!rules) {
      console.warn('No invalidation rules found for event:', event);
      return;
    }

    this.stats.totalInvalidations++;
    this.stats.invalidationsByType[event] = (this.stats.invalidationsByType[event] || 0) + 1;

    console.debug('Triggering cache invalidation for:', event, data);

    rules.forEach(rule => {
      try {
        rule(data);
      } catch (error) {
        console.error('Cache invalidation rule failed:', event, error);
      }
    });
  }

  /**
   * Invalidate queries matching pattern
   */
  invalidatePattern(pattern) {
    queryClient.invalidateQueries({ queryKey: pattern });
    this.stats.cascadeInvalidations++;
  }

  /**
   * Smart invalidation based on data relationships
   */
  smartInvalidate(entityType, action, data) {
    const event = `${entityType}.${action}`;
    this.invalidate(event, data);

    // Cascade invalidations based on relationships
    this.cascadeInvalidations(entityType, action, data);
  }

  /**
   * Handle cascade invalidations
   */
  cascadeInvalidations(entityType, action, data) {
    switch (entityType) {
      case 'article':
        if (action === 'updated' && data.tags_changed) {
          // If tags changed, invalidate tag-related queries
          this.invalidatePattern(['tags']);
          this.invalidatePattern(['articles', 'tag']);
        }
        
        if (action === 'status_changed') {
          // If article status changed, invalidate all lists
          this.invalidatePattern(['articles', 'list']);
          this.invalidatePattern(['articles', 'user', data.user_id]);
        }
        break;

      case 'user':
        if (action === 'role_changed') {
          // Role changes might affect article visibility
          this.invalidatePattern(['articles']);
          this.invalidatePattern(['comments']);
        }
        break;
    }
  }

  /**
   * Update article comment count in cache
   */
  updateArticleCommentCount(articleId, delta) {
    // Update by ID
    const articleByIdKey = ['articles', 'detail', articleId];
    const articleById = queryClient.getQueryData(articleByIdKey);
    if (articleById) {
      queryClient.setQueryData(articleByIdKey, {
        ...articleById,
        comments_count: Math.max(0, (articleById.comments_count || 0) + delta),
      });
    }

    // Find and update by slug if available
    const cache = queryClient.getQueryCache();
    const slugQueries = cache.getAll().filter(query => 
      query.queryKey[0] === 'articles' && 
      query.queryKey[1] === 'slug' &&
      query.state.data?.id === articleId
    );

    slugQueries.forEach(query => {
      const article = query.state.data;
      if (article) {
        queryClient.setQueryData(query.queryKey, {
          ...article,
          comments_count: Math.max(0, (article.comments_count || 0) + delta),
        });
      }
    });
  }

  /**
   * Update article like count in cache
   */
  updateArticleLikeCount(articleId, isLiked, newCount) {
    // Update by ID
    const articleByIdKey = ['articles', 'detail', articleId];
    const articleById = queryClient.getQueryData(articleByIdKey);
    if (articleById) {
      queryClient.setQueryData(articleByIdKey, {
        ...articleById,
        likes_count: newCount,
        is_liked: isLiked,
      });
    }

    // Find and update by slug if available
    const cache = queryClient.getQueryCache();
    const slugQueries = cache.getAll().filter(query => 
      query.queryKey[0] === 'articles' && 
      query.queryKey[1] === 'slug' &&
      query.state.data?.id === articleId
    );

    slugQueries.forEach(query => {
      const article = query.state.data;
      if (article) {
        queryClient.setQueryData(query.queryKey, {
          ...article,
          likes_count: newCount,
          is_liked: isLiked,
        });
      }
    });
  }

  /**
   * Selective cache invalidation based on user permissions
   */
  invalidateForUser(userId, userRole) {
    // Invalidate user-specific content
    this.invalidatePattern(['articles', 'user', userId]);
    this.invalidatePattern(['comments', 'user', userId]);
    this.invalidatePattern(['user', 'profile']);

    // If admin/author, invalidate admin-specific caches
    if (['admin', 'author'].includes(userRole)) {
      this.invalidatePattern(['admin']);
      this.invalidatePattern(['articles', 'draft']);
    }
  }

  /**
   * Time-based invalidation scheduler
   */
  startScheduler() {
    // Hourly invalidations
    setInterval(() => {
      this.invalidate('time.hourly');
    }, 60 * 60 * 1000); // 1 hour

    // Daily invalidations
    setInterval(() => {
      this.invalidate('time.daily');
    }, 24 * 60 * 60 * 1000); // 24 hours

    if (process.env.NODE_ENV === 'development') {
      console.debug('Cache invalidation scheduler started');
    }
  }

  /**
   * Get invalidation statistics
   */
  getStats() {
    return {
      ...this.stats,
      totalRules: this.invalidationRules.size,
      activeQueries: queryClient.getQueryCache().getAll().length,
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalInvalidations: 0,
      invalidationsByType: {},
      cascadeInvalidations: 0,
    };
  }

  /**
   * Export invalidation rules for debugging
   */
  exportRules() {
    const rules = {};
    this.invalidationRules.forEach((handlers, event) => {
      rules[event] = handlers.length;
    });
    return rules;
  }
}

// Global cache invalidation manager
export const cacheInvalidationManager = new CacheInvalidationManager();

// Auto-start scheduler
if (typeof window !== 'undefined') {
  cacheInvalidationManager.startScheduler();
}

// Convenience functions
export const invalidateCache = {
  // Article operations
  articleCreated: (data) => cacheInvalidationManager.invalidate('article.created', data),
  articleUpdated: (data) => cacheInvalidationManager.invalidate('article.updated', data),
  articleDeleted: (data) => cacheInvalidationManager.invalidate('article.deleted', data),
  
  // Comment operations
  commentCreated: (data) => cacheInvalidationManager.invalidate('comment.created', data),
  commentUpdated: (data) => cacheInvalidationManager.invalidate('comment.updated', data),
  commentDeleted: (data) => cacheInvalidationManager.invalidate('comment.deleted', data),
  
  // Like operations
  likeToggled: (data) => cacheInvalidationManager.invalidate('like.toggled', data),
  
  // User operations
  userUpdated: (data) => cacheInvalidationManager.invalidate('user.updated', data),
  
  // Tag operations
  tagCreated: () => cacheInvalidationManager.invalidate('tag.created'),
  tagUpdated: (data) => cacheInvalidationManager.invalidate('tag.updated', data),
  tagDeleted: () => cacheInvalidationManager.invalidate('tag.deleted'),
  
  // Smart invalidation
  smart: (entityType, action, data) => cacheInvalidationManager.smartInvalidate(entityType, action, data),
  
  // Pattern-based invalidation
  pattern: (pattern) => cacheInvalidationManager.invalidatePattern(pattern),
  
  // User-specific invalidation
  forUser: (userId, userRole) => cacheInvalidationManager.invalidateForUser(userId, userRole),
};

export default cacheInvalidationManager;