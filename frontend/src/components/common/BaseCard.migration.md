# BaseCard Migration Guide

This guide shows how to migrate from various card implementations to the standardized BaseCard component.

## Benefits of BaseCard

1. **Consistent Structure**: All cards follow the same layout patterns
2. **Built-in Features**: Loading states, badges, hover effects, click handling
3. **Flexible Layouts**: Support for different image positions and card orientations
4. **Accessibility**: Proper ARIA labels and keyboard navigation
5. **Performance**: Optimized rendering and event handling

## Basic Migration

### Simple Card

**BEFORE:**
```jsx
<Card>
  <Card.Body>
    <Card.Title>Card Title</Card.Title>
    <Card.Text>
      Card content goes here
    </Card.Text>
  </Card.Body>
</Card>
```

**AFTER:**
```jsx
<BaseCard title="Card Title">
  Card content goes here
</BaseCard>
```

### Card with Image

**BEFORE:**
```jsx
<Card>
  <Card.Img variant="top" src="/image.jpg" />
  <Card.Body>
    <Card.Title>Image Card</Card.Title>
    <Card.Text>Description</Card.Text>
  </Card.Body>
</Card>
```

**AFTER:**
```jsx
<BaseCard
  title="Image Card"
  image="/image.jpg"
>
  Description
</BaseCard>
```

### Clickable Card

**BEFORE:**
```jsx
<Card 
  className="cursor-pointer"
  onClick={handleClick}
  style={{ transition: 'all 0.2s' }}
  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
>
  <Card.Body>
    <Card.Title>Clickable Card</Card.Title>
  </Card.Body>
</Card>
```

**AFTER:**
```jsx
<BaseCard
  title="Clickable Card"
  onClick={handleClick}
  hoverable
/>
```

## Common Patterns

### Article Card

**BEFORE:**
```jsx
const ArticleCard = ({ article }) => (
  <Card className="h-100 shadow-sm article-card">
    {article.featured_image && (
      <Link to={`/articles/${article.slug}`}>
        <Card.Img 
          variant="top" 
          src={article.featured_image}
          style={{ height: '200px', objectFit: 'cover' }}
        />
      </Link>
    )}
    <Card.Body>
      <div className="d-flex justify-content-between mb-2">
        <small className="text-muted">
          {new Date(article.created_at).toLocaleDateString()}
        </small>
        {article.status === 'draft' && (
          <Badge bg="secondary">Draft</Badge>
        )}
      </div>
      <Card.Title>
        <Link to={`/articles/${article.slug}`} className="text-decoration-none">
          {article.title}
        </Link>
      </Card.Title>
      <Card.Text>{article.excerpt}</Card.Text>
    </Card.Body>
    <Card.Footer>
      <small className="text-muted">
        By {article.author?.username} • {article.view_count} views
      </small>
    </Card.Footer>
  </Card>
);
```

**AFTER:**
```jsx
<BaseCard.Article article={article} height="full" />
// or with customization
<BaseCard
  title={article.title}
  subtitle={`By ${article.author?.username}`}
  image={article.featured_image}
  to={`/articles/${article.slug}`}
  badge={article.status === 'draft' && { text: 'Draft', variant: 'secondary' }}
  footer={
    <div className="d-flex justify-content-between text-muted small">
      <span>{new Date(article.created_at).toLocaleDateString()}</span>
      <span>{article.view_count} views</span>
    </div>
  }
  hoverable
  height="full"
>
  {article.excerpt}
</BaseCard>
```

### Stats Card

**BEFORE:**
```jsx
<Card className="h-100 shadow-sm">
  <Card.Body>
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <h6 className="text-muted mb-1">Total Articles</h6>
        <h3 className="mb-0">{stats.articles.total}</h3>
        <small className="text-success">
          +12% from last month
        </small>
      </div>
      <BsFileEarmarkText size={40} className="text-primary opacity-50" />
    </div>
  </Card.Body>
</Card>
```

**AFTER:**
```jsx
<BaseCard.Stats
  title="Total Articles"
  value={stats.articles.total}
  icon={BsFileEarmarkText}
  trend={12}
/>
```

### User Card

**BEFORE:**
```jsx
<Card>
  <Card.Header>
    <div className="d-flex justify-content-between align-items-center">
      <div>
        <h5 className="mb-0">{user.username}</h5>
        <small className="text-muted">{user.email}</small>
      </div>
      <Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>
        {user.role}
      </Badge>
    </div>
  </Card.Header>
  <Card.Body>
    <Button size="sm" onClick={() => handleEdit(user.id)}>
      Edit User
    </Button>
  </Card.Body>
</Card>
```

**AFTER:**
```jsx
<BaseCard.User
  user={user}
  actions={
    <Button size="sm" onClick={() => handleEdit(user.id)}>
      Edit User
    </Button>
  }
/>
```

## Advanced Features

### Card with Multiple Badges

```jsx
<BaseCard
  title="Premium Content"
  badges={[
    { text: "Featured", variant: "primary" },
    { text: "Popular", variant: "success", pill: true },
    { text: "New", variant: "danger", icon: <BsStarFill /> }
  ]}
>
  Content
</BaseCard>
```

### Horizontal Card Layout

```jsx
<BaseCard
  title="Product Feature"
  image="/feature.jpg"
  imagePosition="left"
  imageHeight={150}
  to="/features/awesome-feature"
  hoverable
>
  Description of the feature with image on the left
</BaseCard>
```

### Loading State

```jsx
<BaseCard
  title="Data Card"
  loading={isLoading}
  loadingText="Fetching latest data..."
>
  {data && <DataDisplay data={data} />}
</BaseCard>
```

### Custom Header and Footer

```jsx
<BaseCard
  header={
    <div className="d-flex justify-content-between">
      <h5>Custom Header</h5>
      <ButtonGroup size="sm">
        <Button variant="outline-secondary">Edit</Button>
        <Button variant="outline-secondary">Delete</Button>
      </ButtonGroup>
    </div>
  }
  footer={
    <div className="text-center">
      <Button variant="primary" className="w-100">
        View Details
      </Button>
    </div>
  }
>
  Card content
</BaseCard>
```

### Selectable Cards

```jsx
const [selected, setSelected] = useState([]);

{items.map(item => (
  <BaseCard
    key={item.id}
    title={item.name}
    selected={selected.includes(item.id)}
    onClick={() => {
      setSelected(prev =>
        prev.includes(item.id)
          ? prev.filter(id => id !== item.id)
          : [...prev, item.id]
      );
    }}
    hoverable
  >
    {item.description}
  </BaseCard>
))}
```

## Component Props Reference

### Basic Props
- `title` - Card title
- `subtitle` - Card subtitle
- `children` - Card body content
- `className` - Additional CSS classes
- `variant` - Bootstrap card variant

### Structure Props
- `header` - Custom header content
- `headerActions` - Actions for header (buttons, etc.)
- `footer` - Footer content
- `footerClassName` - Footer CSS classes

### Image Props
- `image` - Image URL
- `imageAlt` - Image alt text
- `imageHeight` - Image height in pixels
- `imagePosition` - 'top', 'left', or 'right'
- `imageOverlay` - Content to overlay on image

### Badge Props
- `badge` - Single badge object { text, variant, className }
- `badges` - Array of badge objects

### Interaction Props
- `onClick` - Click handler
- `to` - React Router link
- `href` - External link
- `hoverable` - Enable hover effects
- `clickable` - Explicitly set clickable state
- `disabled` - Disable interactions

### State Props
- `loading` - Show loading state
- `loadingText` - Loading message
- `selected` - Selected state

### Style Props
- `border` - Show/hide border
- `shadow` - Shadow size: false, 'sm', 'md', 'lg'
- `padding` - Enable/disable padding
- `height` - 'auto' or 'full' (h-100)

## Migration Checklist

When migrating to BaseCard:

1. [ ] Replace Card imports with BaseCard
2. [ ] Move Card.Title to `title` prop
3. [ ] Move Card.Subtitle to `subtitle` prop
4. [ ] Move Card.Img to `image` prop
5. [ ] Convert Card.Header to `header` prop
6. [ ] Convert Card.Footer to `footer` prop
7. [ ] Replace onClick and hover logic with built-in props
8. [ ] Use appropriate presets for common patterns
9. [ ] Add `hoverable` for interactive cards
10. [ ] Use `height="full"` for equal height cards
11. [ ] Replace custom badges with `badges` prop
12. [ ] Test loading and disabled states

## Best Practices

1. **Use Presets**: Start with BaseCard.Article, BaseCard.Stats, etc.
2. **Consistent Heights**: Use `height="full"` in grid layouts
3. **Accessible Links**: Use `to` for internal, `href` for external
4. **Loading States**: Always show loading state during data fetches
5. **Hover Effects**: Add `hoverable` to clickable cards
6. **Image Optimization**: Set appropriate `imageHeight`
7. **Badge Limit**: Don't use more than 3-4 badges
8. **Footer Actions**: Put primary actions in footer
9. **Header Actions**: Put secondary actions in header
10. **Semantic HTML**: Let BaseCard handle proper structure

## Tips

- BaseCard automatically determines if it's clickable based on props
- Image position adapts responsively on mobile
- Loading state replaces entire body content
- Selected state adds visual emphasis
- Disabled state prevents all interactions
- Shadow and border can be customized per card
- Custom content can override any section