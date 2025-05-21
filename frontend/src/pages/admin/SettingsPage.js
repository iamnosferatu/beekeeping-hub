// frontend/src/pages/admin/SettingsPage.js
import React from "react";
import { Alert, Card } from "react-bootstrap";

const SettingsPage = () => {
  return (
    <div className="admin-settings-page">
      <h1 className="mb-4">Site Settings</h1>

      <Card className="mb-4">
        <Card.Body>
          <Alert variant="info">
            <p>This is a placeholder for the admin settings page.</p>
            <p>
              The actual implementation will include various site-wide settings.
            </p>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SettingsPage;
