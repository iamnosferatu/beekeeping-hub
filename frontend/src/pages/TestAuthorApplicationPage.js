// frontend/src/pages/TestAuthorApplicationPage.js
import React, { useContext } from 'react';
import { Container, Card, Alert, Spinner } from 'react-bootstrap';
import { useMyAuthorApplication } from '../hooks/queries/useAuthorApplications';
import AuthContext from '../contexts/AuthContext';

const TestAuthorApplicationPage = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const { data: application, isLoading, error } = useMyAuthorApplication(isAuthenticated);

  if (!isAuthenticated) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Please log in to view application data</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" />
        <p>Loading application data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <h5>Error loading application</h5>
          <p>{error.message}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1>Author Application Test Page</h1>
      
      <Card className="mb-4">
        <Card.Header>
          <h5>Current User</h5>
        </Card.Header>
        <Card.Body>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5>Application Data</h5>
        </Card.Header>
        <Card.Body>
          {application ? (
            <>
              <Alert variant="info">
                Application found! Check the data structure below:
              </Alert>
              <pre>{JSON.stringify(application, null, 2)}</pre>
              
              <hr />
              
              <h6>Individual Fields:</h6>
              <ul>
                <li><strong>ID:</strong> {application.id || 'Not available'}</li>
                <li><strong>Status:</strong> {application.status || 'Not available'}</li>
                <li><strong>Application Text:</strong> {application.application_text ? `"${application.application_text.substring(0, 50)}..."` : 'Not available'}</li>
                <li><strong>Has application_text field:</strong> {'application_text' in application ? 'Yes' : 'No'}</li>
                <li><strong>Type of application_text:</strong> {typeof application.application_text}</li>
                <li><strong>Created At:</strong> {application.createdAt || 'Not available'}</li>
                <li><strong>Object Keys:</strong> {Object.keys(application).join(', ')}</li>
              </ul>
            </>
          ) : (
            <Alert variant="warning">No application data returned</Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TestAuthorApplicationPage;