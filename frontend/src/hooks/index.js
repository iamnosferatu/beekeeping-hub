// frontend/src/hooks/index.js

// Form hooks
export { default as useArticleForm } from "./useArticleForm";
export { default as useFormValidation, commonValidations } from "./useFormValidation";

// Data fetching hooks
export { default as useArticleFetch } from "./useArticleFetch";

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
