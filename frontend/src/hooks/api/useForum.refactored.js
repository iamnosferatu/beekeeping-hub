// frontend/src/hooks/api/useForum.refactored.js
// Refactored version using API service instead of direct axios
import { useApi, usePaginatedApi, useMutation } from "../useApi";
import apiService from "../../services/api";

// ========== CATEGORY HOOKS ==========

/**
 * Hook to fetch forum categories
 */
export const useForumCategories = (params = {}, options = {}) => {
  return usePaginatedApi(
    (queryParams) => apiService.forum.categories.getAll(queryParams),
    params,
    options
  );
};

/**
 * Hook to fetch a single category by slug
 */
export const useForumCategoryBySlug = (slug, options = {}) => {
  return useApi(
    () => apiService.forum.categories.getBySlug(slug),
    [slug],
    { ...options, enabled: !!slug && (options.enabled ?? true) }
  );
};

/**
 * Hook to create a forum category
 */
export const useCreateForumCategory = (options = {}) => {
  return useMutation(
    (categoryData) => apiService.forum.categories.create(categoryData),
    options
  );
};

/**
 * Hook to update a forum category
 */
export const useUpdateForumCategory = (options = {}) => {
  return useMutation(
    ({ id, categoryData }) => apiService.forum.categories.update(id, categoryData),
    options
  );
};

/**
 * Hook to delete a forum category
 */
export const useDeleteForumCategory = (options = {}) => {
  return useMutation(
    (id) => apiService.forum.categories.delete(id),
    options
  );
};

// ========== THREAD HOOKS ==========

/**
 * Hook to fetch forum threads
 */
export const useForumThreads = (params = {}, options = {}) => {
  return usePaginatedApi(
    (queryParams) => apiService.forum.threads.getAll(queryParams),
    params,
    options
  );
};

/**
 * Hook to fetch threads by category slug
 */
export const useForumThreadsByCategory = (categorySlug, params = {}, options = {}) => {
  return usePaginatedApi(
    (queryParams) => apiService.forum.threads.getByCategorySlug(categorySlug, queryParams),
    params,
    { ...options, enabled: !!categorySlug && (options.enabled ?? true) }
  );
};

/**
 * Hook to fetch a single thread by slug
 */
export const useForumThreadBySlug = (slug, options = {}) => {
  return useApi(
    () => apiService.forum.threads.getBySlug(slug),
    [slug],
    { ...options, enabled: !!slug && (options.enabled ?? true) }
  );
};

/**
 * Hook to create a forum thread
 */
export const useCreateForumThread = (options = {}) => {
  return useMutation(
    (threadData) => apiService.forum.threads.create(threadData),
    options
  );
};

/**
 * Hook to update a forum thread
 */
export const useUpdateForumThread = (options = {}) => {
  return useMutation(
    ({ id, threadData }) => apiService.forum.threads.update(id, threadData),
    options
  );
};

/**
 * Hook to delete a forum thread
 */
export const useDeleteForumThread = (options = {}) => {
  return useMutation(
    (id) => apiService.forum.threads.delete(id),
    options
  );
};

/**
 * Hook to pin a thread
 */
export const usePinThread = (options = {}) => {
  return useMutation(
    (id) => apiService.forum.threads.pin(id),
    options
  );
};

/**
 * Hook to unpin a thread
 */
export const useUnpinThread = (options = {}) => {
  return useMutation(
    (id) => apiService.forum.threads.unpin(id),
    options
  );
};

/**
 * Hook to lock a thread
 */
export const useLockThread = (options = {}) => {
  return useMutation(
    (id) => apiService.forum.threads.lock(id),
    options
  );
};

/**
 * Hook to unlock a thread
 */
export const useUnlockThread = (options = {}) => {
  return useMutation(
    (id) => apiService.forum.threads.unlock(id),
    options
  );
};

// ========== COMMENT HOOKS ==========

/**
 * Hook to fetch comments for a thread
 */
export const useForumComments = (threadId, params = {}, options = {}) => {
  return usePaginatedApi(
    (queryParams) => apiService.forum.comments.getByThreadId(threadId, queryParams),
    params,
    { ...options, enabled: !!threadId && (options.enabled ?? true) }
  );
};

/**
 * Hook to create a forum comment
 */
export const useCreateForumComment = (options = {}) => {
  return useMutation(
    ({ threadId, commentData }) => apiService.forum.comments.create(threadId, commentData),
    options
  );
};

/**
 * Hook to update a forum comment
 */
export const useUpdateForumComment = (options = {}) => {
  return useMutation(
    ({ commentId, commentData }) => apiService.forum.comments.update(commentId, commentData),
    options
  );
};

/**
 * Hook to delete a forum comment
 */
export const useDeleteForumComment = (options = {}) => {
  return useMutation(
    (commentId) => apiService.forum.comments.delete(commentId),
    options
  );
};

/**
 * Hook to report a forum comment
 */
export const useReportForumComment = (options = {}) => {
  return useMutation(
    ({ commentId, reason }) => apiService.forum.comments.report(commentId, reason),
    options
  );
};

// ========== ADMIN HOOKS ==========

/**
 * Hook to ban a user from forum
 */
export const useBanForumUser = (options = {}) => {
  return useMutation(
    ({ userId, reason, expiresAt }) => apiService.forum.admin.banUser(userId, reason, expiresAt),
    options
  );
};

/**
 * Hook to unban a user from forum
 */
export const useUnbanForumUser = (options = {}) => {
  return useMutation(
    (userId) => apiService.forum.admin.unbanUser(userId),
    options
  );
};

/**
 * Hook to fetch banned users
 */
export const useBannedForumUsers = (params = {}, options = {}) => {
  return usePaginatedApi(
    (queryParams) => apiService.forum.admin.getBannedUsers(queryParams),
    params,
    options
  );
};

/**
 * Hook to block a forum thread
 */
export const useBlockForumThread = (options = {}) => {
  return useMutation(
    ({ threadId, reason }) => apiService.forum.admin.blockThread(threadId, reason),
    options
  );
};

/**
 * Hook to unblock a forum thread
 */
export const useUnblockForumThread = (options = {}) => {
  return useMutation(
    (threadId) => apiService.forum.admin.unblockThread(threadId),
    options
  );
};

/**
 * Hook to block a forum comment
 */
export const useBlockForumComment = (options = {}) => {
  return useMutation(
    ({ commentId, reason }) => apiService.forum.admin.blockComment(commentId, reason),
    options
  );
};

/**
 * Hook to unblock a forum comment
 */
export const useUnblockForumComment = (options = {}) => {
  return useMutation(
    (commentId) => apiService.forum.admin.unblockComment(commentId),
    options
  );
};

// ========== LEGACY HOOK FOR BACKWARD COMPATIBILITY ==========

/**
 * Legacy useForum hook for backward compatibility
 * @deprecated Use individual hooks instead
 */
export const useForum = () => {
  console.warn('useForum is deprecated. Please use individual forum hooks instead.');
  
  return {
    // Categories
    getCategories: async (params) => {
      const response = await apiService.forum.categories.getAll(params);
      return response.success ? response.data : null;
    },
    getCategoryBySlug: async (slug) => {
      const response = await apiService.forum.categories.getBySlug(slug);
      return response.success ? response.data : null;
    },
    createCategory: async (data) => {
      const response = await apiService.forum.categories.create(data);
      return response.success ? response.data : null;
    },
    updateCategory: async (id, data) => {
      const response = await apiService.forum.categories.update(id, data);
      return response.success ? response.data : null;
    },
    deleteCategory: async (id) => {
      const response = await apiService.forum.categories.delete(id);
      return response.success;
    },
    
    // Threads
    getThreads: async (params) => {
      const response = await apiService.forum.threads.getAll(params);
      return response.success ? response.data : null;
    },
    getThreadsByCategory: async (categorySlug, params) => {
      const response = await apiService.forum.threads.getByCategorySlug(categorySlug, params);
      return response.success ? response.data : null;
    },
    getThreadBySlug: async (slug) => {
      const response = await apiService.forum.threads.getBySlug(slug);
      return response.success ? response.data : null;
    },
    createThread: async (data) => {
      const response = await apiService.forum.threads.create(data);
      return response.success ? response.data : null;
    },
    updateThread: async (id, data) => {
      const response = await apiService.forum.threads.update(id, data);
      return response.success ? response.data : null;
    },
    deleteThread: async (id) => {
      const response = await apiService.forum.threads.delete(id);
      return response.success;
    },
    pinThread: async (id) => {
      const response = await apiService.forum.threads.pin(id);
      return response.success;
    },
    unpinThread: async (id) => {
      const response = await apiService.forum.threads.unpin(id);
      return response.success;
    },
    lockThread: async (id) => {
      const response = await apiService.forum.threads.lock(id);
      return response.success;
    },
    unlockThread: async (id) => {
      const response = await apiService.forum.threads.unlock(id);
      return response.success;
    },
    
    // Comments
    getCommentsByThread: async (threadId, params) => {
      const response = await apiService.forum.comments.getByThreadId(threadId, params);
      return response.success ? response.data : null;
    },
    createComment: async (threadId, data) => {
      const response = await apiService.forum.comments.create(threadId, data);
      return response.success ? response.data : null;
    },
    updateComment: async (commentId, data) => {
      const response = await apiService.forum.comments.update(commentId, data);
      return response.success ? response.data : null;
    },
    deleteComment: async (commentId) => {
      const response = await apiService.forum.comments.delete(commentId);
      return response.success;
    },
    reportComment: async (commentId, reason) => {
      const response = await apiService.forum.comments.report(commentId, reason);
      return response.success;
    },
    
    // Admin
    banUser: async (userId, reason, expiresAt) => {
      const response = await apiService.forum.admin.banUser(userId, reason, expiresAt);
      return response.success;
    },
    unbanUser: async (userId) => {
      const response = await apiService.forum.admin.unbanUser(userId);
      return response.success;
    },
    getBannedUsers: async (params) => {
      const response = await apiService.forum.admin.getBannedUsers(params);
      return response.success ? response.data : null;
    },
    
    // Provide loading and error states for compatibility
    loading: false,
    error: null,
  };
};