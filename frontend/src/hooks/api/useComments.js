// frontend/src/hooks/api/useComments.js
import { useApi, usePaginatedApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to fetch comments
 */
export const useComments = (filters = {}, options = {}) => {
  return usePaginatedApi(apiService.comments.getAll, filters, options);
};

/**
 * Hook to create a comment
 */
export const useCreateComment = (options = {}) => {
  return useMutation(apiService.comments.create, options);
};

/**
 * Hook to update a comment
 */
export const useUpdateComment = (options = {}) => {
  return useMutation(
    (id, data) => apiService.comments.update(id, data),
    options
  );
};

/**
 * Hook to delete a comment
 */
export const useDeleteComment = (options = {}) => {
  return useMutation(apiService.comments.delete, options);
};

/**
 * Hook to update comment status (admin only)
 */
export const useUpdateCommentStatus = (options = {}) => {
  return useMutation(
    (id, status) => apiService.comments.updateStatus(id, status),
    options
  );
};
