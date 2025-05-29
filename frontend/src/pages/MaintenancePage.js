// frontend/src/pages/MaintenancePage.js
import React from "react";
import { Card, Container } from "react-bootstrap";
import { BsTools, BsClock } from "react-icons/bs";
import moment from "moment";

/**
 * Maintenance Page Component
 *
 * This page is displayed when the site is in maintenance mode.
 * It shows a friendly message to users and displays the estimated
 * completion time if provided by the admin.
 */
const MaintenancePage = ({ settings }) => {
  // Extract maintenance settings with defaults
  const {
    maintenance_title = "Site Under Maintenance",
    maintenance_message = "We're currently performing scheduled maintenance. We'll be back online shortly.",
    maintenance_estimated_time,
  } = settings || {};

  return (
    <div className="maintenance-page min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Container>
        <Card
          className="shadow-lg border-0 mx-auto"
          style={{ maxWidth: "600px" }}
        >
          <Card.Body className="text-center p-5">
            {/* Maintenance Icon */}
            <div className="mb-4">
              <BsTools
                size={80}
                className="text-warning animate-pulse"
                style={{
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
            </div>

            {/* Title */}
            <h1 className="h2 mb-4 text-dark">{maintenance_title}</h1>

            {/* Message */}
            <p className="lead text-muted mb-4">{maintenance_message}</p>

            {/* Estimated Time */}
            {maintenance_estimated_time && (
              <div className="mt-4 p-3 bg-light rounded">
                <div className="d-flex align-items-center justify-content-center text-muted">
                  <BsClock className="me-2" size={20} />
                  <span>
                    Estimated completion:{" "}
                    <strong>
                      {moment(maintenance_estimated_time).format(
                        "MMMM D, YYYY at h:mm A"
                      )}
                    </strong>
                  </span>
                </div>
                <small className="text-muted mt-2 d-block">
                  ({moment(maintenance_estimated_time).fromNow()})
                </small>
              </div>
            )}

            {/* Additional Info */}
            <div className="mt-5">
              <p className="text-muted small mb-0">
                We apologize for any inconvenience. If you need immediate
                assistance, please contact our support team.
              </p>
            </div>
          </Card.Body>

          {/* Bottom decorative element */}
          <div className="bg-warning" style={{ height: "5px" }} />
        </Card>
      </Container>

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage;
