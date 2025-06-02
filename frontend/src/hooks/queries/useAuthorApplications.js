// frontend/src/hooks/queries/useAuthorApplications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiService from '../../services/api';

// Query keys for author applications
export const AUTHOR_APPLICATIONS_QUERY_KEYS = {
  all: ['authorApplications'],
  canApply: () => [...AUTHOR_APPLICATIONS_QUERY_KEYS.all, 'canApply'],
  myApplication: () => [...AUTHOR_APPLICATIONS_QUERY_KEYS.all, 'myApplication'],
  admin: {
    all: () => [...AUTHOR_APPLICATIONS_QUERY_KEYS.all, 'admin'],
    list: (params) => [...AUTHOR_APPLICATIONS_QUERY_KEYS.admin.all(), 'list', params],
    pendingCount: () => [...AUTHOR_APPLICATIONS_QUERY_KEYS.admin.all(), 'pendingCount'],
    byId: (id) => [...AUTHOR_APPLICATIONS_QUERY_KEYS.admin.all(), 'detail', id],
  }
};

/**
 * Hook to check if current user can apply for author status
 */
export const useCanApplyForAuthor = (enabled = true) => {
  return useQuery({
    queryKey: AUTHOR_APPLICATIONS_QUERY_KEYS.canApply(),
    queryFn: async () => {
      console.log('useCanApplyForAuthor: Making API call to canApply');
      try {
        const response = await apiService.authorApplications.canApply();
        console.log('useCanApplyForAuthor: API response:', response);
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to check eligibility');
        }
        return response.data;
      } catch (error) {
        console.error('useCanApplyForAuthor: API error:', error);
        // Rethrow with more specific error message
        if (error.type === 'AUTH_ERROR') {
          throw new Error('Authentication required. Please log in.');
        }
        if (error.type === 'NOT_FOUND_ERROR') {
          throw new Error('Author application service is not available.');
        }
        throw new Error(error.message || 'Failed to check author application eligibility');
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent long loading times
    timeout: 10000, // 10 second timeout
  });
};

/**
 * Hook to get current user's author application status
 */
export const useMyAuthorApplication = (enabled = true) => {
  return useQuery({
    queryKey: AUTHOR_APPLICATIONS_QUERY_KEYS.myApplication(),
    queryFn: async () => {
      console.log('useMyAuthorApplication: Making API call to getMyApplication');
      try {
        const response = await apiService.authorApplications.getMyApplication();
        console.log('useMyAuthorApplication: API response:', response);
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch application');
        }
        return response.data;
      } catch (error) {
        console.error('useMyAuthorApplication: API error:', error);
        // Rethrow with more specific error message
        if (error.type === 'AUTH_ERROR') {
          throw new Error('Authentication required. Please log in.');
        }
        if (error.type === 'NOT_FOUND_ERROR') {
          throw new Error('Author application service is not available.');
        }
        throw new Error(error.message || 'Failed to fetch author application status');
      }
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Disable retries to prevent long loading times
    timeout: 10000, // 10 second timeout
  });
};

/**
 * Hook to submit author application
 */
export const useSubmitAuthorApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (applicationData) => {
      const response = await apiService.authorApplications.submit(applicationData);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to submit application');
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: AUTHOR_APPLICATIONS_QUERY_KEYS.canApply() });
      queryClient.invalidateQueries({ queryKey: AUTHOR_APPLICATIONS_QUERY_KEYS.myApplication() });
      
      // Invalidate admin queries if user is admin
      queryClient.invalidateQueries({ queryKey: AUTHOR_APPLICATIONS_QUERY_KEYS.admin.all() });
    },
    onError: (error) => {
      console.error('Submit author application error:', error);
    },
  });
};

// =============================================================================
// ADMIN HOOKS
// =============================================================================

/**
 * Hook to get all author applications (admin only)
 */
export const useAdminAuthorApplications = (params = {}) => {
  return useQuery({
    queryKey: AUTHOR_APPLICATIONS_QUERY_KEYS.admin.list(params),
    queryFn: async () => {
      console.log('useAdminAuthorApplications: Making API call with params:', params);
      try {
        const response = await apiService.admin.authorApplications.getAll(params);
        console.log('useAdminAuthorApplications: API response:', response);
        console.log('useAdminAuthorApplications: response.data:', response.data);
        console.log('useAdminAuthorApplications: response.data.applications:', response.data?.applications);
        if (!response.success) {
          throw new Error(response.error?.message || 'Failed to fetch applications');
        }
        // Fix: The response is double-nested, so we need response.data.data
        return response.data.data || response.data;
      } catch (error) {
        console.error('useAdminAuthorApplications: API error:', error);
        throw error;
      }
    },
    staleTime: 30 * 1000, // 30 seconds (frequent updates needed for admin)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Hook to get pending author applications count (admin only)
 */
export const usePendingAuthorApplicationsCount = () => {
  return useQuery({
    queryKey: AUTHOR_APPLICATIONS_QUERY_KEYS.admin.pendingCount(),
    queryFn: async () => {
      const response = await apiService.admin.authorApplications.getPendingCount();
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch pending count');
      }
      // Fix: Handle double-nested response structure
      return response.data.data || response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute for real-time updates
    retry: (failureCount, error) => {
      // Don't retry 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Hook to get author application by ID (admin only)
 */
export const useAuthorApplicationById = (id, options = {}) => {
  return useQuery({
    queryKey: AUTHOR_APPLICATIONS_QUERY_KEYS.admin.byId(id),
    queryFn: async () => {
      console.log('useAuthorApplicationById: Fetching application', id);
      const response = await apiService.admin.authorApplications.getById(id);
      console.log('useAuthorApplicationById: Response:', response);
      console.log('useAuthorApplicationById: Error details:', response.error);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to fetch application');
      }
      // Fix: Handle double-nested response structure
      return response.data.data || response.data;
    },
    enabled: !!id && (options.enabled !== false),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * Hook to review author application (admin only)
 */
export const useReviewAuthorApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action, adminNotes }) => {
      const response = await apiService.admin.authorApplications.review(id, action, adminNotes);
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to review application');
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch all admin queries
      queryClient.invalidateQueries({ queryKey: AUTHOR_APPLICATIONS_QUERY_KEYS.admin.all() });
      
      // Update specific application cache
      queryClient.invalidateQueries({ 
        queryKey: AUTHOR_APPLICATIONS_QUERY_KEYS.admin.byId(variables.id) 
      });
      
      // If user was approved, invalidate users query to show role change
      if (variables.action === 'approve') {
        queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      }
    },
    onError: (error) => {
      console.error('Review author application error:', error);
    },
  });
};