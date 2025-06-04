# Breadcrumb System Usage Guide

## Overview

The breadcrumb system has been implemented across the entire site, providing automatic navigation trails based on the current route. The system is flexible and supports dynamic content labels.

## Components

### 1. EnhancedBreadcrumbs
The main breadcrumb component that's automatically included in both MainLayout and AdminLayout.

### 2. BreadcrumbContext
Provides dynamic breadcrumb data management across the application.

### 3. useDynamicBreadcrumb Hook
A convenient hook for setting dynamic breadcrumb labels from page components.

## Usage Examples

### Basic Usage (Automatic)
Most pages will have breadcrumbs automatically generated based on the URL structure:
- `/articles` → Home > Articles
- `/admin/users` → Home > Admin > Users
- `/forum/categories/general` → Home > Forum > Categories > General

### Dynamic Content Pages

#### Article Page
```javascript
import useDynamicBreadcrumb from '../hooks/useDynamicBreadcrumb';

const ArticlePage = () => {
  const { data: article } = useArticleBySlug(slug);
  
  // Set dynamic breadcrumb with article title
  useDynamicBreadcrumb({ title: article?.title }, [article?.title]);
  
  // Result: Home > Articles > [Article Title]
};
```

#### Forum Thread Page
```javascript
const ForumThreadPage = () => {
  const { setDynamicBreadcrumb } = useBreadcrumb();
  
  // Set thread title
  useDynamicBreadcrumb({ title: thread?.title }, [thread?.title]);
  
  // Set category name
  useEffect(() => {
    if (thread?.category) {
      setDynamicBreadcrumb(`/forum/categories/${thread.category.slug}`, {
        name: thread.category.name
      });
    }
  }, [thread, setDynamicBreadcrumb]);
  
  // Result: Home > Forum > Categories > [Category Name] > [Thread Title]
};
```

#### Tag Page
```javascript
const TagPage = () => {
  const { data: tag } = useTagBySlug(slug);
  
  useDynamicBreadcrumb({ name: tag?.name }, [tag?.name]);
  
  // Result: Home > Tags > [Tag Name]
};
```

## Customization

### CSS Classes
The breadcrumb component supports various CSS classes for styling:
- `breadcrumb-minimal` - Removes background, minimal styling
- `breadcrumb-inline` - Inline display for compact spaces
- `breadcrumb-mobile-compact` - Collapses intermediate items on mobile

### Props
```javascript
<EnhancedBreadcrumbs
  className="breadcrumb-minimal"  // Additional CSS classes
  showHome={true}                 // Show/hide home link
  maxItems={5}                    // Limit number of items shown
/>
```

## Route Configuration

The breadcrumb labels are configured in `EnhancedBreadcrumbs.js`. To add or modify labels:

```javascript
const routeConfig = {
  '/articles': {
    label: 'Articles',
    children: {
      '/new': { label: 'New Article' },
      '/:slug': {
        label: (slug) => dynamicBreadcrumbs[`/articles/${slug}`]?.title || formatSlug(slug)
      }
    }
  },
  // Add more routes...
};
```

## Best Practices

1. **Set Dynamic Data Early**: Call `useDynamicBreadcrumb` as soon as the data is available
2. **Clean Dependencies**: Include proper dependencies in the hook to update when data changes
3. **Hierarchical Data**: For nested routes (like forum categories), set breadcrumbs for parent paths too
4. **Loading States**: Breadcrumbs will show formatted slugs until dynamic data is loaded
5. **Error Handling**: The system gracefully handles missing data by formatting URL slugs

## Notes

- Breadcrumbs are automatically hidden on the home page
- The system supports both light and dark themes
- Mobile responsive with intelligent truncation
- All breadcrumb links use React Router for SPA navigation
- The forum pages have been updated to use the centralized system instead of their own breadcrumbs

## Special Route Handling

### Forum Routes
The breadcrumb system intelligently handles forum routes:
- `/forum/categories/beginner-questions` → Home > Forum > Beginner Questions
- `/forum/threads/best-hive-type-for-beginners` → Home > Forum > Beginner Questions > Best Hive Type For Beginners
- `/forum/categories/general/new-thread` → Home > Forum > General > New Thread

The "categories" and "threads" segments are automatically hidden using the `skipInBreadcrumb` flag to avoid redundancy.

For forum threads, the system automatically inserts the category breadcrumb between "Forum" and the thread title by using the category information passed through the `useDynamicBreadcrumb` hook:

```javascript
// In ForumThreadPage
useDynamicBreadcrumb({ 
  title: thread?.title,
  category: thread?.category  // This enables the hierarchy
}, [thread?.title, thread?.category]);
```

### Dynamic Content
For pages with dynamic content (like forum categories and threads), the breadcrumb will:
1. First try to use the dynamic label set via `useDynamicBreadcrumb`
2. Fall back to formatting the URL slug (e.g., "beginner-questions" → "Beginner Questions")

This ensures breadcrumbs always show meaningful text even before the page data loads.