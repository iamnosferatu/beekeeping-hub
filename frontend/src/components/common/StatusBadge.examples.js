/**
 * StatusBadge Usage Examples
 * This file demonstrates various ways to use the StatusBadge component
 */

import React from 'react';
import StatusBadge, { StatusTypes, StatusValues } from './StatusBadge';

// Example 1: Article Status Examples
export const ArticleStatusExamples = () => (
  <div>
    <h5>Article Statuses</h5>
    <div className="d-flex gap-2 flex-wrap">
      <StatusBadge status="published" type={StatusTypes.ARTICLE} />
      <StatusBadge status="draft" type={StatusTypes.ARTICLE} />
      <StatusBadge status="blocked" type={StatusTypes.ARTICLE} />
      <StatusBadge status="archived" type={StatusTypes.ARTICLE} />
    </div>
  </div>
);

// Example 2: Comment Status Examples
export const CommentStatusExamples = () => (
  <div>
    <h5>Comment Statuses</h5>
    <div className="d-flex gap-2 flex-wrap">
      <StatusBadge status="approved" type={StatusTypes.COMMENT} />
      <StatusBadge status="pending" type={StatusTypes.COMMENT} />
      <StatusBadge status="rejected" type={StatusTypes.COMMENT} />
      <StatusBadge status="reported" type={StatusTypes.COMMENT} />
    </div>
  </div>
);

// Example 3: User Role Examples
export const UserRoleExamples = () => (
  <div>
    <h5>User Roles</h5>
    <div className="d-flex gap-2 flex-wrap">
      <StatusBadge status="admin" type={StatusTypes.ROLE} />
      <StatusBadge status="author" type={StatusTypes.ROLE} />
      <StatusBadge status="user" type={StatusTypes.ROLE} />
    </div>
  </div>
);

// Example 4: Size Variations
export const SizeExamples = () => (
  <div>
    <h5>Size Variations</h5>
    <div className="d-flex gap-2 align-items-center">
      <StatusBadge status="published" type={StatusTypes.ARTICLE} size="sm" />
      <StatusBadge status="published" type={StatusTypes.ARTICLE} size="md" />
      <StatusBadge status="published" type={StatusTypes.ARTICLE} size="lg" />
    </div>
  </div>
);

// Example 5: Without Icons
export const NoIconExamples = () => (
  <div>
    <h5>Without Icons</h5>
    <div className="d-flex gap-2 flex-wrap">
      <StatusBadge status="published" type={StatusTypes.ARTICLE} showIcon={false} />
      <StatusBadge status="admin" type={StatusTypes.ROLE} showIcon={false} />
      <StatusBadge status="pending" type={StatusTypes.COMMENT} showIcon={false} />
    </div>
  </div>
);

// Example 6: Custom Configuration
export const CustomConfigExamples = () => (
  <div>
    <h5>Custom Configurations</h5>
    <div className="d-flex gap-2 flex-wrap">
      <StatusBadge 
        status="featured"
        customConfig={{
          variant: 'warning',
          icon: <span>⭐</span>,
          text: 'Featured'
        }}
      />
      <StatusBadge 
        status="hot"
        customConfig={{
          variant: 'danger',
          icon: <span>🔥</span>,
          text: 'Hot Topic'
        }}
      />
      <StatusBadge 
        status="new"
        customConfig={{
          variant: 'info',
          icon: <span>✨</span>,
          text: 'New'
        }}
      />
    </div>
  </div>
);

// Example 7: In Table Usage
export const TableUsageExample = () => (
  <table className="table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Status</th>
        <th>Author Role</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Introduction to Beekeeping</td>
        <td>
          <StatusBadge status="published" type={StatusTypes.ARTICLE} />
        </td>
        <td>
          <StatusBadge status="author" type={StatusTypes.ROLE} />
        </td>
      </tr>
      <tr>
        <td>Hive Maintenance Tips</td>
        <td>
          <StatusBadge status="draft" type={StatusTypes.ARTICLE} />
        </td>
        <td>
          <StatusBadge status="admin" type={StatusTypes.ROLE} />
        </td>
      </tr>
    </tbody>
  </table>
);

// Example 8: Migration from old Badge usage
/*
BEFORE:
```javascript
const getStatusBadge = (article) => {
  if (article.blocked) return { variant: "danger", text: "Blocked" };
  if (article.status === "published") return { variant: "success", text: "Published" };
  if (article.status === "draft") return { variant: "secondary", text: "Draft" };
  return { variant: "warning", text: article.status };
};

// Usage
<Badge bg={getStatusBadge(article).variant}>
  {getStatusBadge(article).text}
</Badge>
```

AFTER:
```javascript
const getArticleStatus = (article) => {
  if (article.blocked) return 'blocked';
  return article.status;
};

// Usage
<StatusBadge 
  status={getArticleStatus(article)} 
  type={StatusTypes.ARTICLE}
/>
```
*/

// Example 9: Complete Component Example
export const CompleteExample = () => {
  const articles = [
    { id: 1, title: 'Article 1', status: 'published', blocked: false },
    { id: 2, title: 'Article 2', status: 'draft', blocked: false },
    { id: 3, title: 'Article 3', status: 'published', blocked: true },
  ];

  const comments = [
    { id: 1, content: 'Great article!', status: 'approved' },
    { id: 2, content: 'Needs review', status: 'pending' },
    { id: 3, content: 'Spam content', status: 'rejected' },
  ];

  const users = [
    { id: 1, username: 'admin123', role: 'admin' },
    { id: 2, username: 'author456', role: 'author' },
    { id: 3, username: 'reader789', role: 'user' },
  ];

  return (
    <div>
      <h4>Articles</h4>
      {articles.map(article => (
        <div key={article.id} className="mb-2">
          {article.title}: 
          <StatusBadge 
            status={article.blocked ? 'blocked' : article.status} 
            type={StatusTypes.ARTICLE}
            className="ms-2"
          />
        </div>
      ))}

      <h4 className="mt-4">Comments</h4>
      {comments.map(comment => (
        <div key={comment.id} className="mb-2">
          {comment.content}: 
          <StatusBadge 
            status={comment.status} 
            type={StatusTypes.COMMENT}
            className="ms-2"
          />
        </div>
      ))}

      <h4 className="mt-4">Users</h4>
      {users.map(user => (
        <div key={user.id} className="mb-2">
          {user.username}: 
          <StatusBadge 
            status={user.role} 
            type={StatusTypes.ROLE}
            className="ms-2"
          />
        </div>
      ))}
    </div>
  );
};