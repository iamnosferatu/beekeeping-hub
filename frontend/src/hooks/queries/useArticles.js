// frontend/src/hooks/queries/useArticles.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';
import { invalidateCache } from '../../lib/cacheInvalidation';

// Query keys for articles
export const ARTICLES_QUERY_KEYS = {
  all: ['articles'],
  lists: () => [...ARTICLES_QUERY_KEYS.all, 'list'],
  list: (params) => {
    // Normalize params to ensure consistent cache keys
    const normalizedParams = { ...params };
    
    // Remove undefined/null values
    Object.keys(normalizedParams).forEach(key => {
      if (normalizedParams[key] === undefined || normalizedParams[key] === null) {
        delete normalizedParams[key];
      }
    });
    
    // Remove default values to ensure cache consistency
    // This prevents cache misses when components pass explicit defaults
    if (normalizedParams.page === 1) {
      delete normalizedParams.page;
    }
    // Don't remove limit since different components use different limits (8, 10, etc)
    // The cache warming will warm both common limits
    
    // Sort params for consistent ordering
    const sortedParams = Object.keys(normalizedParams).sort().reduce(
      (obj, key) => {
        obj[key] = normalizedParams[key];
        return obj;
      },
      {}
    );
    
    return [...ARTICLES_QUERY_KEYS.lists(), sortedParams];
  },
  details: () => [...ARTICLES_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...ARTICLES_QUERY_KEYS.details(), id],
  bySlug: (slug) => [...ARTICLES_QUERY_KEYS.all, 'slug', slug],
  search: (query) => [...ARTICLES_QUERY_KEYS.all, 'search', query],
  related: (articleId) => [...ARTICLES_QUERY_KEYS.all, 'related', articleId],
  userArticles: (userId) => [...ARTICLES_QUERY_KEYS.all, 'user', userId],
};

// Hook for fetching articles list
export const useArticles = (params = {}) => {
  // Check if this is a filtered query (tag, search, etc) vs homepage list
  const isFilteredQuery = Object.keys(params).length > 0;
  const hasTag = params.tag;
  
  return useQuery({
    queryKey: ARTICLES_QUERY_KEYS.list(params),
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Fetching articles with params:', params);
        console.log('🔑 Query key:', ARTICLES_QUERY_KEYS.list(params));
      }
      
      try {
        const response = await apiService.articles.getAll(params);
        
        if (process.env.NODE_ENV === 'development') {
          console.log('📦 Articles API response:', {
            success: response.success,
            dataType: typeof response.data,
            isArray: Array.isArray(response.data),
            hasArticles: response.data?.articles ? 'yes' : 'no',
            dataKeys: response.data ? Object.keys(response.data) : 'no data',
            articlesCount: Array.isArray(response.data) ? response.data.length : 
                         response.data?.articles?.length || 'unknown',
            fullResponse: response
          });
        }
        
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch articles');
        }
        
        // Ensure we return the correct data structure
        if (response.data) {
          return response.data;
        } else {
          throw new Error('No data in response');
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('❌ Articles fetch error:', error);
        }
        throw error;
      }
    },
    enabled: true,
    // Use aggressive settings for filtered queries (tags, search)
    // Use optimized settings for homepage list
    staleTime: isFilteredQuery ? 0 : 5 * 60 * 1000, // Always stale for filtered, 5min for homepage
    refetchOnMount: isFilteredQuery, // Always refetch filtered queries
    refetchOnWindowFocus: false,
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes once loaded
    retry: (failureCount, error) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Retrying articles fetch, attempt:', failureCount + 1, error);
      }
      // Don't retry 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for fetching single article by slug
export const useArticleBySlug = (slug) => {
  return useQuery({
    queryKey: ARTICLES_QUERY_KEYS.bySlug(slug),
    queryFn: async () => {
      const response = await apiService.articles.getBySlug(slug);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch article');
      }
      return response.data;
    },
    enabled: !!slug,
    // Optimized settings to prevent component unmounting/remounting
    refetchOnMount: 'stale', // Only refetch if data is stale (allows initial fetch)
    refetchOnWindowFocus: false, // Don't refetch on focus
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes once loaded
    retry: (failureCount, error) => {
      // Retry network errors but not 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for fetching single article by ID
export const useArticleById = (id) => {
  return useQuery({
    queryKey: ARTICLES_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await apiService.articles.getById(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch article');
      }
      return response.data;
    },
    enabled: !!id,
    // Optimized settings to prevent component unmounting/remounting
    refetchOnMount: 'stale', // Only refetch if data is stale (allows initial fetch)
    refetchOnWindowFocus: false, // Don't refetch on focus
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes once loaded
    retry: (failureCount, error) => {
      // Retry network errors but not 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Hook for searching articles
export const useArticleSearch = (searchQuery, options = {}) => {
  return useQuery({
    queryKey: ARTICLES_QUERY_KEYS.search(searchQuery),
    queryFn: async () => {
      const response = await apiService.articles.search(searchQuery);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to search articles');
      }
      return response.data;
    },
    enabled: !!searchQuery && searchQuery.length >= 3,
    ...options,
  });
};

// Hook for fetching related articles
export const useRelatedArticles = (articleId) => {
  return useQuery({
    queryKey: ARTICLES_QUERY_KEYS.related(articleId),
    queryFn: async () => {
      const response = await apiService.articles.getRelated(articleId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch related articles');
      }
      return response.data;
    },
    enabled: !!articleId,
  });
};

// Hook for fetching user's articles
export const useUserArticles = (userId, params = {}) => {
  return useQuery({
    queryKey: ARTICLES_QUERY_KEYS.userArticles(userId),
    queryFn: async () => {
      const response = await apiService.articles.getUserArticles(userId, params);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch user articles');
      }
      return response.data;
    },
    enabled: !!userId,
  });
};

// Mutation for creating articles
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (articleData) => {
      const response = await apiService.articles.create(articleData);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create article');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Use intelligent cache invalidation
      invalidateCache.articleCreated(data);
      
      // Add the new article to the cache
      queryClient.setQueryData(ARTICLES_QUERY_KEYS.detail(data.id), data);
      
      // If the article has a slug, also cache it by slug
      if (data.slug) {
        queryClient.setQueryData(ARTICLES_QUERY_KEYS.bySlug(data.slug), data);
      }
    },
    onError: (error) => {
      console.error('Create article error:', error);
    },
  });
};

// Mutation for updating articles
export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiService.articles.update(id, data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update article');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Use intelligent cache invalidation
      invalidateCache.articleUpdated(data);
      
      // Update the cached article
      queryClient.setQueryData(ARTICLES_QUERY_KEYS.detail(data.id), data);
      
      // Update by slug cache if available
      if (data.slug) {
        queryClient.setQueryData(ARTICLES_QUERY_KEYS.bySlug(data.slug), data);
      }
    },
    onError: (error) => {
      console.error('Update article error:', error);
    },
  });
};

// Mutation for deleting articles
export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await apiService.articles.delete(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete article');
      }
      return response.data;
    },
    onSuccess: (_, deletedId) => {
      // Use intelligent cache invalidation
      invalidateCache.articleDeleted({ id: deletedId });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: ARTICLES_QUERY_KEYS.detail(deletedId) });
    },
    onError: (error) => {
      console.error('Delete article error:', error);
    },
  });
};

// Mutation for liking/unliking articles
export const useToggleArticleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ articleId, isLiked }) => {
      const response = isLiked 
        ? await apiService.likes.unlike(articleId)
        : await apiService.likes.like(articleId);
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to toggle like');
      }
      return { ...response.data, articleId, wasLiked: isLiked };
    },
    onMutate: async ({ articleId, isLiked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ARTICLES_QUERY_KEYS.detail(articleId) });
      
      // Snapshot the previous value
      const previousArticle = queryClient.getQueryData(ARTICLES_QUERY_KEYS.detail(articleId));
      
      // Optimistically update
      if (previousArticle) {
        queryClient.setQueryData(ARTICLES_QUERY_KEYS.detail(articleId), {
          ...previousArticle,
          isLiked: !isLiked,
          likesCount: isLiked ? previousArticle.likesCount - 1 : previousArticle.likesCount + 1,
        });
      }
      
      // Return a context object with the snapshotted value
      return { previousArticle, articleId };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousArticle) {
        queryClient.setQueryData(
          ARTICLES_QUERY_KEYS.detail(context.articleId),
          context.previousArticle
        );
      }
    },
    onSuccess: (data) => {
      // Use intelligent cache invalidation for likes
      invalidateCache.likeToggled({
        article_id: data.articleId,
        isLiked: data.wasLiked,
        likeCount: data.likesCount,
      });
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ARTICLES_QUERY_KEYS.detail(variables.articleId) });
    },
  });
};