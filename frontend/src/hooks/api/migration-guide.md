# API Hooks Migration Guide

This guide shows how to migrate from direct axios calls to using the centralized API hooks.

## Overview of Available Hooks

### Article Hooks (`useArticles.js`)
- `useArticles` - Fetch articles with filters
- `useArticleBySlug` - Fetch single article by slug
- `useArticleById` - Fetch single article by ID
- `useRelatedArticles` - Fetch related articles
- `useCreateArticle` - Create new article
- `useUpdateArticle` - Update existing article
- `useDeleteArticle` - Delete article
- `useMyArticles` - Fetch current user's articles

### Admin Hooks (`useAdmin.js`)
- `useDashboardStats` - Fetch dashboard statistics
- `useAdminUsers` - Fetch users list (paginated)
- `useUpdateUserRole` - Update user role
- `useDeleteUser` - Delete user
- `useAdminArticles` - Fetch articles for admin (paginated)
- `useBlockArticle` - Block an article
- `useUnblockArticle` - Unblock an article
- `useDeleteArticleAdmin` - Delete article (admin)
- `useAdminTags` - Fetch tags for admin
- `useCreateTagAdmin` - Create new tag
- `useUpdateTagAdmin` - Update tag
- `useDeleteTagAdmin` - Delete tag
- `useMergeTags` - Merge two tags
- `useAdminContactMessages` - Fetch contact messages (admin)
- `useMarkContactMessageReadAdmin` - Mark message as read (admin)
- `useDeleteContactMessageAdmin` - Delete contact message (admin)

### Comment Hooks (`useComments.js`)
- `useComments` - Fetch comments for an article
- `useCreateComment` - Create new comment
- `useUpdateComment` - Update comment
- `useDeleteComment` - Delete comment
- `useReportComment` - Report a comment

### Auth Hooks (`useAuth.js`)
- `useLogin` - User login
- `useRegister` - User registration
- `useProfile` - Fetch user profile
- `useUpdateProfile` - Update user profile
- `useChangePassword` - Change password
- `useUploadAvatar` - Upload avatar image

### Other Hooks
- `useTags` - Tag operations
- `useLikes` - Like operations
- `useContact` - Contact form operations
- `useSiteSettings` - Site settings management
- `useNewsletter` - Newsletter subscription
- `useForum` - Forum operations

## Migration Examples

### Example 1: Fetching Articles (Admin)

**BEFORE (Direct Axios):**
```javascript
const [articles, setArticles] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const fetchArticles = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem("beekeeper_auth_token");
    const response = await axios.get(`${API_URL}/articles`, {
      params: { page: currentPage, limit: 10 },
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.data.success) {
      setArticles(response.data.data || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    }
  } catch (error) {
    setError("Failed to load articles");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchArticles();
}, [currentPage]);
```

**AFTER (Using Hooks):**
```javascript
import { useAdminArticles } from "../../hooks/api/useAdmin";

const {
  data: articlesData,
  loading,
  error,
  refetch,
  pagination,
} = useAdminArticles(
  { page: currentPage, limit: 10 },
  { enabled: true }
);

const articles = articlesData?.data || [];
const totalPages = pagination?.totalPages || 1;
```

### Example 2: Blocking an Article

**BEFORE (Direct Axios):**
```javascript
const handleBlockToggle = async () => {
  try {
    setActionLoading(true);
    const token = localStorage.getItem("beekeeper_auth_token");
    const endpoint = article.blocked
      ? `${API_URL}/admin/articles/${article.id}/unblock`
      : `${API_URL}/admin/articles/${article.id}/block`;
    
    const response = await axios.put(endpoint, 
      { reason: blockReason },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      // Update local state
      fetchArticles(); // Refetch
    }
  } catch (error) {
    setActionError("Failed to update article status");
  } finally {
    setActionLoading(false);
  }
};
```

**AFTER (Using Hooks):**
```javascript
import { useBlockArticle, useUnblockArticle } from "../../hooks/api/useAdmin";

const blockArticleMutation = useBlockArticle({
  onSuccess: () => {
    setShowBlockModal(false);
    refetch(); // Refetch articles
  },
  onError: (error) => {
    console.error("Error blocking article:", error);
  },
});

const unblockArticleMutation = useUnblockArticle({
  onSuccess: () => {
    setShowBlockModal(false);
    refetch();
  },
});

const handleBlockToggle = () => {
  if (article.blocked) {
    unblockArticleMutation.mutate(article.id);
  } else {
    blockArticleMutation.mutate({
      articleId: article.id,
      reason: blockReason,
    });
  }
};

// Loading state: blockArticleMutation.loading || unblockArticleMutation.loading
// Error: blockArticleMutation.error || unblockArticleMutation.error
```

### Example 3: Contact Form Submission

**BEFORE (Direct Axios):**
```javascript
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitStatus, setSubmitStatus] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    const response = await axios.post(`${API_URL}/contact`, formData);
    
    if (response.data.success) {
      setSubmitStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    }
  } catch (error) {
    setSubmitStatus("error");
    setSubmitMessage(error.response?.data?.message || "Failed to send");
  } finally {
    setIsSubmitting(false);
  }
};
```

**AFTER (Using Hooks):**
```javascript
import { useSendContactMessage } from "../../hooks/api/useContact";

const sendMessageMutation = useSendContactMessage({
  onSuccess: () => {
    setSubmitStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
  },
  onError: (error) => {
    setSubmitStatus("error");
    setSubmitMessage(error.message || "Failed to send");
  },
});

const handleSubmit = (e) => {
  e.preventDefault();
  sendMessageMutation.mutate(formData);
};

// Loading state: sendMessageMutation.loading
// Error: sendMessageMutation.error
```

### Example 4: Dashboard Stats

**BEFORE (Direct Axios):**
```javascript
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("beekeeper_auth_token");
      const response = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };
  
  fetchStats();
}, []);
```

**AFTER (Using Hooks):**
```javascript
import { useDashboardStats } from "../../hooks/api/useAdmin";

const { data: stats, loading, error } = useDashboardStats();

// That's it! The hook handles everything
```

## Key Benefits

1. **Less Boilerplate**: No need to manage loading, error states manually
2. **Automatic Token Handling**: API service adds auth headers automatically
3. **Consistent Error Handling**: All errors follow the same pattern
4. **Built-in Retry Logic**: Failed requests can be retried automatically
5. **Request Deduplication**: Multiple components requesting same data share the request
6. **Cache Management**: Data is cached and can be invalidated when needed
7. **Optimistic Updates**: UI can be updated before server confirms
8. **TypeScript Ready**: Hooks provide proper typing for responses

## Common Patterns

### Refetching Data
```javascript
const { data, refetch } = useArticles();

// Manual refetch
const handleRefresh = () => {
  refetch();
};
```

### Handling Loading States
```javascript
const { loading: articlesLoading } = useArticles();
const { loading: tagsLoading } = useTags();

const isLoading = articlesLoading || tagsLoading;
```

### Error Handling
```javascript
const { error } = useArticles();

if (error) {
  return <ErrorAlert error={error.message || "Failed to load"} />;
}
```

### Mutations with Callbacks
```javascript
const updateMutation = useUpdateArticle({
  onSuccess: (data) => {
    toast.success("Article updated!");
    navigate(`/articles/${data.slug}`);
  },
  onError: (error) => {
    toast.error(error.message);
  },
  onSettled: () => {
    // Called whether success or error
    setIsEditing(false);
  },
});
```

### Conditional Fetching
```javascript
const { data } = useArticleBySlug(slug, {
  enabled: !!slug, // Only fetch if slug exists
});
```

### Pagination
```javascript
const [page, setPage] = useState(1);

const { data, pagination } = useArticles(
  { page, limit: 10 },
  { keepPreviousData: true } // Keep showing old data while fetching new page
);
```

## Migration Checklist

When migrating a component:

1. [ ] Remove axios import
2. [ ] Import appropriate hooks from `/hooks/api/`
3. [ ] Remove manual state for loading, error, data
4. [ ] Replace axios calls with hook mutations or queries
5. [ ] Update error handling to use hook's error state
6. [ ] Update loading indicators to use hook's loading state
7. [ ] Remove manual token handling (handled by API service)
8. [ ] Test refetch functionality if needed
9. [ ] Remove useEffect for initial data fetching (hooks handle it)
10. [ ] Update any dependent components

## Tips

- Start with read operations (GET requests) first
- Then migrate write operations (POST, PUT, DELETE)
- Use the `enabled` option to control when queries run
- Use `onSuccess` and `onError` callbacks for side effects
- Check if a hook already exists before creating a new one
- The API service in `/services/api.js` handles all the axios configuration