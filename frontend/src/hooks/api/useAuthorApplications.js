// frontend/src/hooks/api/useAuthorApplications.js
import { useApi, usePaginatedApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to submit author application
 */
export const useSubmitAuthorApplication = (options = {}) => {
  return useMutation(apiService.authorApplications.submit, options);
};

/**
 * Hook to get current user's application status
 */
export const useMyAuthorApplication = (options = {}) => {
  return useApi(apiService.authorApplications.getMyApplication, [], options);
};

/**
 * Hook to check if user can apply for author status
 */
export const useCanApplyForAuthor = (options = {}) => {
  return useApi(apiService.authorApplications.canApply, [], options);
};

// Admin hooks

/**
 * Hook to fetch all author applications (admin only)
 */
export const useAllAuthorApplications = (filters = {}, options = {}) => {
  return usePaginatedApi(
    apiService.admin.authorApplications.getAll,
    filters,
    options
  );
};

/**
 * Hook to get pending application count (admin only)
 */
export const usePendingApplicationCount = (options = {}) => {
  return useApi(
    apiService.admin.authorApplications.getPendingCount,
    [],
    options
  );
};

/**
 * Hook to get application by ID (admin only)
 */
export const useAuthorApplicationById = (id, options = {}) => {
  return useApi(
    () => apiService.admin.authorApplications.getById(id),
    [id],
    {
      immediate: !!id,
      ...options,
    }
  );
};

/**
 * Hook to review author application (admin only)
 */
export const useReviewAuthorApplication = (options = {}) => {
  return useMutation(
    ({ id, action, adminNotes }) =>
      apiService.admin.authorApplications.review(id, action, adminNotes),
    options
  );
};