// frontend/src/hooks/queries/useComments.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';

// Query keys for comments
export const COMMENTS_QUERY_KEYS = {
  all: ['comments'],
  lists: () => [...COMMENTS_QUERY_KEYS.all, 'list'],
  byArticle: (articleId) => [...COMMENTS_QUERY_KEYS.lists(), 'article', articleId],
  detail: (id) => [...COMMENTS_QUERY_KEYS.all, 'detail', id],
};

// Hook for fetching comments by article
export const useCommentsByArticle = (articleId) => {
  return useQuery({
    queryKey: COMMENTS_QUERY_KEYS.byArticle(articleId),
    queryFn: async () => {
      const response = await apiService.comments.getByArticle(articleId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch comments');
      }
      return response.data;
    },
    enabled: !!articleId,
    staleTime: 30 * 1000, // Comments are stale after 30 seconds
  });
};

// Hook for fetching single comment
export const useComment = (commentId) => {
  return useQuery({
    queryKey: COMMENTS_QUERY_KEYS.detail(commentId),
    queryFn: async () => {
      const response = await apiService.comments.getById(commentId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch comment');
      }
      return response.data;
    },
    enabled: !!commentId,
    // Aggressive settings to ensure comments always load on first try
    refetchOnMount: true, // Always fetch on mount
    refetchOnWindowFocus: false, // Don't refetch on focus
    staleTime: 0, // Always consider stale initially, then cache for subsequent requests
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes once loaded
  });
};

// Mutation for creating comments
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentData) => {
      const response = await apiService.comments.create(commentData);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create comment');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate comments for the article
      queryClient.invalidateQueries({
        queryKey: COMMENTS_QUERY_KEYS.byArticle(data.article_id)
      });
      
      // Add the new comment to the cache
      queryClient.setQueryData(COMMENTS_QUERY_KEYS.detail(data.id), data);
    },
    onError: (error) => {
      console.error('Create comment error:', error);
    },
  });
};

// Mutation for updating comments
export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await apiService.comments.update(id, data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update comment');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cached comment
      queryClient.setQueryData(COMMENTS_QUERY_KEYS.detail(data.id), data);
      
      // Invalidate comments for the article to refresh the list
      queryClient.invalidateQueries({
        queryKey: COMMENTS_QUERY_KEYS.byArticle(data.article_id)
      });
    },
    onError: (error) => {
      console.error('Update comment error:', error);
    },
  });
};

// Mutation for deleting comments
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId) => {
      const response = await apiService.comments.delete(commentId);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete comment');
      }
      return { id: commentId, ...response.data };
    },
    onMutate: async (commentId) => {
      // Get the comment data before deletion to know which article to update
      const comment = queryClient.getQueryData(COMMENTS_QUERY_KEYS.detail(commentId));
      return { comment };
    },
    onSuccess: (data, variables, context) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: COMMENTS_QUERY_KEYS.detail(data.id) });
      
      // Invalidate comments for the article if we know which article
      if (context?.comment?.article_id) {
        queryClient.invalidateQueries({
          queryKey: COMMENTS_QUERY_KEYS.byArticle(context.comment.article_id)
        });
      } else {
        // Fallback: invalidate all comment lists
        queryClient.invalidateQueries({
          queryKey: COMMENTS_QUERY_KEYS.lists()
        });
      }
    },
    onError: (error) => {
      console.error('Delete comment error:', error);
    },
  });
};

// Optimistic comment creation for better UX
export const useOptimisticCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentData) => {
      const response = await apiService.comments.create(commentData);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to create comment');
      }
      return response.data;
    },
    onMutate: async (newComment) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({
        queryKey: COMMENTS_QUERY_KEYS.byArticle(newComment.article_id)
      });

      // Snapshot the previous value
      const previousComments = queryClient.getQueryData(
        COMMENTS_QUERY_KEYS.byArticle(newComment.article_id)
      );

      // Optimistically update to the new value
      if (previousComments) {
        const optimisticComment = {
          id: `temp-${Date.now()}`, // Temporary ID
          ...newComment,
          created_at: new Date().toISOString(),
          status: 'pending',
          user: {
            // Add current user data if available
            username: 'You',
            avatar: null,
          },
        };

        queryClient.setQueryData(
          COMMENTS_QUERY_KEYS.byArticle(newComment.article_id),
          {
            ...previousComments,
            comments: [...(previousComments.comments || []), optimisticComment],
          }
        );
      }

      // Return a context object with the snapshotted value
      return { previousComments, articleId: newComment.article_id };
    },
    onError: (err, newComment, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousComments) {
        queryClient.setQueryData(
          COMMENTS_QUERY_KEYS.byArticle(context.articleId),
          context.previousComments
        );
      }
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({
        queryKey: COMMENTS_QUERY_KEYS.byArticle(context?.articleId || variables.article_id)
      });
    },
  });
};