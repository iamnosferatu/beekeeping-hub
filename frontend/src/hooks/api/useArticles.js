// frontend/src/hooks/api/useArticles.js - SIMPLIFIED VERSION
import { useState, useEffect } from "react";
import apiService from "../../services/api";

/**
 * Simplified hook to fetch all articles - bypasses usePaginatedApi
 */
export const useArticles = (filters = {}, options = {}) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: filters.limit || 10,
      totalPages: 0,
      total: 0,
    },
  });

  console.log("🔄 useArticles called with filters:", filters);

  const fetchArticles = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      console.log("🔄 useArticles: Starting fetch...");

      // Build params for API call
      const params = {
        page: 1,
        limit: filters.limit || 10,
        ...(filters.tag && { tag: filters.tag }),
        ...(filters.search && { search: filters.search }),
      };

      console.log("🔄 useArticles: Calling API with params:", params);

      // Call the API service directly
      const response = await apiService.articles.getAll(params);

      console.log("🔄 useArticles: API response:", response);

      if (response.success) {
        // Extract the articles array from the response
        let articles = [];

        if (Array.isArray(response.data)) {
          // If response.data is directly an array
          articles = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          // If response.data.data is an array
          articles = response.data.data;
        } else if (
          response.data &&
          response.data.articles &&
          Array.isArray(response.data.articles)
        ) {
          // If response.data.articles is an array
          articles = response.data.articles;
        }

        console.log("🔄 useArticles: Extracted articles:", articles);

        // Create pagination info
        const pagination = {
          page: params.page,
          limit: params.limit,
          total: response.data?.count || response.count || articles.length,
          totalPages: Math.ceil(
            (response.data?.count || response.count || articles.length) /
              params.limit
          ),
        };

        console.log("🔄 useArticles: Pagination:", pagination);

        setState({
          data: articles,
          loading: false,
          error: null,
          pagination,
        });

        // Call success callback if provided
        if (options.onSuccess) {
          options.onSuccess(articles);
        }
      } else {
        console.error("🔄 useArticles: API returned success: false", response);
        throw new Error(response.error?.message || "Failed to fetch articles");
      }
    } catch (error) {
      console.error("🔄 useArticles: Error occurred:", error);

      setState((prev) => ({
        ...prev,
        loading: false,
        error: {
          message: error.message || "Failed to load articles",
          type: error.type || "UNKNOWN_ERROR",
          status: error.status,
        },
      }));

      // Call error callback if provided
      if (options.onError) {
        options.onError(error);
      }
    }
  };

  // Fetch articles when component mounts or filters change
  useEffect(() => {
    fetchArticles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.tag, filters.search, filters.limit]); // Only re-fetch when filters actually change

  // Function to change page (simplified for now)
  const changePage = (newPage) => {
    console.log("🔄 useArticles: changePage called with:", newPage);
    // For now, just refetch (you can enhance this later for real pagination)
    fetchArticles();
  };

  // Function to refetch data
  const refetch = () => {
    console.log("🔄 useArticles: refetch called");
    fetchArticles();
  };

  const result = {
    data: state.data,
    loading: state.loading,
    error: state.error,
    pagination: state.pagination,
    changePage,
    refetch,
  };

  console.log("🔄 useArticles: Returning state:", result);

  return result;
};

/**
 * Hook to fetch a single article by ID
 */
export const useArticle = (id, options = {}) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!id) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchArticle = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const response = await apiService.articles.getById(id);

        if (response.success) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });
        } else {
          throw new Error(response.error?.message || "Failed to fetch article");
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error,
        }));
      }
    };

    fetchArticle();
  }, [id]);

  return state;
};

/**
 * Hook to fetch a single article by slug
 */
export const useArticleBySlug = (slug, options = {}) => {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!slug) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    const fetchArticle = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const response = await apiService.articles.getBySlug(slug);

        if (response.success) {
          setState({
            data: response.data,
            loading: false,
            error: null,
          });
        } else {
          throw new Error(response.error?.message || "Failed to fetch article");
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error,
        }));
      }
    };

    fetchArticle();
  }, [slug]);

  return state;
};

// Export other hooks as simple stubs for now
export const useCreateArticle = (options = {}) => {
  return {
    mutate: async (data) => {
      const response = await apiService.articles.create(data);
      return response;
    },
    loading: false,
    error: null,
    success: false,
  };
};

export const useUpdateArticle = (options = {}) => {
  return {
    mutate: async (id, data) => {
      const response = await apiService.articles.update(id, data);
      return response;
    },
    loading: false,
    error: null,
    success: false,
  };
};

export const useDeleteArticle = (options = {}) => {
  return {
    mutate: async (id) => {
      const response = await apiService.articles.delete(id);
      return response;
    },
    loading: false,
    error: null,
    success: false,
  };
};

export const useToggleArticleLike = (options = {}) => {
  return {
    mutate: async (id) => {
      const response = await apiService.articles.toggleLike(id);
      return response;
    },
    loading: false,
    error: null,
    success: false,
  };
};
