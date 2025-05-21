// frontend/src/pages/MyArticlesPage.js
import React from "react";
import { Alert, Card } from "react-bootstrap";

const MyArticlesPage = () => {
  return (
    <div className="my-articles-page">
      <h1 className="mb-4">My Articles</h1>

      <Card className="mb-4">
        <Card.Body>
          <Alert variant="info">
            <p>
              This is a placeholder for the author's articles management page.
            </p>
            <p>
              The actual implementation will include a list of the author's
              articles and management options.
            </p>
          </Alert>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MyArticlesPage;
