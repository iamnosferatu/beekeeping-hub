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

  // Debug token
  useEffect(() => {
    console.log(
      "AuthContext - Current token:",
      token ? token.substring(0, 20) + "..." : "None"
    );
  }, [token]);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          console.log("AuthContext - Loading user data");

          const response = await apiService.auth.getProfile();

          if (response.success) {
            console.log("AuthContext - User data loaded:", response.data.user);
            setUser(response.data.user);
          } else {
            console.error("AuthContext - Error loading user:", response.error);
            logout();
            setError("Authentication error. Please log in again.");
          }
        } catch (err) {
          console.error("AuthContext - Unexpected error loading user:", err);
          logout();
          setError("Authentication error. Please log in again.");
        }
      } else {
        console.log("AuthContext - No token found, user not authenticated");
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

      console.log(`AuthContext - Attempting login for: ${email}`);

      const response = await apiService.auth.login({ email, password });

      if (response.success) {
        console.log("AuthContext - Login successful, setting token and user");

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
      console.error("AuthContext - Login error:", err);
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

      console.log("AuthContext - Registering new user");

      const response = await apiService.auth.register(userData);

      if (response.success) {
        console.log(
          "AuthContext - Registration successful, setting token and user"
        );

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
      console.error("AuthContext - Registration error:", err);
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
    console.log("AuthContext - Logging out user");
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
        console.log("AuthContext - Profile updated successfully");
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
      console.error("AuthContext - Profile update error:", err);
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
        console.log("AuthContext - Password changed successfully");
        return true;
      } else {
        const errorMessage =
          response.error?.message ||
          "Failed to change password. Please try again.";
        setError(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error("AuthContext - Password change error:", err);
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
    console.log("AuthContext - Checking role:", {
      userRole: user?.role,
      requiredRoles: roles,
    });

    if (!user) {
      console.log("AuthContext - No user, role check failed");
      return false;
    }

    if (Array.isArray(roles)) {
      const result = roles.includes(user.role);
      console.log(
        `AuthContext - User has one of roles [${roles.join(", ")}]: ${result}`
      );
      return result;
    }

    const result = user.role === roles;
    console.log(`AuthContext - User has role ${roles}: ${result}`);
    return result;
  };

  // Clear error
  const clearError = () => setError(null);

  // Check if user is authenticated
  const isAuthenticated = !!user && !!token;

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Check if user is author or admin
  const canCreateContent = user?.role === "author" || user?.role === "admin";

  // Log the context value on each render for debugging
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
    isAuthenticated,
    isAdmin,
    canCreateContent,
  };

  console.log("AuthContext - Current state:", {
    user: user ? `${user.username} (${user.role})` : "None",
    token: token ? "Present" : "None",
    loading,
    error,
    isAuthenticated,
    isAdmin,
    canCreateContent,
  });

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
