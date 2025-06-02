// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useMemo, useCallback } from "react";
import { reportError, withErrorReporting, ERROR_TYPES, ERROR_SEVERITY } from "../utils/errorReporting";
import { TOKEN_NAME } from "../config";
import apiService from "../services/api";

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem(TOKEN_NAME) || sessionStorage.getItem(TOKEN_NAME) || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(localStorage.getItem(`${TOKEN_NAME}_remember`) === 'true');

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

  // Enhanced login with error reporting
  const login = useCallback(async (email, password, rememberMeOption = false) => {
    const reportAuthError = withErrorReporting({ component: 'AuthContext', action: 'login' });
    
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.auth.login({ email, password, rememberMe: rememberMeOption });

      if (response.success) {
        // Save token based on remember me preference
        if (rememberMeOption) {
          localStorage.setItem(TOKEN_NAME, response.data.token);
          localStorage.setItem(`${TOKEN_NAME}_remember`, 'true');
          // Clear from sessionStorage if it exists
          sessionStorage.removeItem(TOKEN_NAME);
        } else {
          sessionStorage.setItem(TOKEN_NAME, response.data.token);
          localStorage.removeItem(`${TOKEN_NAME}_remember`);
          // Clear from localStorage if it exists
          localStorage.removeItem(TOKEN_NAME);
        }
        setToken(response.data.token);
        setUser(response.data.user);
        setRememberMe(rememberMeOption);

        return response.data.user;
      } else {
        const errorMessage =
          response.error?.message || "Login failed. Please try again.";
        setError(errorMessage);
        
        // Report login failure
        reportAuthError(new Error(errorMessage), {
          email: email?.substring(0, 3) + '***', // Partially masked email for debugging
          rememberMe: rememberMeOption,
          severity: ERROR_SEVERITY.MEDIUM,
        });
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage = err.message || "Login failed. Please try again.";
      setError(errorMessage);
      
      // Report unexpected login error
      reportAuthError(err, {
        email: email?.substring(0, 3) + '***',
        rememberMe: rememberMeOption,
        severity: err.type === ERROR_TYPES.NETWORK ? ERROR_SEVERITY.HIGH : ERROR_SEVERITY.MEDIUM,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Enhanced register with error reporting
  const register = useCallback(async (userData) => {
    const reportAuthError = withErrorReporting({ component: 'AuthContext', action: 'register' });
    
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
        
        reportAuthError(new Error(errorMessage), {
          username: userData.username,
          email: userData.email?.substring(0, 3) + '***',
          severity: ERROR_SEVERITY.MEDIUM,
        });
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.message || "Registration failed. Please try again.";
      setError(errorMessage);
      
      reportAuthError(err, {
        username: userData.username,
        email: userData.email?.substring(0, 3) + '***',
        severity: err.type === ERROR_TYPES.VALIDATION ? ERROR_SEVERITY.LOW : ERROR_SEVERITY.MEDIUM,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout user
  const logout = () => {
    localStorage.removeItem(TOKEN_NAME);
    localStorage.removeItem(`${TOKEN_NAME}_remember`);
    sessionStorage.removeItem(TOKEN_NAME);
    setToken(null);
    setUser(null);
    setError(null);
    setRememberMe(false);
  };

  // Enhanced update profile with error reporting
  const updateProfile = useCallback(async (userData) => {
    const reportAuthError = withErrorReporting({ component: 'AuthContext', action: 'updateProfile' });
    
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
        
        reportAuthError(new Error(errorMessage), {
          userId: user?.id,
          fieldsUpdated: Object.keys(userData),
          severity: ERROR_SEVERITY.LOW,
        });
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.message || "Failed to update profile. Please try again.";
      setError(errorMessage);
      
      reportAuthError(err, {
        userId: user?.id,
        fieldsUpdated: Object.keys(userData),
        severity: ERROR_SEVERITY.MEDIUM,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Enhanced change password with error reporting
  const changePassword = useCallback(async (passwords) => {
    const reportAuthError = withErrorReporting({ component: 'AuthContext', action: 'changePassword' });
    
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
        
        reportAuthError(new Error(errorMessage), {
          userId: user?.id,
          severity: ERROR_SEVERITY.MEDIUM,
        });
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      const errorMessage =
        err.message || "Failed to change password. Please try again.";
      setError(errorMessage);
      
      reportAuthError(err, {
        userId: user?.id,
        severity: ERROR_SEVERITY.MEDIUM,
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Check if user has specific role (memoized)
  const hasRole = useCallback((roles) => {
    if (!user) {
      return false;
    }

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  }, [user]);

  // Clear error (memoized)
  const clearError = useCallback(() => setError(null), []);
  
  // Update user data (for avatar updates, etc.) (memoized)
  const updateUserData = useCallback((updates) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  }, [user]);

  // Memoized derived state
  const isAuthenticated = useMemo(() => !!user && !!token, [user, token]);
  const isAdmin = useMemo(() => user?.role === "admin", [user?.role]);
  const canCreateContent = useMemo(() => user?.role === "author" || user?.role === "admin", [user?.role]);

  const contextValue = useMemo(() => ({
    user,
    token,
    loading,
    error,
    rememberMe,
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
  }), [
    user,
    token,
    loading,
    error,
    rememberMe,
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
  ]);

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
