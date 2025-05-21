// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_URL, TOKEN_NAME } from "../config";

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enhanced token setter function to clean up the token before storing
  const setAuthToken = useCallback((newToken) => {
    if (newToken) {
      // Ensure the token is clean (no whitespace)
      const cleanToken = newToken.trim();

      // Store in localStorage
      localStorage.setItem(TOKEN_NAME, cleanToken);

      // Set in axios defaults
      axios.defaults.headers.common["Authorization"] = `Bearer ${cleanToken}`;

      // Set in state
      setToken(cleanToken);

      console.log(
        "Auth token set:",
        "Bearer " + cleanToken.substring(0, 10) + "..."
      );
    } else {
      // Remove token
      localStorage.removeItem(TOKEN_NAME);
      delete axios.defaults.headers.common["Authorization"];
      setToken(null);
      console.log("Auth token removed");
    }
  }, []);

  // Logout user - wrapped in useCallback to avoid infinite re-renders
  const logout = useCallback(() => {
    console.log("Logging out user");
    setAuthToken(null); // This will handle clearing localStorage and axios headers
    setUser(null);
  }, [setAuthToken]);

  // Load token from localStorage on mount and set up axios defaults
  useEffect(() => {
    const loadStoredToken = () => {
      const storedToken = localStorage.getItem(TOKEN_NAME);

      if (storedToken) {
        try {
          // Clean the token
          const cleanToken = storedToken.trim();

          // Set in axios defaults
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${cleanToken}`;

          // Set in state
          setToken(cleanToken);

          console.log("Loaded auth token from storage");
        } catch (err) {
          console.error("Error processing stored token:", err);
          localStorage.removeItem(TOKEN_NAME);
        }
      }
    };

    loadStoredToken();
  }, []);

  // Load user from token when token changes
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          // Try to get user data from API
          try {
            console.log("Fetching user data with token");
            const res = await axios.get(`${API_URL}/auth/me`);
            setUser(res.data.user);
            console.log("User data loaded successfully");
          } catch (apiError) {
            console.error("API error when loading user:", apiError);

            // If API call fails, create a mock user for development
            if (process.env.NODE_ENV === "development") {
              console.log("Creating mock user for development");
              const mockUser = {
                id: 1,
                username: "admin",
                email: "admin@example.com",
                first_name: "Admin",
                last_name: "User",
                role: "admin",
                last_login: new Date().toISOString(),
              };
              setUser(mockUser);
            } else {
              // In production, log out if API fails
              logout();
              setError("Authentication error. Please log in again.");
            }
          }
        } catch (err) {
          console.error("Error loading user:", err);
          logout();
          setError("Authentication error. Please log in again.");
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    loadUser();
  }, [token, logout]); // Added logout and API_URL to dependencies

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Make real API call to login
      try {
        console.log("Attempting login for:", email);
        const res = await axios.post(`${API_URL}/auth/login`, {
          email,
          password,
        });

        // Save token using the enhanced method
        if (res.data.token) {
          setAuthToken(res.data.token);
          setUser(res.data.user);
          console.log("Login successful");
        } else {
          throw new Error("No token received from server");
        }

        return res.data.user;
      } catch (apiError) {
        // If API call fails and we're in development, use mock data
        if (process.env.NODE_ENV === "development") {
          console.log("Using mock login in development mode");

          // Create mock token and user
          const mockToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2MjM5MDIyfQ.Shd1nyV36Z_V-5qJiZR4UOCh6EXzn0QKdYvkBt-4uHg";
          const mockUser = {
            id: 1,
            username: "admin",
            email: email,
            first_name: "Admin",
            last_name: "User",
            role: "admin",
            last_login: new Date().toISOString(),
          };

          // Save mock data
          setAuthToken(mockToken);
          setUser(mockUser);

          return mockUser;
        } else {
          // In production, throw the error
          console.error(
            "Login API error:",
            apiError.response?.data || apiError.message
          );
          throw apiError;
        }
      }
    } catch (err) {
      console.error("Login error:", err);
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

      // Make real API call to register
      try {
        console.log("Attempting to register user:", userData.email);
        const res = await axios.post(`${API_URL}/auth/register`, userData);

        // Save token using the enhanced method
        if (res.data.token) {
          setAuthToken(res.data.token);
          setUser(res.data.user);
          console.log("Registration successful");
        } else {
          throw new Error("No token received from server");
        }

        return res.data.user;
      } catch (apiError) {
        // If API call fails and we're in development, use mock data
        if (process.env.NODE_ENV === "development") {
          console.log("Using mock registration in development mode");

          // Create mock token and user
          const mockToken =
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjE2MjM5MDIyfQ.Shd1nyV36Z_V-5qJiZR4UOCh6EXzn0QKdYvkBt-4uHg";
          const mockUser = {
            id: 1,
            username: userData.username,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: "user",
            last_login: new Date().toISOString(),
          };

          // Save mock data
          setAuthToken(mockToken);
          setUser(mockUser);

          return mockUser;
        } else {
          // In production, throw the error
          console.error(
            "Registration API error:",
            apiError.response?.data || apiError.message
          );
          throw apiError;
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Make real API call to update profile
      try {
        console.log("Updating user profile");
        const res = await axios.put(`${API_URL}/auth/profile`, userData);
        setUser(res.data.user);
        console.log("Profile updated successfully");
        return res.data.user;
      } catch (apiError) {
        // If API call fails and we're in development, update mock user
        if (process.env.NODE_ENV === "development" && user) {
          console.log("Using mock profile update in development mode");

          // Update mock user
          const updatedUser = {
            ...user,
            first_name: userData.firstName || user.first_name,
            last_name: userData.lastName || user.last_name,
            bio: userData.bio !== undefined ? userData.bio : user.bio,
            email: userData.email || user.email,
          };

          setUser(updatedUser);

          return updatedUser;
        } else {
          // In production, throw the error
          console.error(
            "Profile update API error:",
            apiError.response?.data || apiError.message
          );
          throw apiError;
        }
      }
    } catch (err) {
      console.error("Profile update error:", err);
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

      // Make real API call to change password
      try {
        console.log("Changing password");
        await axios.put(`${API_URL}/auth/password`, passwords);
        console.log("Password changed successfully");
        return true;
      } catch (apiError) {
        // If API call fails and we're in development, simulate success
        if (process.env.NODE_ENV === "development") {
          console.log("Using mock password change in development mode");
          console.log("Password change simulation:", passwords);
          return true;
        } else {
          // In production, throw the error
          console.error(
            "Password change API error:",
            apiError.response?.data || apiError.message
          );
          throw apiError;
        }
      }
    } catch (err) {
      console.error("Password change error:", err);
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
    if (!user) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  // Clear error
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
