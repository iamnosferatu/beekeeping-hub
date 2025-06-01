// frontend/src/hooks/queries/useAuth.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';
import { TOKEN_NAME } from '../../config';

// Query keys for auth
export const AUTH_QUERY_KEYS = {
  all: ['auth'],
  user: () => [...AUTH_QUERY_KEYS.all, 'user'],
  profile: () => [...AUTH_QUERY_KEYS.all, 'profile'],
};

// Hook for fetching current user profile
export const useCurrentUser = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.profile(),
    queryFn: async () => {
      const response = await apiService.auth.getProfile();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch user profile');
      }
      return response.data.user;
    },
    enabled: !!(localStorage.getItem(TOKEN_NAME) || sessionStorage.getItem(TOKEN_NAME)),
    staleTime: 5 * 60 * 1000, // User data is stale after 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 errors (unauthorized)
      if (error?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
};

// Mutation for user login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ email, password, rememberMe }) => {
      const response = await apiService.auth.login({ email, password, rememberMe });
      if (!response.success) {
        throw new Error(response.error?.message || 'Login failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Cache the user data
      queryClient.setQueryData(AUTH_QUERY_KEYS.profile(), data.user);
      
      // Handle token storage based on remember me
      if (data.rememberMe) {
        localStorage.setItem(TOKEN_NAME, data.token);
        localStorage.setItem(`${TOKEN_NAME}_remember`, 'true');
        sessionStorage.removeItem(TOKEN_NAME);
      } else {
        sessionStorage.setItem(TOKEN_NAME, data.token);
        localStorage.removeItem(`${TOKEN_NAME}_remember`);
        localStorage.removeItem(TOKEN_NAME);
      }
    },
    onError: (error) => {
      console.error('Login error:', error);
      // Clear any cached user data on login failure
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.profile() });
    },
  });
};

// Mutation for user registration
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiService.auth.register(userData);
      if (!response.success) {
        throw new Error(response.error?.message || 'Registration failed');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Cache the user data
      queryClient.setQueryData(AUTH_QUERY_KEYS.profile(), data.user);
      
      // Store token
      localStorage.setItem(TOKEN_NAME, data.token);
    },
    onError: (error) => {
      console.error('Registration error:', error);
    },
  });
};

// Mutation for user logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Clear tokens
      localStorage.removeItem(TOKEN_NAME);
      localStorage.removeItem(`${TOKEN_NAME}_remember`);
      sessionStorage.removeItem(TOKEN_NAME);
      
      // No API call needed for logout in this implementation
      return { success: true };
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Still clear cache even if logout "fails"
      queryClient.clear();
    },
  });
};

// Mutation for updating user profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData) => {
      const response = await apiService.auth.updateProfile(userData);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to update profile');
      }
      return response.data.user;
    },
    onSuccess: (updatedUser) => {
      // Update the cached user data
      queryClient.setQueryData(AUTH_QUERY_KEYS.profile(), updatedUser);
    },
    onError: (error) => {
      console.error('Update profile error:', error);
    },
  });
};

// Mutation for changing password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }) => {
      const response = await apiService.auth.changePassword({
        currentPassword,
        newPassword,
      });
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to change password');
      }
      return response.data;
    },
    onError: (error) => {
      console.error('Change password error:', error);
    },
  });
};

// Mutation for uploading avatar
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file) => {
      const response = await apiService.auth.uploadAvatar(file);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to upload avatar');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cached user data with new avatar
      const currentUser = queryClient.getQueryData(AUTH_QUERY_KEYS.profile());
      if (currentUser) {
        queryClient.setQueryData(AUTH_QUERY_KEYS.profile(), {
          ...currentUser,
          avatar: data.avatar,
        });
      }
    },
    onError: (error) => {
      console.error('Upload avatar error:', error);
    },
  });
};

// Mutation for email verification
export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token) => {
      const response = await apiService.client.post('/auth/verify-email', { token });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Email verification failed');
      }
      return response.data;
    },
    onError: (error) => {
      console.error('Email verification error:', error);
    },
  });
};

// Mutation for resending verification email
export const useResendVerification = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await apiService.client.post('/auth/resend-verification', { email });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to resend verification email');
      }
      return response.data;
    },
    onError: (error) => {
      console.error('Resend verification error:', error);
    },
  });
};

// Mutation for forgot password
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await apiService.client.post('/auth/forgot-password', { email });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send reset email');
      }
      return response.data;
    },
    onError: (error) => {
      console.error('Forgot password error:', error);
    },
  });
};

// Mutation for reset password
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async ({ token, password }) => {
      const response = await apiService.client.post('/auth/reset-password', { token, password });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reset password');
      }
      return response.data;
    },
    onError: (error) => {
      console.error('Reset password error:', error);
    },
  });
};