# Feature Development Guide - Beekeeping Hub

This guide provides comprehensive instructions for designing and implementing new features in the Beekeeping Hub application. It covers architecture, common components, patterns, and best practices established through our recent refactoring efforts.

## Table of Contents

1. [Application Architecture](#application-architecture)
2. [Folder Structure](#folder-structure)
3. [Common Components](#common-components)
4. [Creating a New Feature](#creating-a-new-feature)
5. [API Integration Patterns](#api-integration-patterns)
6. [Form Handling](#form-handling)
7. [Error Handling](#error-handling)
8. [Breadcrumb System](#breadcrumb-system)
9. [Best Practices](#best-practices)
10. [Example: Building a Product Marketplace Feature](#example-building-a-product-marketplace-feature)

## Application Architecture

The Beekeeping Hub follows a modern React/Express architecture with clear separation of concerns:

### Frontend Architecture
- **React 18.2** with functional components and hooks
- **React Router 6** for navigation
- **React Query** for server state management
- **Context API** for global state (Auth, Theme, SiteSettings, Breadcrumbs)
- **Bootstrap 5.2** for UI components and styling
- **SCSS** for custom styling with component-specific modules

### Backend Architecture
- **Express.js** REST API
- **Sequelize ORM** with MySQL database
- **JWT Authentication** with role-based access control
- **MVC Pattern** with controllers, models, and routes
- **Middleware** for auth, validation, rate limiting, and error handling

### Key Design Principles
1. **Component Reusability**: Use common components to maintain consistency
2. **Separation of Concerns**: API logic in hooks, UI in components
3. **Progressive Enhancement**: Features work without JavaScript where possible
4. **Mobile-First Design**: All features must be responsive
5. **Accessibility**: WCAG 2.1 AA compliance

## Folder Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/        # Generic components (BaseCard, BaseModal, etc.)
│   │   ├── articles/      # Article-specific components
│   │   ├── admin/         # Admin panel components
│   │   ├── auth/          # Authentication components
│   │   ├── editor/        # Content editor components
│   │   ├── forum/         # Forum components
│   │   └── layout/        # Layout components (Header, Footer)
│   ├── contexts/          # React Context providers
│   ├── hooks/             # Custom React hooks
│   │   ├── api/          # API integration hooks
│   │   └── queries/      # React Query hooks
│   ├── pages/            # Page components (routes)
│   │   └── admin/        # Admin page components
│   ├── services/         # API service layer
│   ├── utils/            # Utility functions
│   └── constants/        # App constants

backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── models/          # Sequelize models
│   ├── routes/          # Express routes
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── validators/      # Input validation
```

## Common Components

### BaseCard
A versatile card component for displaying content in a consistent format.

```jsx
import BaseCard from '../components/common/BaseCard';

// Basic usage
<BaseCard
  title="Article Title"
  subtitle="By Author Name"
  content="Article excerpt..."
  image="/images/article.jpg"
  to="/articles/article-slug"
  hoverable
/>

// Using presets
<BaseCard.Stats
  title="Total Articles"
  value={42}
  icon={<FileText />}
  trend="+12%"
  variant="primary"
/>

// With custom layout
<BaseCard
  header={<CardHeader />}
  footer={<CardFooter />}
  imagePosition="right"
  badges={[
    { text: 'Featured', variant: 'primary' },
    { text: 'New', variant: 'success' }
  ]}
>
  <CardContent />
</BaseCard>
```

### BaseModal
Standardized modal component with consistent styling and behavior.

```jsx
import BaseModal from '../components/common/BaseModal';

<BaseModal
  show={showModal}
  onHide={() => setShowModal(false)}
  title="Confirm Action"
  size="md"
  footer={
    <>
      <Button variant="secondary" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }
>
  <p>Are you sure you want to perform this action?</p>
</BaseModal>
```

### DataTable
Powerful table component with sorting, filtering, and pagination.

```jsx
import DataTable from '../components/common/DataTable';

const columns = [
  { key: 'title', label: 'Title', sortable: true },
  { key: 'author', label: 'Author', sortable: true },
  { key: 'status', label: 'Status', render: (row) => (
    <StatusBadge status={row.status} />
  )},
  { key: 'actions', label: 'Actions', render: (row) => (
    <Button size="sm" onClick={() => handleEdit(row)}>Edit</Button>
  )}
];

<DataTable
  data={articles}
  columns={columns}
  searchable
  searchKeys={['title', 'author']}
  sortBy="createdAt"
  sortOrder="desc"
  onRowClick={(row) => navigate(`/articles/${row.slug}`)}
/>
```

### FormField
Reduces boilerplate for form inputs.

```jsx
import FormField from '../components/common/FormField';

<FormField
  label="Email Address"
  name="email"
  type="email"
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
  error={errors.email}
  required
  placeholder="Enter your email"
  helpText="We'll never share your email"
/>
```

### StatusBadge
Consistent status indicators across the application.

```jsx
import StatusBadge from '../components/common/StatusBadge';

<StatusBadge status="published" />
<StatusBadge status="draft" size="sm" />
<StatusBadge status="blocked" variant="pill" />
```

### EmptyState
Context-aware empty state displays.

```jsx
import EmptyState from '../components/common/EmptyState';

<EmptyState
  icon={<FileText size={48} />}
  title="No articles found"
  message="Start by creating your first article"
  action={
    <Button onClick={() => navigate('/editor/new')}>
      Create Article
    </Button>
  }
/>
```

### LoadingIndicator
Flexible loading states.

```jsx
import LoadingIndicator from '../components/common/LoadingIndicator';

// Spinner
<LoadingIndicator />

// Skeleton
<LoadingIndicator type="skeleton" rows={3} />

// Full page
<LoadingIndicator fullPage message="Loading articles..." />
```

## Creating a New Feature

### Step 1: Plan the Feature Structure

1. **Define the data model** (if backend changes needed)
2. **Identify required pages/routes**
3. **List necessary components**
4. **Determine API endpoints**
5. **Plan user permissions**

### Step 2: Backend Implementation

#### 2.1 Create Database Migration
```bash
cd backend
npx sequelize-cli migration:create --name add-products-table
```

```javascript
// migrations/[timestamp]-add-products-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('products');
  }
};
```

#### 2.2 Create Model
```javascript
// models/Product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    tableName: 'products',
    underscored: true
  });

  Product.associate = (models) => {
    Product.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'seller'
    });
  };

  return Product;
};
```

#### 2.3 Create Controller
```javascript
// controllers/productController.js
const { Product, User } = require('../models');

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'username', 'avatar']
      }]
    });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: { message: error.message } 
    });
  }
};
```

#### 2.4 Create Routes with Swagger Documentation
```javascript
// routes/productRoutes.js
const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const productController = require('../controllers/productController');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', protect, productController.createProduct);

module.exports = router;
```

### Step 3: Frontend Implementation

#### 3.1 Create API Hook
```javascript
// hooks/api/useProducts.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

export const useProducts = () => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data.data;
    }
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData) => {
      const response = await api.post('/products', productData);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
    }
  });

  return {
    products: productsQuery.data || [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    createProduct: createProductMutation.mutate,
    isCreating: createProductMutation.isPending
  };
};
```

#### 3.2 Create Page Component
```javascript
// pages/ProductsPage.js
import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Plus } from 'lucide-react';
import { useProducts } from '../hooks/api/useProducts';
import BaseCard from '../components/common/BaseCard';
import LoadingIndicator from '../components/common/LoadingIndicator';
import EmptyState from '../components/common/EmptyState';
import ProductModal from '../components/products/ProductModal';

const ProductsPage = () => {
  const { products, isLoading, error } = useProducts();
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (isLoading) return <LoadingIndicator fullPage />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Beekeeping Products</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={16} className="me-2" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          message="Be the first to list a beekeeping product"
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              Add Product
            </Button>
          }
        />
      ) : (
        <Row>
          {products.map(product => (
            <Col key={product.id} md={4} className="mb-4">
              <BaseCard
                title={product.name}
                subtitle={`$${product.price}`}
                content={`Sold by ${product.seller.username}`}
                image={product.image}
                to={`/products/${product.id}`}
                hoverable
              />
            </Col>
          ))}
        </Row>
      )}

      <ProductModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
      />
    </Container>
  );
};

export default ProductsPage;
```

#### 3.3 Add Route
```javascript
// App.js
import ProductsPage from './pages/ProductsPage';

// In routes
<Route path="/products" element={<ProductsPage />} />
```

## API Integration Patterns

### Using Custom Hooks

Always use custom hooks for API calls instead of direct axios usage:

```javascript
// ✅ Good
import { useArticles } from '../hooks/api/useArticles';

const MyComponent = () => {
  const { articles, isLoading, createArticle } = useArticles();
  // Use the data
};

// ❌ Bad
import axios from 'axios';

const MyComponent = () => {
  const [articles, setArticles] = useState([]);
  
  useEffect(() => {
    axios.get('/api/articles').then(res => setArticles(res.data));
  }, []);
};
```

### Query Invalidation

Ensure data stays fresh after mutations:

```javascript
const createProductMutation = useMutation({
  mutationFn: createProduct,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries(['products']);
    // Or update cache directly
    queryClient.setQueryData(['products'], old => [...old, newProduct]);
  }
});
```

## Form Handling

### Using useFormValidation Hook

```javascript
import { useFormValidation } from '../hooks/useFormValidation';
import FormField from '../components/common/FormField';

const ProductForm = () => {
  const validationRules = {
    name: {
      required: 'Product name is required',
      minLength: { value: 3, message: 'Name must be at least 3 characters' }
    },
    price: {
      required: 'Price is required',
      min: { value: 0.01, message: 'Price must be greater than 0' }
    }
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting
  } = useFormValidation({
    initialValues: { name: '', price: '' },
    validationRules,
    onSubmit: async (values) => {
      await createProduct(values);
    }
  });

  return (
    <Form onSubmit={handleSubmit}>
      <FormField
        label="Product Name"
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name && errors.name}
        required
      />
      
      <FormField
        label="Price"
        name="price"
        type="number"
        step="0.01"
        value={values.price}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.price && errors.price}
        required
      />
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Product'}
      </Button>
    </Form>
  );
};
```

## Error Handling

### Using useErrorDisplay Hook

```javascript
import { useErrorDisplay } from '../hooks/useErrorDisplay';
import ErrorAlert from '../components/common/ErrorAlert';

const ProductsPage = () => {
  const { error, showError, clearError } = useErrorDisplay();
  const { products, isLoading } = useProducts({
    onError: showError
  });

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
    } catch (err) {
      showError(err, {
        title: 'Failed to delete product',
        actions: [
          { label: 'Retry', onClick: () => handleDelete(id) },
          { label: 'Cancel', onClick: clearError }
        ]
      });
    }
  };

  return (
    <>
      {error && <ErrorAlert error={error} onDismiss={clearError} />}
      {/* Rest of component */}
    </>
  );
};
```

## Breadcrumb System

### Setting Dynamic Breadcrumbs

For pages with dynamic content, use the `useDynamicBreadcrumb` hook:

```javascript
import { useDynamicBreadcrumb } from '../hooks/useDynamicBreadcrumb';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { product, isLoading } = useProduct(id);

  // Set breadcrumb when product loads
  useDynamicBreadcrumb(
    product ? { title: product.name } : null,
    [product?.name]
  );

  return (
    // Component content
  );
};
```

### Customizing Breadcrumb Structure

For complex hierarchies, you can pass additional context:

```javascript
useDynamicBreadcrumb({
  title: product.name,
  category: product.category,
  customPath: [
    { label: 'Marketplace', path: '/marketplace' },
    { label: product.category.name, path: `/marketplace/${product.category.slug}` }
  ]
}, [product]);
```

## Best Practices

### 1. Component Organization
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic into custom hooks
- Co-locate related files (component + styles + tests)

### 2. State Management
- Use React Query for server state
- Use Context API sparingly for truly global state
- Keep component state local when possible
- Avoid prop drilling with composition

### 3. Performance
- Use React.memo for expensive components
- Implement lazy loading for routes
- Optimize images with responsive sizes
- Use pagination for large lists
- Implement virtual scrolling for very long lists

### 4. Accessibility
- Use semantic HTML elements
- Add proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers
- Maintain proper color contrast

### 5. Testing
- Write unit tests for utilities and hooks
- Use React Testing Library for components
- Test user interactions, not implementation
- Mock API calls in tests
- Aim for 80% coverage

### 6. Code Style
- Follow existing patterns in the codebase
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Use TypeScript types (when migrating)

## Example: Building a Product Marketplace Feature

Let's walk through building a complete marketplace feature:

### 1. Planning
- **Pages**: Product list, product detail, create/edit product
- **Components**: ProductCard, ProductForm, ProductFilters
- **API**: CRUD operations for products
- **Permissions**: Any user can view, authenticated users can create

### 2. Backend Setup

Create migration, model, controller, and routes as shown above.

### 3. Frontend Components

#### ProductCard Component
```javascript
// components/products/ProductCard.js
import React from 'react';
import BaseCard from '../common/BaseCard';
import StatusBadge from '../common/StatusBadge';

const ProductCard = ({ product }) => {
  return (
    <BaseCard
      title={product.name}
      subtitle={`$${product.price}`}
      image={product.images?.[0]?.url}
      imagePosition="top"
      badges={[
        product.featured && { text: 'Featured', variant: 'primary' },
        product.isNew && { text: 'New', variant: 'success' }
      ].filter(Boolean)}
      footer={
        <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">By {product.seller.username}</small>
          <StatusBadge status={product.status} size="sm" />
        </div>
      }
      to={`/products/${product.slug}`}
      hoverable
    />
  );
};

export default ProductCard;
```

#### Product List with Filters
```javascript
// pages/ProductsPage.js
import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useProducts } from '../hooks/api/useProducts';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import LoadingIndicator from '../components/common/LoadingIndicator';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/ui/Pagination';

const ProductsPage = () => {
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    sortBy: 'newest'
  });
  
  const [page, setPage] = useState(1);
  
  const { 
    products, 
    totalPages, 
    isLoading, 
    error 
  } = useProducts({ 
    filters, 
    page, 
    limit: 12 
  });

  if (error) {
    return (
      <EmptyState
        variant="error"
        title="Failed to load products"
        message={error.message}
        action={
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Beekeeping Marketplace</h1>
      
      <Row>
        <Col lg={3}>
          <ProductFilters 
            filters={filters}
            onChange={setFilters}
          />
        </Col>
        
        <Col lg={9}>
          {isLoading ? (
            <LoadingIndicator type="skeleton" rows={3} cols={3} />
          ) : products.length === 0 ? (
            <EmptyState
              title="No products found"
              message="Try adjusting your filters"
              action={
                <Button 
                  variant="outline-primary"
                  onClick={() => setFilters({})}
                >
                  Clear Filters
                </Button>
              }
            />
          ) : (
            <>
              <Row>
                {products.map(product => (
                  <Col key={product.id} md={6} lg={4} className="mb-4">
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
              
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ProductsPage;
```

### 4. Integration Tips

1. **Start with the API**: Build and test backend endpoints first
2. **Use Storybook**: Develop components in isolation
3. **Test as you go**: Write tests alongside features
4. **Get feedback early**: Deploy to staging frequently
5. **Document as you build**: Update this guide with new patterns

## Conclusion

This guide provides the foundation for building features in the Beekeeping Hub application. Remember to:

1. Follow established patterns
2. Reuse common components
3. Keep code clean and maintainable
4. Test thoroughly
5. Document your work

For specific questions or to contribute improvements to this guide, please reach out to the development team or submit a pull request.

## Quick Reference

### Common Imports
```javascript
// Components
import BaseCard from '../components/common/BaseCard';
import BaseModal from '../components/common/BaseModal';
import DataTable from '../components/common/DataTable';
import FormField from '../components/common/FormField';
import StatusBadge from '../components/common/StatusBadge';
import LoadingIndicator from '../components/common/LoadingIndicator';
import EmptyState from '../components/common/EmptyState';
import ErrorAlert from '../components/common/ErrorAlert';

// Hooks
import { useAuth } from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import { useFormValidation } from '../hooks/useFormValidation';
import { useErrorDisplay } from '../hooks/useErrorDisplay';
import { useDynamicBreadcrumb } from '../hooks/useDynamicBreadcrumb';

// API Hooks
import { useArticles } from '../hooks/api/useArticles';
import { useTags } from '../hooks/api/useTags';
import { useComments } from '../hooks/api/useComments';
```

### Common Patterns
```javascript
// Loading state
if (isLoading) return <LoadingIndicator fullPage />;

// Error state
if (error) return <ErrorAlert error={error} />;

// Empty state
if (data.length === 0) return <EmptyState title="No items" />;

// Protected route
<Route path="/admin" element={<RoleRoute allowedRoles={['admin']} />}>
  <Route index element={<AdminDashboard />} />
</Route>

// Form submission
const handleSubmit = async (values) => {
  try {
    await createItem(values);
    toast.success('Item created successfully');
    navigate('/items');
  } catch (error) {
    showError(error);
  }
};
```