// frontend/src/hooks/api/useArticles.js - NO MOCK DATA VERSION
import { useApi, usePaginatedApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to fetch all articles with filters - No fallback, will fail if API unavailable
 */
export const useArticles = (filters = {}, options = {}) => {
  const { onError = null } = options;

  console.log("useArticles called with filters:", filters);

  return usePaginatedApi(
    async (params) => {
      console.log("useArticles API call with params:", params);

      const response = await apiService.articles.getAll(params);
      console.log("useArticles API Response:", response);

      // Check if response has the expected structure
      if (response.success && response.data) {
        return response;
      } else {
        throw new Error("Invalid response structure");
      }
    },
    filters,
    {
      ...options,
      onError: (error) => {
        console.error("useArticles error:", error);
        if (onError) {
          onError(error);
        }
      },
    }
  );
};

/**
 * Hook to fetch a single article by ID - No fallback
 */
export const useArticle = (id, options = {}) => {
  return useApi(
    async () => {
      const response = await apiService.articles.getById(id);
      return response;
    },
    [id],
    {
      immediate: !!id,
      ...options,
    }
  );
};

/**
 * Hook to fetch a single article by slug - No fallback
 */
export const useArticleBySlug = (slug, options = {}) => {
  return useApi(
    async () => {
      const response = await apiService.articles.getBySlug(slug);
      return response;
    },
    [slug],
    {
      immediate: !!slug,
      ...options,
    }
  );
};

/**
 * Hook to fetch current user's articles - No fallback
 */
export const useMyArticles = (filters = {}, options = {}) => {
  return usePaginatedApi(
    async (params) => {
      const response = await apiService.articles.getMyArticles(params);
      return response;
    },
    filters,
    options
  );
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
