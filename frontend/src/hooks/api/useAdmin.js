// frontend/src/hooks/api/useAdmin.js
import { useApi, usePaginatedApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to fetch dashboard stats
 */
export const useDashboardStats = (options = {}) => {
  return useApi(apiService.admin.getDashboardStats, [], options);
};

/**
 * Hook to fetch users for admin
 */
export const useAdminUsers = (filters = {}, options = {}) => {
  return usePaginatedApi(apiService.admin.getUsers, filters, options);
};

/**
 * Hook to update user role
 */
export const useUpdateUserRole = (options = {}) => {
  return useMutation(
    ({ userId, role }) => apiService.admin.updateUserRole(userId, role),
    options
  );
};

/**
 * Hook to delete user
 */
export const useDeleteUser = (options = {}) => {
  return useMutation(
    (userId) => apiService.admin.deleteUser(userId),
    options
  );
};

/**
 * Hook to fetch comments for moderation
 */
export const useCommentsForModeration = (filters = {}, options = {}) => {
  return usePaginatedApi(
    apiService.admin.getCommentsForModeration,
    filters,
    options
  );
};

// ========== ARTICLE MANAGEMENT HOOKS ==========

/**
 * Hook to fetch admin articles
 */
export const useAdminArticles = (filters = {}, options = {}) => {
  return usePaginatedApi(
    (params) => apiService.admin.articles.getAll(params),
    filters,
    options
  );
};

/**
 * Hook to block an article
 */
export const useBlockArticle = (options = {}) => {
  return useMutation(
    ({ articleId, reason }) => apiService.admin.articles.block(articleId, reason),
    options
  );
};

/**
 * Hook to unblock an article
 */
export const useUnblockArticle = (options = {}) => {
  return useMutation(
    (articleId) => apiService.admin.articles.unblock(articleId),
    options
  );
};

/**
 * Hook to delete an article (admin)
 */
export const useDeleteArticleAdmin = (options = {}) => {
  return useMutation(
    (articleId) => apiService.admin.articles.delete(articleId),
    options
  );
};

// ========== COMMENT MANAGEMENT HOOKS ==========

/**
 * Hook to update comment status
 */
export const useUpdateCommentStatus = (options = {}) => {
  return useMutation(
    ({ commentId, status }) => apiService.admin.comments.updateStatus(commentId, status),
    options
  );
};

/**
 * Hook to delete a comment (admin)
 */
export const useDeleteCommentAdmin = (options = {}) => {
  return useMutation(
    (commentId) => apiService.admin.comments.delete(commentId),
    options
  );
};

// ========== TAG MANAGEMENT HOOKS ==========

/**
 * Hook to fetch admin tags
 */
export const useAdminTags = (filters = {}, options = {}) => {
  return usePaginatedApi(
    (params) => apiService.admin.tags.getAll(params),
    filters,
    options
  );
};

/**
 * Hook to create a tag (admin)
 */
export const useCreateTagAdmin = (options = {}) => {
  return useMutation(
    (tagData) => apiService.admin.tags.create(tagData),
    options
  );
};

/**
 * Hook to update a tag (admin)
 */
export const useUpdateTagAdmin = (options = {}) => {
  return useMutation(
    ({ tagId, tagData }) => apiService.admin.tags.update(tagId, tagData),
    options
  );
};

/**
 * Hook to delete a tag (admin)
 */
export const useDeleteTagAdmin = (options = {}) => {
  return useMutation(
    (tagId) => apiService.admin.tags.delete(tagId),
    options
  );
};

/**
 * Hook to merge tags (admin)
 */
export const useMergeTags = (options = {}) => {
  return useMutation(
    ({ sourceTagId, targetTagId }) => apiService.admin.tags.merge(sourceTagId, targetTagId),
    options
  );
};

// ========== CONTACT MESSAGE HOOKS ==========

/**
 * Hook to fetch contact messages
 */
export const useContactMessages = (filters = {}, options = {}) => {
  return usePaginatedApi(
    (params) => apiService.admin.contactMessages.getAll(params),
    filters,
    options
  );
};

/**
 * Hook to mark contact message as read
 */
export const useMarkContactMessageRead = (options = {}) => {
  return useMutation(
    (messageId) => apiService.admin.contactMessages.markAsRead(messageId),
    options
  );
};

/**
 * Hook to delete contact message
 */
export const useDeleteContactMessage = (options = {}) => {
  return useMutation(
    (messageId) => apiService.admin.contactMessages.delete(messageId),
    options
  );
};

// ========== DIAGNOSTICS HOOKS ==========

/**
 * Hook to fetch system diagnostics
 */
export const useSystemDiagnostics = (options = {}) => {
  return useApi(apiService.admin.diagnostics.getSystemInfo, [], options);
};

/**
 * Hook to fetch logs
 */
export const useLogs = (options = {}) => {
  return useApi(apiService.admin.diagnostics.getLogs, [], options);
};

/**
 * Hook to fetch metrics
 */
export const useMetrics = (options = {}) => {
  return useApi(apiService.admin.diagnostics.getMetrics, [], options);
};

/**
 * Hook to fetch database info
 */
export const useDatabaseInfo = (options = {}) => {
  return useApi(apiService.admin.diagnostics.getDatabaseInfo, [], options);
};
