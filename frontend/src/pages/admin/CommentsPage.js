// frontend/src/pages/admin/CommentsPage.js
import React from "react";
import { Alert, Card } from "react-bootstrap";

const CommentsPage = () => {
  return (
    <div className="admin-comments-page">
      <h1 className="mb-4">Manage Comments</h1>

      <Card className="mb-4">
        <Card.Body>
          <Alert variant="info">
            <p>This is a placeholder for the admin comments management page.</p>
            <p>
              The actual implementation will include a list of all comments with
              moderation options.
            </p>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CommentsPage;
