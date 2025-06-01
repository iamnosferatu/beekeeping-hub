// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { TOKEN_NAME } from "../config";
import apiService from "../services/api";

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_NAME) || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Removed token debugging for production security

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await apiService.auth.getProfile();

          if (response.success) {
            setUser(response.data.user);
          } else {
            logout();
            setError("Authentication error. Please log in again.");
          }
        } catch (err) {
          logout();
          setError("Authentication error. Please log in again.");
        }
      }

      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.auth.login({ email, password });

      if (response.success) {
        // Save token to localStorage and state
        localStorage.setItem(TOKEN_NAME, response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);

        return response.data.user;
      } else {
        const errorMessage =
          response.error?.message || "Login failed. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.auth.register(userData);

      if (response.success) {
        // Save token to localStorage and state
        localStorage.setItem(TOKEN_NAME, response.data.token);
        setToken(response.data.token);
        setUser(response.data.user);

        return response.data.user;
      } else {
        const errorMessage =
          response.error?.message || "Registration failed. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem(TOKEN_NAME);
    setToken(null);
    setUser(null);
    setError(null);
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.auth.updateProfile(userData);

      if (response.success) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        const errorMessage =
          response.error?.message ||
          "Failed to update profile. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.message || "Failed to update profile. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwords) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.auth.changePassword(passwords);

      if (response.success) {
        return true;
      } else {
        const errorMessage =
          response.error?.message ||
          "Failed to change password. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.message || "Failed to change password. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has specific role
  const hasRole = (roles) => {
    if (!user) {
      return false;
    }

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  // Clear error
  const clearError = () => setError(null);
  
  // Update user data (for avatar updates, etc.)
  const updateUserData = (updates) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Check if user is author or admin
  const canCreateContent = user?.role === "author" || user?.role === "admin";

  const contextValue = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    hasRole,
    clearError,
    updateUserData,
    isAuthenticated,
    isAdmin,
    canCreateContent,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
