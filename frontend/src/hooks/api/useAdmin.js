// frontend/src/hooks/api/useAdmin.js
import { useApi, usePaginatedApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to fetch dashboard stats
 */
export const useDashboardStats = (options = {}) => {
  return useApi(apiService.admin.getDashboardStats, [], options);
};

/**
 * Hook to fetch users for admin
 */
export const useAdminUsers = (filters = {}, options = {}) => {
  return usePaginatedApi(apiService.admin.getUsers, filters, options);
};

/**
 * Hook to update user role
 */
export const useUpdateUserRole = (options = {}) => {
  return useMutation(
    (userId, role) => apiService.admin.updateUserRole(userId, role),
    options
  );
};

/**
 * Hook to fetch comments for moderation
 */
export const useCommentsForModeration = (filters = {}, options = {}) => {
  return usePaginatedApi(
    apiService.admin.getCommentsForModeration,
    filters,
    options
  );
};

/**
 * Hook to fetch system diagnostics
 */
export const useSystemDiagnostics = (options = {}) => {
  return useApi(apiService.admin.diagnostics.getSystemInfo, [], options);
};

/**
 * Hook to fetch logs
 */
export const useLogs = (options = {}) => {
  return useApi(apiService.admin.diagnostics.getLogs, [], options);
};

/**
 * Hook to fetch metrics
 */
export const useMetrics = (options = {}) => {
  return useApi(apiService.admin.diagnostics.getMetrics, [], options);
};

/**
 * Hook to fetch database info
 */
export const useDatabaseInfo = (options = {}) => {
  return useApi(apiService.admin.diagnostics.getDatabaseInfo, [], options);
};
