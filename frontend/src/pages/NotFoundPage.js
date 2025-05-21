// frontend/src/pages/NotFoundPage.js
import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";

const NotFoundPage = () => {
  return (
    <Container className="not-found-page text-center py-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-5">
            Oops! The page you are looking for might have been removed, had its
            name changed, or is temporarily unavailable.
          </p>

          <div>
            <Link to="/">
              <Button variant="primary" size="lg" className="me-3">
                Go Home
              </Button>
            </Link>
            <Link to="/articles">
              <Button variant="outline-primary" size="lg">
                Browse Articles
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
