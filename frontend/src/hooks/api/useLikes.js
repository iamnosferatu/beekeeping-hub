// frontend/src/hooks/api/useLikes.js
import { useState, useCallback, useContext } from 'react';
import apiService from '../../services/api';
import AuthContext from '../../contexts/AuthContext';

export const useLikes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  // Toggle like on an article
  const toggleLike = useCallback(async (articleId) => {
    if (!user) {
      setError('You must be logged in to like articles');
      return { success: false, error: 'Not authenticated' };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.likes.toggleLike(articleId);
      // Handle the wrapped response structure from apiService
      const data = response.data?.data || response.data || response;
      return {
        success: true,
        liked: data.liked,
        likeCount: data.likeCount,
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to toggle like';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get like status for an article
  const getLikeStatus = useCallback(async (articleId) => {
    if (!user) {
      return { liked: false, likeCount: 0 };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.likes.getLikeStatus(articleId);
      const data = response.data?.data || response.data || response;
      return {
        liked: data.liked,
        likeCount: data.likeCount,
      };
    } catch (err) {
      console.error('Error getting like status:', err);
      return { liked: false, likeCount: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get user's liked articles
  const getUserLikedArticles = useCallback(async (page = 1, limit = 10) => {
    if (!user) {
      return { articles: [], totalCount: 0, totalPages: 0 };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.likes.getUserLikedArticles(page, limit);
      const data = response.data?.data || response.data || response;
      return {
        articles: data.articles,
        totalCount: data.totalCount,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get liked articles';
      setError(errorMessage);
      return { articles: [], totalCount: 0, totalPages: 0 };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get users who liked an article
  const getArticleLikers = useCallback(async (articleId, page = 1, limit = 20) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiService.likes.getArticleLikers(articleId, page, limit);
      const data = response.data?.data || response.data || response;
      return {
        users: data.users,
        totalCount: data.totalCount,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
      };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to get article likers';
      setError(errorMessage);
      return { users: [], totalCount: 0, totalPages: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    toggleLike,
    getLikeStatus,
    getUserLikedArticles,
    getArticleLikers,
  };
};