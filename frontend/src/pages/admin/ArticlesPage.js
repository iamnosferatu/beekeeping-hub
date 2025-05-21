// frontend/src/pages/admin/ArticlesPage.js
import React from "react";
import { Alert, Card } from "react-bootstrap";

const ArticlesPage = () => {
  return (
    <div className="admin-articles-page">
      <h1 className="mb-4">Manage Articles</h1>

      <Card className="mb-4">
        <Card.Body>
          <Alert variant="info">
            <p>This is a placeholder for the admin articles management page.</p>
            <p>
              The actual implementation will include a list of all articles with
              management options.
            </p>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ArticlesPage;
