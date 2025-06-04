// frontend/src/hooks/api/useNewsletter.js
import { useApi, usePaginatedApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to subscribe to newsletter
 */
export const useNewsletterSubscribe = (options = {}) => {
  return useMutation(apiService.newsletter.subscribe, options);
};

/**
 * Hook to unsubscribe from newsletter
 */
export const useNewsletterUnsubscribe = (options = {}) => {
  return useMutation(
    (token) => apiService.newsletter.unsubscribe(token),
    options
  );
};

/**
 * Hook to check newsletter subscription status
 */
export const useNewsletterStatus = (email, options = {}) => {
  return useApi(
    () => apiService.newsletter.checkStatus(email),
    [email],
    {
      immediate: !!email,
      ...options,
    }
  );
};

/**
 * Hook to fetch newsletter subscribers (admin only)
 */
export const useNewsletterSubscribers = (filters = {}, options = {}) => {
  return usePaginatedApi(apiService.newsletter.getSubscribers, filters, options);
};

/**
 * Hook to export newsletter subscribers (admin only)
 */
export const useExportNewsletterSubscribers = (options = {}) => {
  return useMutation(
    (status = "active") => apiService.newsletter.exportSubscribers(status),
    options
  );
};