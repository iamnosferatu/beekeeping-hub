// frontend/src/hooks/api/useSiteSettings.js
import { useApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to fetch maintenance settings
 */
export const useSiteSettings = (options = {}) => {
  return useApi(apiService.siteSettings.get, [], options);
};

/**
 * Hook to update maintenance settings (admin only)
 */
export const useUpdateSiteSettings = (options = {}) => {
  return useMutation(apiService.siteSettings.update, options);
};

/**
 * Hook to fetch all features
 */
export const useFeatures = (options = {}) => {
  return useApi(apiService.features.getAll, [], options);
};

/**
 * Hook to check if a feature is enabled
 */
export const useFeatureStatus = (featureName, options = {}) => {
  return useApi(
    () => apiService.features.getStatus(featureName), 
    [featureName], 
    {
      ...options,
      immediate: !!featureName
    }
  );
};

/**
 * Hook to toggle a feature (admin only)
 */
export const useToggleFeature = (options = {}) => {
  return useMutation(apiService.features.toggle, options);
};

/**
 * Hook to create a new feature (admin only)
 */
export const useCreateFeature = (options = {}) => {
  return useMutation(apiService.features.create, options);
};

/**
 * Hook to delete a feature (admin only)
 */
export const useDeleteFeature = (options = {}) => {
  return useMutation(apiService.features.delete, options);
};