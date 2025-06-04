# EmptyState Migration Guide

This guide shows how to migrate from the basic EmptyState component to the enhanced version with context-aware features.

## Benefits of Enhanced EmptyState

1. **Context-Aware**: Automatically adjusts messaging based on current filters and search
2. **Role-Based Actions**: Shows appropriate actions based on user permissions
3. **Preset Types**: Pre-built configurations for common scenarios
4. **Better UX**: Search tips, suggestions, and helpful guidance
5. **Consistent Design**: Unified empty states across the application

## Basic Migration

### Simple Empty State

**BEFORE:**
```jsx
import EmptyState from '../components/common/EmptyState';

<EmptyState
  icon={BsFileEarmarkText}
  title="No Articles Found"
  message="No articles have been published yet."
  action={
    <Button as={Link} to="/articles">
      Browse Articles
    </Button>
  }
/>
```

**AFTER:**
```jsx
import EmptyState from '../components/common/EmptyState.enhanced';

<EmptyState type="articles" />
```

### Search Results

**BEFORE:**
```jsx
const EmptySearchResults = ({ searchTerm }) => (
  <Alert variant="info" className="text-center py-5">
    <BsSearch size={48} className="mb-3" />
    <h4>No results for "{searchTerm}"</h4>
    <p>Try different keywords</p>
    <Button as={Link} to="/articles">
      Clear Search
    </Button>
  </Alert>
);
```

**AFTER:**
```jsx
<EmptyState.Search searchTerm={searchTerm} />
// or with search tips
<EmptyState 
  type="search"
  searchTerm={searchTerm}
  showSearchTips
/>
```

### Articles with Filters

**BEFORE:**
```jsx
const getEmptyMessage = () => {
  if (search && tag) {
    return `No articles found for "${search}" in "${tag}"`;
  }
  if (search) {
    return `No articles found for "${search}"`;
  }
  if (tag) {
    return `No articles tagged "${tag}"`;
  }
  return "No articles available";
};

<Alert variant="info">
  <h4>{getEmptyMessage()}</h4>
  {/* Complex action logic */}
</Alert>
```

**AFTER:**
```jsx
<EmptyState.Articles 
  searchTerm={search}
  filterTag={tag}
  showSearchTips={!!search}
/>
```

## Advanced Examples

### My Articles Page

**BEFORE:**
```jsx
const MyArticlesEmpty = ({ filter, userRole }) => {
  const getMessage = () => {
    switch(filter) {
      case 'draft': return "No draft articles";
      case 'published': return "No published articles";
      default: return "No articles yet";
    }
  };
  
  return (
    <Card>
      <Card.Body className="text-center py-5">
        <BsFileEarmarkText size={50} className="text-muted mb-3" />
        <h4>{getMessage()}</h4>
        {userRole === 'author' && (
          <Button as={Link} to="/editor/new">
            Create Article
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};
```

**AFTER:**
```jsx
<EmptyState.MyArticles filterStatus={filter} />
```

### Comments Section

**BEFORE:**
```jsx
const NoComments = ({ isLoggedIn }) => (
  <div className="text-center py-4 text-muted">
    <p>No comments yet. Be the first to comment!</p>
    {!isLoggedIn && (
      <Link to="/login">Login to comment</Link>
    )}
  </div>
);
```

**AFTER:**
```jsx
<EmptyState.Comments />
```

### Forum Empty State

**BEFORE:**
```jsx
const EmptyForum = ({ category, canCreate }) => (
  <Alert variant="info">
    <h5>
      {category 
        ? `No threads in ${category}` 
        : "No forum threads"}
    </h5>
    <p>Start a discussion!</p>
    {canCreate && (
      <Button variant="primary">Create Thread</Button>
    )}
  </Alert>
);
```

**AFTER:**
```jsx
<EmptyState.Forum filterCategory={category} />
```

## Custom Empty States

### With Custom Actions

```jsx
<EmptyState
  type="articles"
  searchTerm="advanced techniques"
  actions={[
    {
      label: "Clear Filters",
      onClick: handleClearFilters,
      icon: BsX,
      variant: "outline-secondary"
    },
    {
      label: "Browse All",
      to: "/articles",
      icon: BsGrid
    },
    {
      label: "Request Article",
      onClick: () => setShowRequestModal(true),
      icon: BsPlus,
      variant: "success"
    }
  ]}
/>
```

### With Suggestions

```jsx
<EmptyState
  type="articles"
  showSuggestions
  showSearchTips={false}
/>
```

### Compact Mode

```jsx
<EmptyState
  type="bookmarks"
  compact
  variant="alert"
/>
```

### Custom Everything

```jsx
<EmptyState
  icon={BsRobot}
  title="No Robots Found"
  message="The hive is robot-free"
  variant="card"
  actions={[
    {
      label: "Import Robots",
      onClick: handleImport,
      variant: "primary"
    }
  ]}
  showDefaultActions={false}
>
  <div className="mt-3">
    <small className="text-muted">
      Robots help automate hive management
    </small>
  </div>
</EmptyState>
```

## Component Props Reference

### Type Presets
- `articles` - Article listings
- `search` - Search results
- `comments` - Comment sections
- `myArticles` - User's articles
- `bookmarks` - Bookmarked items
- `likes` - Liked items
- `forumCategories` - Forum categories
- `forumThreads` - Forum threads
- `contactMessages` - Contact messages
- `users` - User listings

### Context Props
- `searchTerm` - Current search query
- `filterTag` - Active tag filter
- `filterCategory` - Active category filter
- `filterStatus` - Status filter (draft, published, etc.)
- `itemType` - Custom item type name

### Display Props
- `variant` - Display style: 'card', 'alert', 'none'
- `compact` - Smaller size for inline usage
- `showSearchTips` - Display search tips
- `showSuggestions` - Show contextual suggestions
- `showDefaultActions` - Use default actions for type

### Action Props
- `actions` - Array of custom actions
- `primaryActionLabel` - Quick primary action label
- `primaryActionTo` - Primary action route
- `primaryActionOnClick` - Primary action handler

## Migration Checklist

When migrating empty states:

1. [ ] Identify the empty state type (articles, search, etc.)
2. [ ] Replace custom empty state with appropriate type preset
3. [ ] Add context props (searchTerm, filters, etc.)
4. [ ] Remove redundant role checks (handled automatically)
5. [ ] Enable features like search tips or suggestions
6. [ ] Test with different user roles
7. [ ] Verify actions work correctly
8. [ ] Check responsive behavior
9. [ ] Update any custom styling
10. [ ] Remove old empty state components

## Best Practices

1. **Use Type Presets**: Start with built-in types before customizing
2. **Provide Context**: Always pass search terms and filters
3. **Enable Features**: Use search tips and suggestions where helpful
4. **Keep It Simple**: Let the component handle complexity
5. **Test Roles**: Verify actions appear for correct user roles
6. **Be Consistent**: Use the same empty state style across similar features

## Tips

- Use `EmptyState.Articles`, `EmptyState.Search`, etc. for cleaner code
- The component automatically handles user role checks
- Search tips only show when there's a search term
- Suggestions adapt based on context and user state
- Custom content can be added as children
- Actions can be links (to) or callbacks (onClick)