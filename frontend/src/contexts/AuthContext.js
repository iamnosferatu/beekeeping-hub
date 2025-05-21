// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_URL, TOKEN_NAME } from "../config";

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

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      console.log("AuthContext - Setting Authorization header");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      console.log("AuthContext - Removing Authorization header");
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Load user from token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          console.log("AuthContext - Loading user data");
          // Get user data from API
          const res = await axios.get(`${API_URL}/auth/me`);
          console.log("AuthContext - User data loaded:", res.data.user);
          setUser(res.data.user);
        } catch (err) {
          console.error("AuthContext - Error loading user:", err);
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

      // Make API call to login
      const res = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });

      console.log("AuthContext - Login successful, setting token and user");

      // Save token to localStorage and state
      localStorage.setItem(TOKEN_NAME, res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);

      return res.data.user;
    } catch (err) {
      console.error("AuthContext - Login error:", err);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
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

      // Make API call to register
      const res = await axios.post(`${API_URL}/auth/register`, userData);

      console.log(
        "AuthContext - Registration successful, setting token and user"
      );

      // Save token to localStorage and state
      localStorage.setItem(TOKEN_NAME, res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);

      return res.data.user;
    } catch (err) {
      console.error("AuthContext - Registration error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
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
    delete axios.defaults.headers.common["Authorization"];
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Make API call to update profile
      const res = await axios.put(`${API_URL}/auth/profile`, userData);
      console.log("AuthContext - Profile updated successfully");
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      console.error("AuthContext - Profile update error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to update profile. Please try again."
      );
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

      // Make API call to change password
      await axios.put(`${API_URL}/auth/password`, passwords);
      console.log("AuthContext - Password changed successfully");
      return true;
    } catch (err) {
      console.error("AuthContext - Password change error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to change password. Please try again."
      );
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
  };

  console.log("AuthContext - Current state:", {
    user: user ? `${user.username} (${user.role})` : "None",
    token: token ? "Present" : "None",
    loading,
    error,
  });

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
