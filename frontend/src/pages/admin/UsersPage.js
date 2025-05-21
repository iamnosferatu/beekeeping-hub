// frontend/src/pages/admin/UsersPage.js
import React from "react";
import { Alert, Card } from "react-bootstrap";

const UsersPage = () => {
  return (
    <div className="admin-users-page">
      <h1 className="mb-4">Manage Users</h1>

      <Card className="mb-4">
        <Card.Body>
          <Alert variant="info">
            <p>This is a placeholder for the admin users management page.</p>
            <p>
              The actual implementation will include a list of all users with
              management options.
            </p>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UsersPage;
