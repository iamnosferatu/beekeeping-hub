// frontend/src/hooks/api/useContact.js
import { useApi, usePaginatedApi, useMutation } from "../useApi";
import apiService from "../../services/api";

/**
 * Hook to send a contact message
 */
export const useSendContactMessage = (options = {}) => {
  return useMutation(apiService.contact.send, options);
};

/**
 * Hook to fetch contact messages (admin only)
 */
export const useContactMessages = (filters = {}, options = {}) => {
  return usePaginatedApi(apiService.contact.getMessages, filters, options);
};

/**
 * Hook to mark message as read (admin only)
 */
export const useMarkMessageAsRead = (options = {}) => {
  return useMutation(apiService.contact.markAsRead, options);
};

/**
 * Hook to delete contact message (admin only)
 */
export const useDeleteContactMessage = (options = {}) => {
  return useMutation(apiService.contact.delete, options);
};