// frontend/src/hooks/useArticleFetch.js
import { useState, useCallback } from "react";
import axios from "axios";
import { API_URL } from "../config";

const useArticleFetch = (user, isEditMode, id) => {
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  const fetchArticle = useCallback(
    async (articleId) => {
      if (!isEditMode) {
        setLoading(false);
        return null;
      }

      try {
        setLoading(true);
        setError(null);
        setDebugInfo(null);

        console.log(`Attempting to fetch article with ID/Slug: ${articleId}`);

        // Multiple fetch strategies with authentication
        const token = localStorage.getItem("beekeeper_auth_token");
        const config = {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        };

        const fetchStrategies = [
          () => axios.get(`${API_URL}/articles/${articleId}`, config),
          () => axios.get(`${API_URL}/articles/byId/${articleId}`, config),
        ];

        let response;
        let fetchError = null;

        for (const strategy of fetchStrategies) {
          try {
            response = await strategy();

            // Log full response for debugging
            console.log("Fetch response:", response.data);

            // Break if successful
            if (response.data.success) break;
          } catch (strategyError) {
            console.warn("Fetch strategy failed:", strategyError);
            fetchError = strategyError;
          }
        }

        // Validate response
        if (!response || !response.data.success) {
          throw new Error(
            "Failed to load article: " +
              (fetchError?.message || "Unable to fetch using any strategy")
          );
        }

        const article = response.data.data;

        // Check if user has permission to edit
        if (user && user.id !== article.user_id && user.role !== "admin") {
          throw new Error("You don't have permission to edit this article");
        }

        // Capture debug information
        setDebugInfo({
          articleId,
          fetchStrategies: ["bySlug", "byId"],
          userPermissions: {
            userId: user?.id,
            articleUserId: article.user_id,
            userRole: user?.role,
            hasPermission:
              user?.id === article.user_id || user?.role === "admin",
          },
        });

        return article;
      } catch (err) {
        console.error("Comprehensive error in fetching article:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load article. The article may have been deleted or you don't have permission to view it."
        );

        // Capture debug information
        setDebugInfo({
          error: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: err.config,
          fullError: err,
        });

        return null;
      } finally {
        setLoading(false);
      }
    },
    [isEditMode, user]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearDebugInfo = useCallback(() => {
    setDebugInfo(null);
  }, []);

  return {
    loading,
    error,
    debugInfo,
    fetchArticle,
    clearError,
    clearDebugInfo,
  };
};

export default useArticleFetch;
