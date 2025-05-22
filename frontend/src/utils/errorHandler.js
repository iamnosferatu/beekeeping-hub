// ============================================================================
// frontend/src/utils/errorHandler.js - FRONTEND ERROR HANDLING
// ============================================================================

import { ERROR_MESSAGES } from "./constants";

export const getErrorMessage = (error) => {
  // Network errors
  if (!error.response) {
    return ERROR_MESSAGES.NETWORK;
  }

  const { status, data } = error.response;

  // Handle specific HTTP status codes
  switch (status) {
    case 400:
      return data.message || ERROR_MESSAGES.VALIDATION;
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 422:
      return data.message || ERROR_MESSAGES.VALIDATION;
    case 500:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return data.message || ERROR_MESSAGES.UNKNOWN;
  }
};

export const handleApiError = (error, showToast = true) => {
  const message = getErrorMessage(error);

  if (showToast && window.showToast) {
    window.showToast(message, "error");
  }

  // Log error for debugging
  console.error("API Error:", {
    message,
    status: error.response?.status,
    data: error.response?.data,
    originalError: error,
  });

  return message;
};

export const isUnauthorizedError = (error) => {
  return error.response?.status === 401;
};

export const isValidationError = (error) => {
  return error.response?.status === 422 || error.response?.status === 400;
};

export const getValidationErrors = (error) => {
  if (!isValidationError(error)) return [];

  return error.response?.data?.errors || [];
};
