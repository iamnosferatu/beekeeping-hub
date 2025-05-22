# API Layer Migration Guide

## Overview
This guide explains how to migrate from the current scattered axios calls to the new centralized API service layer.

## What's New

### 1. **Centralized API Service** (`services/api.js`)
- Single axios instance with consistent configuration
- Automatic request/response interceptors
- Centralized error handling
- Organized endpoints by feature (auth, articles, comments, etc.)

### 2. **Custom API Hooks** (`hooks/useApi.js`)
- `useApi` - Generic hook for single API calls
- `usePaginatedApi` - Hook for paginated data
- `useMutation` - Hook for create/update/delete operations

### 3. **Feature-Specific Hooks** (`hooks/api/`)
- `useArticles` - Article-related hooks
- `useAuth` - Authentication hooks  
- `useComments` - Comment hooks
- `useTags` - Tag hooks
- `useAdmin` - Admin hooks

## Migration Steps

### Step 1: Create the New Files

Create these new files in your project:

```
frontend/src/
├── services/
│   └── api.js                 # Main API service
├── hooks/
│   ├── useApi.js             # Generic API hooks
│   └── api/
│       ├── useArticles.js    # Article hooks
│       ├── useAuth.js        # Auth hooks
│       ├── useComments.js    # Comment hooks
│       ├── useTags.js        # Tag hooks
│       └── useAdmin.js       # Admin hooks
```

### Step 2: Update AuthContext

Replace the current `AuthContext.js` with the updated version that uses the new API service.

### Step 3: Migrate Components One by One

#### Before (Old Way):
```javascript
// Components making direct axios calls
const [articles, setArticles] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/articles`);
      setArticles(response.data.data);
    } catch (err) {
      setError("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };
  fetchArticles();
}, []);
```

#### After (New Way):
```javascript
// Using the new hooks
import { useArticles } from '../hooks/api/useArticles';

const { data: articles, loading, error } = useArticles();
```

### Step 4: Priority Migration Order

1. **High Priority (Migrate First):**
   - `AuthContext.js` ✅ (Already updated)
   - `ArticleList.js` ✅ (Already updated)
   - `TagSelector.js`
   - `ArticlePage.js`

2. **Medium Priority:**
   - `MyArticlesPage.js`
   - `ArticleEditorPage.js`
   - `ProfilePage.js`

3. **Low Priority:**
   - Admin pages
   - Debug pages

## Benefits After Migration

### 1. **Consistent Error Handling**
```javascript
// Automatic error categorization
{
  type: 'NETWORK_ERROR' | 'AUTH_ERROR' | 'VALIDATION_ERROR' | etc.,
  message: 'User-friendly error message',
  status: 404,
  data: { /* original error data */ }
}
```

### 2. **Automatic Authentication**
- Tokens automatically added to requests
- Automatic logout on 401 errors
- No more manual header management

### 3. **Better Developer Experience**
```javascript
// Before: Manual state management
const [data, setData] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

// After: Hook handles everything
const { data, loading, error, refetch } = useArticles();
```

### 4. **Standardized Patterns**
```javascript
// Mutations follow same pattern
const { mutate: createArticle, loading, error } = useCreateArticle({
  onSuccess: (data) => {
    navigate(`/articles/${data.slug}`);
  },
  onError: (error) => {
    toast.error(error.message);
  }
});
```

## Example Migrations

### TagSelector Component
```javascript
// Before
useEffect(() => {
  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_URL}/tags`);
      if (response.data.success) {
        setAvailableTags(response.data.data.map(tag => tag.name));
      }
    } catch (err) {
      // Fallback to mock data
      setAvailableTags(['Beginner', 'Advanced', /* ... */]);
    }
  };
  fetchTags();
}, []);

// After
import { useTags } from '../../hooks/api/useTags';

const { data: tags, error } = useTags({
  transform: (data) => data.map(tag => tag.name),
  onError: () => {
    // Fallback to mock data
    setAvailableTags(['Beginner', 'Advanced', /* ... */]);
  }
});
```

### Article Creation
```javascript
// Before
const handleSave = async (articleData) => {
  try {
    setSaving(true);
    const response = isEditMode 
      ? await axios.put(`${API_URL}/articles/${id}`, articleData)
      : await axios.post(`${API_URL}/articles`, articleData);
    
    if (response.data.success) {
      navigate(`/articles/${response.data.data.slug}`);
    }
  } catch (error) {
    setError(error.message);
  } finally {
    setSaving(false);
  }
};

// After
import { useCreateArticle, useUpdateArticle } from '../hooks/api/useArticles';

const { mutate: createArticle } = useCreateArticle({
  onSuccess: (data) => navigate(`/articles/${data.slug}`)
});

const { mutate: updateArticle } = useUpdateArticle({
  onSuccess: (data) => navigate(`/articles/${data.slug}`)
});

const handleSave = (articleData) => {
  if (isEditMode) {
    updateArticle(id, articleData);
  } else {
    createArticle(articleData);
  }
};
```

## Error Handling Examples

### Network Errors
```javascript
const { data, error } = useArticles();

if (error?.type === 'NETWORK_ERROR') {
  return (
    <Alert variant="warning">
      <p>Connection issues detected.</p>
      <Button onClick={refetch}>Try Again</Button>
    </Alert>
  );
}
```

### Authentication Errors
```javascript
// Automatically handled by interceptors
// User is redirected to login page
// Token is cleared from localStorage
```

### Validation Errors
```javascript
const { mutate: createArticle, error } = useCreateArticle();

if (error?.type === 'VALIDATION_ERROR') {
  // error.data.errors contains field-specific errors
  const fieldErrors = error.data.errors;
}
```

## Testing the Migration

1. **Start with one component** (e.g., `ArticleList`)
2. **Test all scenarios:**
   - Normal data loading
   - Error states
   - Loading states
   - Authentication flows
3. **Verify error handling** works correctly
4. **Check network tab** for proper request headers
5. **Test offline scenarios**

## Rollback Plan

If issues arise, you can temporarily rollback by:
1. Keeping old component versions as `.old.js` files
2. Switching imports back to old components
3. The new API service doesn't affect existing code

## Next Steps After Migration

1. **Add React Query** for advanced caching and synchronization
2. **Implement optimistic updates** for better UX
3. **Add retry logic** for failed requests
4. **Implement background sync** for offline scenarios

This migration will significantly improve code maintainability, error handling, and developer experience while providing a solid foundation for future enhancements.