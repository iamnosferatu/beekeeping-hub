// frontend/src/hooks/queries/useTags.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';

// Query keys for tags
export const TAGS_QUERY_KEYS = {
  all: ['tags'],
  lists: () => [...TAGS_QUERY_KEYS.all, 'list'],
  list: (params) => [...TAGS_QUERY_KEYS.lists(), params],
  detail: (id) => [...TAGS_QUERY_KEYS.all, 'detail', id],
  bySlug: (slug) => [...TAGS_QUERY_KEYS.all, 'slug', slug],
  popular: () => [...TAGS_QUERY_KEYS.all, 'popular'],
};

// Hook for fetching all tags
export const useTags = (params = {}) => {
  return useQuery({
    queryKey: TAGS_QUERY_KEYS.list(params),
    queryFn: async () => {
      const response = await apiService.tags.getAll(params);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch tags');
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // Tags are stale after 10 minutes
  });
};

// Hook for fetching popular tags
export const usePopularTags = (limit = 10) => {
  return useQuery({
    queryKey: TAGS_QUERY_KEYS.popular(),
    queryFn: async () => {
      const response = await apiService.tags.getPopular(limit);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch popular tags');
      }
      return response.data;
    },
    staleTime: 15 * 60 * 1000, // Popular tags are stale after 15 minutes
  });
};

// Hook for fetching single tag by slug
export const useTagBySlug = (slug) => {
  return useQuery({
    queryKey: TAGS_QUERY_KEYS.bySlug(slug),
    queryFn: async () => {
      const response = await apiService.tags.getBySlug(slug);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch tag');
      }
      return response.data;
    },
    enabled: !!slug,
  });
};

// Hook for fetching single tag by ID
export const useTag = (id) => {
  return useQuery({
    queryKey: TAGS_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const response = await apiService.tags.getById(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch tag');
      }
      return response.data;
    },
    enabled: !!id,
  });
};

// Mutation for creating tags
export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagData) => {
      const response = await apiService.tags.create(tagData);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create tag');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate tags list to refetch with new tag
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEYS.lists() });
      
      // Add the new tag to the cache
      queryClient.setQueryData(TAGS_QUERY_KEYS.detail(data.id), data);
      
      // If the tag has a slug, also cache it by slug
      if (data.slug) {
        queryClient.setQueryData(TAGS_QUERY_KEYS.bySlug(data.slug), data);
      }
    },
    onError: (error) => {
      console.error('Create tag error:', error);
    },
  });
};

// Mutation for updating tags
export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiService.tags.update(id, data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update tag');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cached tag
      queryClient.setQueryData(TAGS_QUERY_KEYS.detail(data.id), data);
      
      // Update by slug cache if available
      if (data.slug) {
        queryClient.setQueryData(TAGS_QUERY_KEYS.bySlug(data.slug), data);
      }
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEYS.popular() });
    },
    onError: (error) => {
      console.error('Update tag error:', error);
    },
  });
};

// Mutation for deleting tags
export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await apiService.tags.delete(id);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete tag');
      }
      return response.data;
    },
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: TAGS_QUERY_KEYS.detail(deletedId) });
      
      // Invalidate lists to remove the deleted tag
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TAGS_QUERY_KEYS.popular() });
    },
    onError: (error) => {
      console.error('Delete tag error:', error);
    },
  });
};