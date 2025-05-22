// ============================================================================
// frontend/src/utils/validators.js - CLIENT-SIDE VALIDATION
// ============================================================================

import { VALIDATION_RULES } from "./constants";

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  const { MIN_LENGTH, PATTERN } = VALIDATION_RULES.PASSWORD;

  if (!password || password.length < MIN_LENGTH) {
    return `Password must be at least ${MIN_LENGTH} characters long`;
  }

  if (!PATTERN.test(password)) {
    return "Password must contain at least one lowercase letter, one uppercase letter, and one number";
  }

  return null;
};

export const validateUsername = (username) => {
  const { MIN_LENGTH, MAX_LENGTH, PATTERN } = VALIDATION_RULES.USERNAME;

  if (!username || username.length < MIN_LENGTH) {
    return `Username must be at least ${MIN_LENGTH} characters long`;
  }

  if (username.length > MAX_LENGTH) {
    return `Username cannot exceed ${MAX_LENGTH} characters`;
  }

  if (!PATTERN.test(username)) {
    return "Username can only contain letters, numbers, underscores, and hyphens";
  }

  return null;
};

export const validateArticleTitle = (title) => {
  const { MIN_LENGTH, MAX_LENGTH } = VALIDATION_RULES.ARTICLE.TITLE;

  if (!title || title.trim().length < MIN_LENGTH) {
    return `Title must be at least ${MIN_LENGTH} characters long`;
  }

  if (title.length > MAX_LENGTH) {
    return `Title cannot exceed ${MAX_LENGTH} characters`;
  }

  return null;
};

export const validateArticleContent = (content) => {
  const { MIN_LENGTH } = VALIDATION_RULES.ARTICLE.CONTENT;

  const textContent = stripHtml(content);

  if (!textContent || textContent.trim().length < MIN_LENGTH) {
    return `Content must be at least ${MIN_LENGTH} characters long`;
  }

  return null;
};

export const validateComment = (content) => {
  const { MIN_LENGTH, MAX_LENGTH } = VALIDATION_RULES.COMMENT;

  if (!content || content.trim().length < MIN_LENGTH) {
    return `Comment must be at least ${MIN_LENGTH} characters long`;
  }

  if (content.length > MAX_LENGTH) {
    return `Comment cannot exceed ${MAX_LENGTH} characters`;
  }

  return null;
};

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
