/**
 * DataTable Usage Examples
 * This file demonstrates how to use the DataTable component to replace existing admin tables
 */

import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import StatusBadge, { StatusTypes } from './StatusBadge';
import { Button } from 'react-bootstrap';
import { 
  BsEye, 
  BsPencilSquare, 
  BsTrash, 
  BsShieldX,
  BsFilter,
  BsPersonFill
} from 'react-icons/bs';
import moment from 'moment';

// Example 1: Articles Table (Replacing ArticlesPage table)
export const ArticlesTableExample = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Column configuration for articles
  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      style: { width: '80px' }
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (article) => (
        <div>
          <strong>{article.title}</strong>
          {article.featured_image && (
            <div className="text-muted small">Has featured image</div>
          )}
        </div>
      )
    },
    {
      key: 'author.username',
      label: 'Author',
      render: (article) => article.author?.username || 'Unknown'
    },
    {
      key: 'status',
      label: 'Status',
      render: (article) => (
        <StatusBadge 
          status={article.blocked ? 'blocked' : article.status} 
          type={StatusTypes.ARTICLE}
        />
      )
    },
    {
      key: 'published_at',
      label: 'Published',
      sortable: true,
      render: (article) => article.published_at 
        ? moment(article.published_at).format('MMM D, YYYY')
        : '-'
    },
    {
      key: 'view_count',
      label: 'Views',
      render: (article) => article.view_count || 0,
      className: 'text-center'
    }
  ];

  // Filter configuration
  const filters = [
    {
      key: 'status',
      value: statusFilter,
      placeholder: 'All Articles',
      icon: <BsFilter />,
      options: [
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' },
        { value: 'blocked', label: 'Blocked' }
      ]
    }
  ];

  // Action configuration
  const actions = [
    {
      key: 'view',
      label: 'View',
      icon: <BsEye />,
      variant: 'outline-primary'
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <BsPencilSquare />,
      variant: 'outline-secondary'
    },
    {
      key: 'block',
      label: 'Block/Unblock',
      icon: <BsShieldX />,
      variant: 'outline-warning',
      disabled: (article) => false // Add your logic
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <BsTrash />,
      variant: 'outline-danger'
    }
  ];

  const handleAction = (action, article) => {
    switch (action) {
      case 'view':
        window.location.href = `/articles/${article.slug}`;
        break;
      case 'edit':
        window.location.href = `/editor/${article.id}`;
        break;
      case 'delete':
        // Show delete modal
        break;
      // Handle other actions
    }
  };

  const handleFilterChange = (key, value) => {
    if (key === 'status') {
      setStatusFilter(value);
      setCurrentPage(1);
    }
  };

  return (
    <DataTable
      data={articles}
      columns={columns}
      loading={loading}
      error={error}
      onErrorDismiss={() => setError(null)}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Search articles..."
      filters={filters}
      onFilterChange={handleFilterChange}
      actions={actions}
      onAction={handleAction}
      emptyMessage="No articles found"
    />
  );
};

// Example 2: Users Table with Selection (Replacing UserTable component)
export const UsersTableExample = () => {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      style: { width: '60px' }
    },
    {
      key: 'user',
      label: 'User',
      render: (user) => (
        <div className="d-flex align-items-center">
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
            alt={user.username}
            className="rounded-circle me-2"
            width="40"
            height="40"
          />
          <div>
            <strong>{user.username}</strong>
            <div className="small text-muted">
              {user.first_name} {user.last_name}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (user) => (
        <a href={`mailto:${user.email}`}>{user.email}</a>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <StatusBadge status={user.role} type={StatusTypes.ROLE} />
      )
    },
    {
      key: 'article_count',
      label: 'Articles',
      sortable: true,
      render: (user) => user.article_count || 0
    },
    {
      key: 'created_at',
      label: 'Joined',
      sortable: true,
      render: (user) => moment(user.created_at).format('MMM D, YYYY')
    }
  ];

  const bulkActions = [
    {
      key: 'change_role',
      label: 'Change Role',
      variant: 'outline-primary',
      icon: <BsPersonFill />
    },
    {
      key: 'delete',
      label: 'Delete Selected',
      variant: 'outline-danger',
      icon: <BsTrash />
    }
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      selectable
      selectedItems={selectedUsers}
      onSelectionChange={setSelectedUsers}
      bulkActions={bulkActions}
      onBulkAction={(action, selectedIds) => {
        console.log('Bulk action:', action, selectedIds);
      }}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onSort={(column, order) => {
        setSortBy(column);
        setSortOrder(order);
      }}
    />
  );
};

// Example 3: Comments Table (Replacing CommentsPage table)
export const CommentsTableExample = () => {
  const columns = [
    {
      key: 'author',
      label: 'Author',
      render: (comment) => (
        <div className="d-flex align-items-center">
          <img
            src={comment.user?.avatar || '/default-avatar.png'}
            alt={comment.user?.username}
            className="rounded-circle me-2"
            width="32"
            height="32"
          />
          <div>
            <strong>{comment.user?.username || 'Guest'}</strong>
            <div className="small text-muted">{comment.user?.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'content',
      label: 'Comment',
      render: (comment) => (
        <div>
          <div className="text-truncate" style={{ maxWidth: '300px' }}>
            {comment.content}
          </div>
          <Button
            variant="link"
            size="sm"
            className="p-0"
            onClick={() => console.log('View full comment')}
          >
            View full comment
          </Button>
        </div>
      )
    },
    {
      key: 'article.title',
      label: 'Article',
      render: (comment) => comment.article ? (
        <a href={`/articles/${comment.article.slug}`}>
          {comment.article.title}
        </a>
      ) : (
        <span className="text-muted">Unknown</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (comment) => (
        <StatusBadge 
          status={comment.status || 'pending'}
          type={StatusTypes.COMMENT}
        />
      )
    },
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      render: (comment) => moment(comment.created_at).format('MMM D, YYYY')
    }
  ];

  return (
    <DataTable
      data={[]}
      columns={columns}
      showFilters={true}
      filters={[
        {
          key: 'status',
          value: 'all',
          placeholder: 'All Comments',
          options: [
            { value: 'approved', label: 'Approved' },
            { value: 'pending', label: 'Pending' },
            { value: 'rejected', label: 'Rejected' }
          ]
        }
      ]}
    />
  );
};

// Example 4: Custom Header and Footer
export const CustomDataTableExample = () => {
  const customHeader = (
    <div className="mb-3">
      <h5>Custom Header Content</h5>
      <p className="text-muted mb-0">You can add any content here</p>
    </div>
  );

  const customFooter = (
    <div className="d-flex justify-content-between align-items-center">
      <span className="text-muted">Showing 10 of 100 total items</span>
      <Button variant="primary" size="sm">Export Data</Button>
    </div>
  );

  return (
    <DataTable
      data={[]}
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' }
      ]}
      customHeader={customHeader}
      customFooter={customFooter}
      showSearch={false}
      showFilters={false}
    />
  );
};

// Example 5: Migration Guide from Old Table Implementation
/*
BEFORE (Old ArticlesPage implementation):
```javascript
// Lots of state management
const [articles, setArticles] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

// Complex table JSX
<Card>
  <Card.Body className="p-0">
    <div className="table-responsive">
      <Table hover className="mb-0">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Author</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map(article => (
            <tr key={article.id}>
              <td>{article.id}</td>
              <td>{article.title}</td>
              <td>{article.author?.username}</td>
              <td>
                <Badge bg={getStatusBadge(article).variant}>
                  {getStatusBadge(article).text}
                </Badge>
              </td>
              <td>
                <div className="d-flex justify-content-end gap-1">
                  <Button size="sm">View</Button>
                  <Button size="sm">Edit</Button>
                  <Button size="sm">Delete</Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  </Card.Body>
  
  {totalPages > 1 && (
    <Card.Footer>
      <Pagination>
        {/* Pagination logic */}
      </Pagination>
    </Card.Footer>
  )}
</Card>
```

AFTER (Using DataTable):
```javascript
// Simple configuration
const columns = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { 
    key: 'author.username', 
    label: 'Author',
    render: (article) => article.author?.username || 'Unknown'
  },
  { 
    key: 'status', 
    label: 'Status',
    render: (article) => <StatusBadge status={article.status} type={StatusTypes.ARTICLE} />
  }
];

const actions = [
  { key: 'view', label: 'View', icon: <BsEye /> },
  { key: 'edit', label: 'Edit', icon: <BsPencilSquare /> },
  { key: 'delete', label: 'Delete', icon: <BsTrash /> }
];

// Clean component usage
<DataTable
  data={articles}
  columns={columns}
  loading={loading}
  error={error}
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
  actions={actions}
  onAction={handleAction}
/>
```
*/