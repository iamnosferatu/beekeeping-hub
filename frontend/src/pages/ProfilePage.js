// frontend/src/pages/ProfilePage.js
import React from "react";
import { Alert, Card } from "react-bootstrap";

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <h1 className="mb-4">My Profile</h1>

      <Card className="mb-4">
        <Card.Body>
          <Alert variant="info">
            <p>This is a placeholder for the user profile page.</p>
            <p>
              The actual implementation will include profile information and
              editing functionality.
            </p>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfilePage;
