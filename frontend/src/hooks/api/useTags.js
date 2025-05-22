// frontend/src/hooks/api/useTags.js
import { useApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to fetch all tags
 */
export const useTags = (options = {}) => {
  return useApi(apiService.tags.getAll, [], options);
};

/**
 * Hook to fetch a tag by slug
 */
export const useTag = (slug, options = {}) => {
  return useApi(() => apiService.tags.getBySlug(slug), [slug], {
    immediate: !!slug,
    ...options,
  });
};

/**
 * Hook to create a tag
 */
export const useCreateTag = (options = {}) => {
  return useMutation(apiService.tags.create, options);
};
