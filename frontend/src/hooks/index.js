// frontend/src/hooks/index.js

// Form hooks
export { default as useArticleForm } from "./useArticleForm";
export { default as useFormValidation, commonValidations } from "./useFormValidation";

// Data fetching hooks
export { default as useArticleFetch } from "./useArticleFetch";

// Error handling hooks
export { useErrorDisplay, useApiErrorDisplay } from "./useErrorDisplay";

// Generic API hooks
export { useApi, usePaginatedApi, useMutation } from "./useApi";

// Feature-specific API hooks
export * from "./api/useArticles";
export * from "./api/useAuth";
export * from "./api/useComments";
export * from "./api/useTags";
export * from "./api/useAdmin";
export * from "./api/useLikes";
export * from "./api/useForum";
export * from "./api/useContact";
export * from "./api/useSiteSettings";
export * from "./api/useNewsletter";
export * from "./api/useAuthorApplications";
