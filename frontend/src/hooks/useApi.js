// frontend/src/hooks/useApi.js - ENHANCED WITH DEBUG
import { useState, useEffect, useCallback } from "react";

/**
 * Generic hook for API calls with loading, error, and data states
 */
export const useApi = (apiCall, dependencies = [], options = {}) => {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null,
  });

  const {
    immediate = true,
    onSuccess = null,
    onError = null,
    transform = null,
  } = options;

  const execute = useCallback(
    async (...args) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiCall(...args);
        console.log("useApi execute response:", response);

        if (response.success) {
          const data = transform ? transform(response.data) : response.data;
          setState({ data, loading: false, error: null });

          if (onSuccess) {
            onSuccess(data);
          }

          return { success: true, data };
        } else {
          const error = response.error;
          setState((prev) => ({ ...prev, loading: false, error }));

          if (onError) {
            onError(error);
          }

          return { success: false, error };
        }
      } catch (error) {
        console.error("useApi execute error:", error);
        setState((prev) => ({ ...prev, loading: false, error }));

        if (onError) {
          onError(error);
        }

        return { success: false, error };
      }
    },
    [apiCall, onSuccess, onError, transform]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    execute,
    reset,
    refetch: execute,
  };
};

/**
 * Hook for paginated API calls
 */
export const usePaginatedApi = (apiCall, initialParams = {}, options = {}) => {
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    ...initialParams,
  });

  const [state, setState] = useState({
    data: null,
    pagination: {
      page: 1,
      limit: 10,
      totalPages: 0,
      total: 0,
    },
    loading: false,
    error: null,
  });

  const { onSuccess = null, onError = null } = options;

  const execute = useCallback(
    async (newParams = {}) => {
      const mergedParams = { ...params, ...newParams };
      setState((prev) => ({ ...prev, loading: true, error: null }));

      console.log("usePaginatedApi execute with params:", mergedParams);

      try {
        const response = await apiCall(mergedParams);
        console.log("usePaginatedApi response:", response);

        if (response.success) {
          // Handle different response structures
          let data, pagination;

          if (response.data && Array.isArray(response.data)) {
            // Direct array response
            data = response.data;
            pagination = response.pagination || {
              page: mergedParams.page || 1,
              limit: mergedParams.limit || 10,
              totalPages: 1,
              total: response.data.length,
            };
          } else if (response.data && response.data.data) {
            // Nested response structure
            data = response.data.data;
            pagination = response.data.pagination ||
              response.pagination || {
                page: mergedParams.page || 1,
                limit: mergedParams.limit || 10,
                totalPages: 1,
                total: response.data.data.length,
              };
          } else {
            // Fallback
            data = response.data || [];
            pagination = response.pagination || {
              page: mergedParams.page || 1,
              limit: mergedParams.limit || 10,
              totalPages: 1,
              total: 0,
            };
          }

          console.log("usePaginatedApi processed data:", { data, pagination });

          setState({
            data,
            pagination,
            loading: false,
            error: null,
          });

          if (onSuccess) {
            onSuccess({ data, pagination });
          }

          return { success: true, data, pagination };
        } else {
          const error = response.error;
          console.error("usePaginatedApi error response:", error);
          setState((prev) => ({ ...prev, loading: false, error }));

          if (onError) {
            onError(error);
          }

          return { success: false, error };
        }
      } catch (error) {
        console.error("usePaginatedApi catch error:", error);
        setState((prev) => ({ ...prev, loading: false, error }));

        if (onError) {
          onError(error);
        }

        return { success: false, error };
      }
    },
    [apiCall, params, onSuccess, onError]
  );

  const changePage = useCallback(
    (page) => {
      const newParams = { ...params, page };
      setParams(newParams);
      execute(newParams);
    },
    [params, execute]
  );

  const changeLimit = useCallback(
    (limit) => {
      const newParams = { ...params, limit, page: 1 };
      setParams(newParams);
      execute(newParams);
    },
    [params, execute]
  );

  const updateFilters = useCallback(
    (filters) => {
      const newParams = { ...params, ...filters, page: 1 };
      setParams(newParams);
      execute(newParams);
    },
    [params, execute]
  );

  useEffect(() => {
    execute();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    params,
    changePage,
    changeLimit,
    updateFilters,
    refetch: () => execute(),
    reset: () => {
      const initialState = {
        page: 1,
        limit: 10,
        ...initialParams,
      };
      setParams(initialState);
      execute(initialState);
    },
  };
};

/**
 * Hook for mutations (POST, PUT, DELETE operations)
 */
export const useMutation = (apiCall, options = {}) => {
  const [state, setState] = useState({
    loading: false,
    error: null,
    success: false,
  });

  const { onSuccess = null, onError = null } = options;

  const mutate = useCallback(
    async (...args) => {
      setState({ loading: true, error: null, success: false });

      try {
        const response = await apiCall(...args);

        if (response.success) {
          setState({ loading: false, error: null, success: true });

          if (onSuccess) {
            onSuccess(response.data);
          }

          return { success: true, data: response.data };
        } else {
          const error = response.error;
          setState({ loading: false, error, success: false });

          if (onError) {
            onError(error);
          }

          return { success: false, error };
        }
      } catch (error) {
        setState({ loading: false, error, success: false });

        if (onError) {
          onError(error);
        }

        return { success: false, error };
      }
    },
    [apiCall, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({ loading: false, error: null, success: false });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
};
