// frontend/src/components/MaintenanceMode.js
import React from "react";
import { Container, Card, Alert } from "react-bootstrap";
import { BsTools, BsClock } from "react-icons/bs";
import "./MaintenanceMode.scss";

/**
 * Maintenance Mode Component
 * 
 * Displays when the site is in maintenance mode.
 * Only admins can bypass this screen.
 */
const MaintenanceMode = ({ settings }) => {
  const {
    maintenance_title = "Site Under Maintenance",
    maintenance_message = "We're currently performing scheduled maintenance. We'll be back online shortly.",
    maintenance_estimated_time
  } = settings;

  return (
    <div className="maintenance-mode-page">
      <Container>
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <Card className="maintenance-card shadow-lg" style={{ maxWidth: "600px" }}>
            <Card.Body className="text-center p-5">
              <div className="maintenance-icon mb-4">
                <BsTools size={60} className="text-warning" />
              </div>
              
              <h1 className="display-5 mb-4">{maintenance_title}</h1>
              
              <p className="lead text-muted mb-4">
                {maintenance_message}
              </p>
              
              {maintenance_estimated_time && (
                <Alert variant="info" className="d-inline-flex align-items-center">
                  <BsClock className="me-2" />
                  Estimated completion: {maintenance_estimated_time}
                </Alert>
              )}
              
              <hr className="my-4" />
              
              <p className="text-muted small">
                We apologize for any inconvenience. If you have urgent matters, 
                please contact us at support@beekeepinghub.com
              </p>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default MaintenanceMode;