// frontend/src/hooks/api/useSiteSettings.js
import { useApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to fetch site settings
 */
export const useSiteSettings = (options = {}) => {
  return useApi(apiService.siteSettings.get, [], options);
};

/**
 * Hook to update site settings (admin only)
 */
export const useUpdateSiteSettings = (options = {}) => {
  return useMutation(apiService.siteSettings.update, options);
};