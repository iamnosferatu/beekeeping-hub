// frontend/src/hooks/queries/useArticles.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';

// Query keys for articles
export const ARTICLES_QUERY_KEYS = {
  all: ['articles'],
  lists: () => [...ARTICLES_QUERY_KEYS.all, 'list'],
  list: (params) => [...ARTICLES_QUERY_KEYS.lists(), params],
  details: () => [...ARTICLES_QUERY_KEYS.all, 'detail'],
  detail: (id) => [...ARTICLES_QUERY_KEYS.details(), id],
  bySlug: (slug) => [...ARTICLES_QUERY_KEYS.all, 'slug', slug],
  search: (query) => [...ARTICLES_QUERY_KEYS.all, 'search', query],
  related: (articleId) => [...ARTICLES_QUERY_KEYS.all, 'related', articleId],
  userArticles: (userId) => [...ARTICLES_QUERY_KEYS.all, 'user', userId],
};

// Hook for fetching articles list
export const useArticles = (params = {}) => {
  return useQuery({
    queryKey: ARTICLES_QUERY_KEYS.list(params),
    queryFn: async () => {
      const response = await apiService.articles.getAll(params);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch articles');
      }
      return response.data;
    },
    enabled: true,
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
      // Invalidate articles list to refetch with new article
      queryClient.invalidateQueries({ queryKey: ARTICLES_QUERY_KEYS.lists() });
      
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
      // Update the cached article
      queryClient.setQueryData(ARTICLES_QUERY_KEYS.detail(data.id), data);
      
      // Update by slug cache if available
      if (data.slug) {
        queryClient.setQueryData(ARTICLES_QUERY_KEYS.bySlug(data.slug), data);
      }
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: ARTICLES_QUERY_KEYS.lists() });
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
      // Remove from cache
      queryClient.removeQueries({ queryKey: ARTICLES_QUERY_KEYS.detail(deletedId) });
      
      // Invalidate lists to remove the deleted article
      queryClient.invalidateQueries({ queryKey: ARTICLES_QUERY_KEYS.lists() });
      
      // Also invalidate related queries
      queryClient.invalidateQueries({ queryKey: ARTICLES_QUERY_KEYS.all });
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
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ARTICLES_QUERY_KEYS.detail(variables.articleId) });
    },
  });
};