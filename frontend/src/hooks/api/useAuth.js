// frontend/src/hooks/api/useAuth.js
import { useApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to get current user profile
 */
export const useProfile = (options = {}) => {
  return useApi(apiService.auth.getProfile, [], options);
};

/**
 * Hook to login user
 */
export const useLogin = (options = {}) => {
  return useMutation(apiService.auth.login, options);
};

/**
 * Hook to register user
 */
export const useRegister = (options = {}) => {
  return useMutation(apiService.auth.register, options);
};

/**
 * Hook to update user profile
 */
export const useUpdateProfile = (options = {}) => {
  return useMutation(apiService.auth.updateProfile, options);
};

/**
 * Hook to change password
 */
export const useChangePassword = (options = {}) => {
  return useMutation(apiService.auth.changePassword, options);
};
