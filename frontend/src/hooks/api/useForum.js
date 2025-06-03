import { useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { API_URL, TOKEN_NAME } from '../../config';
import AuthContext from '../../contexts/AuthContext';

/**
 * useForum Hook
 * 
 * Custom hook for forum-related API operations.
 * Provides methods for managing categories, threads, comments, and admin functions.
 * Follows the same pattern as useArticles and useComments hooks for consistency.
 * 
 * @returns {Object} Forum API methods and state
 */
export const useForum = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  /**
   * Helper to get auth headers from localStorage or sessionStorage
   * @returns {Object} Headers object with Authorization token if available
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem(TOKEN_NAME) || sessionStorage.getItem(TOKEN_NAME);
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  /**
   * Helper to make API requests with proper configuration
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Request data (body for POST/PUT, params for GET)
   * @returns {Promise} API response data
   */
  const apiRequest = async (method, endpoint, data = null) => {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      config.data = data;
    } else if (data && method === 'GET') {
      config.params = data;
    }

    const response = await axios(config);
    return response.data;
  };

  // Categories
  const getCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/forum/categories');
      return response.data; // API returns { success: true, data: [...] }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch categories');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCategory = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', `/forum/categories/${slug}`);
      return response.data; // API returns { success: true, data: {...} }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch category');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', '/forum/categories', categoryData);
      return response.data; // API returns { success: true, data: {...} }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create category');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/forum/categories/${id}`, categoryData);
      return response.data; // API returns { success: true, data: {...} }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update category');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest('DELETE', `/forum/categories/${id}`);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete category');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Threads
  const getThreads = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/forum/threads', params);
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch threads');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getThread = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', `/forum/threads/${slug}`);
      return response.data; // API returns { success: true, data: {...} }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch thread');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createThread = useCallback(async (threadData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', '/forum/threads', threadData);
      return response.data; // API returns { success: true, data: {...} }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create thread');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateThread = useCallback(async (id, threadData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/forum/threads/${id}`, threadData);
      return response.data; // API returns { success: true, data: {...} }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update thread');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteThread = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest('DELETE', `/forum/threads/${id}`);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete thread');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Comments
  const createComment = useCallback(async (commentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', '/forum/comments', commentData);
      return response.data; // API returns { success: true, data: {...} }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create comment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateComment = useCallback(async (id, commentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/forum/comments/${id}`, commentData);
      return response.data; // API returns { success: true, data: {...} }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update comment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await apiRequest('DELETE', `/forum/comments/${id}`);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete comment');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Admin functions
  const toggleCategoryBlock = useCallback(async (id, block, reason) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/admin/forum/categories/${id}/block`, { block, reason });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle category block');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleThreadBlock = useCallback(async (id, block, reason) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/admin/forum/threads/${id}/block`, { block, reason });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle thread block');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCommentBlock = useCallback(async (id, block, reason) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/admin/forum/comments/${id}/block`, { block, reason });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle comment block');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleThreadLock = useCallback(async (id, lock) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/admin/forum/threads/${id}/lock`, { lock });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle thread lock');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleThreadPin = useCallback(async (id, pin) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/admin/forum/threads/${id}/pin`, { pin });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle thread pin');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const moveThread = useCallback(async (id, categoryId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('PUT', `/admin/forum/threads/${id}/move`, { categoryId });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to move thread');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleUserBan = useCallback(async (userId, ban, reason, expiresAt) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('POST', `/admin/forum/users/${userId}/ban`, { ban, reason, expiresAt });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to toggle user ban');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getForumStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/admin/forum/stats');
      return response.data; // apiRequest already returns response.data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch forum stats');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBlockedContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/admin/forum/blocked');
      return response.data; // apiRequest already returns response.data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch blocked content');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBannedUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('GET', '/admin/forum/banned-users');
      return response.data; // apiRequest already returns response.data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch banned users');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper functions
  const canCreateCategory = useCallback(() => {
    return user && (user.role === 'author' || user.role === 'admin');
  }, [user]);

  const canCreateThread = useCallback(() => {
    return user && (user.role === 'author' || user.role === 'admin');
  }, [user]);

  const canCreateComment = useCallback(() => {
    return user && (user.role === 'author' || user.role === 'admin');
  }, [user]);

  const canEditContent = useCallback((content) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.id === content.userId || user.id === content.user_id;
  }, [user]);

  const canDeleteContent = useCallback((content) => {
    return canEditContent(content);
  }, [user, canEditContent]);

  return {
    loading,
    error,
    // Categories
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    // Threads
    getThreads,
    getThread,
    createThread,
    updateThread,
    deleteThread,
    // Comments
    createComment,
    updateComment,
    deleteComment,
    // Admin
    toggleCategoryBlock,
    toggleThreadBlock,
    toggleCommentBlock,
    toggleThreadLock,
    toggleThreadPin,
    moveThread,
    toggleUserBan,
    getForumStats,
    getBlockedContent,
    getBannedUsers,
    // Helpers
    canCreateCategory,
    canCreateThread,
    canCreateComment,
    canEditContent,
    canDeleteContent
  };
};