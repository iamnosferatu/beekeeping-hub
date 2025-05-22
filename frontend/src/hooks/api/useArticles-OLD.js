// frontend/src/hooks/api/useArticles.js
import { useApi, usePaginatedApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to fetch all articles with filters
 */
export const useArticles = (filters = {}, options = {}) => {
  return usePaginatedApi(apiService.articles.getAll, filters, options);
};

/**
 * Hook to fetch a single article by ID
 */
export const useArticle = (id, options = {}) => {
  return useApi(() => apiService.articles.getById(id), [id], {
    immediate: !!id,
    ...options,
  });
};

/**
 * Hook to fetch a single article by slug
 */
export const useArticleBySlug = (slug, options = {}) => {
  return useApi(() => apiService.articles.getBySlug(slug), [slug], {
    immediate: !!slug,
    ...options,
  });
};

/**
 * Hook to fetch current user's articles
 */
export const useMyArticles = (filters = {}, options = {}) => {
  return usePaginatedApi(apiService.articles.getMyArticles, filters, options);
};

/**
 * Hook to create a new article
 */
export const useCreateArticle = (options = {}) => {
  return useMutation(apiService.articles.create, options);
};

/**
 * Hook to update an article
 */
export const useUpdateArticle = (options = {}) => {
  return useMutation(
    (id, data) => apiService.articles.update(id, data),
    options
  );
};

/**
 * Hook to delete an article
 */
export const useDeleteArticle = (options = {}) => {
  return useMutation(apiService.articles.delete, options);
};

/**
 * Hook to toggle article like
 */
export const useToggleArticleLike = (options = {}) => {
  return useMutation(apiService.articles.toggleLike, options);
};

