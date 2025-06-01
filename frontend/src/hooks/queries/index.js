// frontend/src/hooks/queries/index.js

// Articles hooks
export {
  useArticles,
  useArticleBySlug,
  useArticleById,
  useArticleSearch,
  useRelatedArticles,
  useUserArticles,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useToggleArticleLike,
  ARTICLES_QUERY_KEYS,
} from './useArticles';

// Comments hooks
export {
  useCommentsByArticle,
  useComment,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useOptimisticCreateComment,
  COMMENTS_QUERY_KEYS,
} from './useComments';

// Auth hooks
export {
  useCurrentUser,
  useLogin,
  useRegister,
  useLogout,
  useUpdateProfile,
  useChangePassword,
  useUploadAvatar,
  useVerifyEmail,
  useResendVerification,
  useForgotPassword,
  useResetPassword,
  AUTH_QUERY_KEYS,
} from './useAuth';

// Tags hooks
export {
  useTags,
  usePopularTags,
  useTagBySlug,
  useTag,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  TAGS_QUERY_KEYS,
} from './useTags';