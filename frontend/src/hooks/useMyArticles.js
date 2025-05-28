// Updated hooks/useMyArticles.js (with proper error handling)
/**
 * Enhanced custom hook for managing user's articles
 * Includes proper error handling and loading states
 */
import { useState, useEffect, useContext, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import AuthContext from "../contexts/AuthContext";

export const useMyArticles = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // State management
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || null
  );

  // Statistics calculation with error handling
  const calculateStats = useCallback((articles) => {
    if (!Array.isArray(articles)) {
      return {
        total: 0,
        published: 0,
        draft: 0,
        blocked: 0,
        views: 0,
        likes: 0,
        comments: 0,
      };
    }

    const published = articles.filter(
      (a) => a && a.status === "published" && !a.blocked
    );
    const draft = articles.filter((a) => a && a.status === "draft");
    const blocked = articles.filter((a) => a && a.blocked);

    return {
      total: articles.length,
      published: published.length,
      draft: draft.length,
      blocked: blocked.length,
      views: articles.reduce((sum, article) => {
        return sum + (article?.view_count || 0);
      }, 0),
      likes: articles.reduce((sum, article) => {
        return sum + (article?.like_count || 0);
      }, 0),
      comments: articles.reduce((sum, article) => {
        return sum + (article?.comments?.length || 0);
      }, 0),
    };
  }, []);

  // Enhanced fetch function with better error handling
  const fetchArticles = useCallback(async () => {
    if (!user) {
      setLoading(false);
      setError("Please log in to view your articles");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("beekeeper_auth_token");
      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const response = await axios.get(`${API_URL}/articles`, {
        params: { author: user.id },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000, // 10 second timeout
      });

      if (response.data?.success) {
        const userArticles = response.data.data || [];
        setArticles(userArticles);
      } else {
        throw new Error(response.data?.message || "Failed to fetch articles");
      }
    } catch (err) {
      console.error("Error fetching articles:", err);

      // Enhanced error handling
      let errorMessage = "Failed to load your articles. Please try again.";

      if (err.code === "ECONNABORTED") {
        errorMessage =
          "Request timed out. Please check your connection and try again.";
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication expired. Please log in again.";
        // Clear invalid token
        localStorage.removeItem("beekeeper_auth_token");
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to view articles.";
      } else if (err.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (!err.response) {
        errorMessage =
          "Unable to connect to server. Please check your connection.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Enhanced delete function with proper error handling
  const deleteArticle = useCallback(async (articleId) => {
    if (!articleId) {
      return { success: false, error: "Invalid article ID" };
    }

    try {
      const token = localStorage.getItem("beekeeper_auth_token");
      if (!token) {
        return { success: false, error: "Authentication required" };
      }

      const response = await axios.delete(`${API_URL}/articles/${articleId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (response.data?.success) {
        // Update local state
        setArticles((prev) =>
          prev.filter((article) => article.id !== articleId)
        );
        setSuccessMessage("Article deleted successfully");
        return { success: true };
      } else {
        throw new Error(response.data?.message || "Failed to delete article");
      }
    } catch (err) {
      console.error("Error deleting article:", err);

      let errorMessage = "Failed to delete article. Please try again.";
      if (err.response?.status === 401) {
        errorMessage = "Authentication expired. Please log in again.";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to delete this article.";
      } else if (err.response?.status === 404) {
        errorMessage = "Article not found.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Enhanced filtering and sorting with null checks
  const getFilteredAndSortedArticles = useCallback(() => {
    if (!Array.isArray(articles)) return [];

    let filtered = articles.filter((article) => article != null);

    // Apply filters
    if (filter !== "all") {
      if (filter === "blocked") {
        filtered = filtered.filter((article) => article.blocked === true);
      } else {
        filtered = filtered.filter(
          (article) => article.status === filter && !article.blocked
        );
      }
    }

    // Apply sorting with null checks
    const sortFunctions = {
      "date-asc": (a, b) => {
        const dateA = new Date(a.published_at || a.created_at || 0);
        const dateB = new Date(b.published_at || b.created_at || 0);
        return dateA - dateB;
      },
      "date-desc": (a, b) => {
        const dateA = new Date(a.published_at || a.created_at || 0);
        const dateB = new Date(b.published_at || b.created_at || 0);
        return dateB - dateA;
      },
      title: (a, b) => (a.title || "").localeCompare(b.title || ""),
      views: (a, b) => (b.view_count || 0) - (a.view_count || 0),
    };

    const sortFunction = sortFunctions[sortBy] || sortFunctions["date-desc"];
    return [...filtered].sort(sortFunction);
  }, [articles, filter, sortBy]);

  // Load articles on mount and when user changes
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Calculate stats whenever articles change
  const stats = calculateStats(articles);

  return {
    // Data
    articles: getFilteredAndSortedArticles(),
    allArticles: articles,
    stats,
    loading,
    error,
    successMessage,

    // Filter state
    filter,
    sortBy,

    // Actions
    setFilter,
    setSortBy,
    deleteArticle,
    setSuccessMessage,
    setError,
    refetch: fetchArticles,
  };
};
