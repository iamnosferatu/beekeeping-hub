// frontend/src/components/common/AlertBanner.js
import React from "react";
import { Alert, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSiteSettings } from "../../contexts/SiteSettingsContext";

/**
 * Alert Banner Component
 *
 * This component displays a site-wide alert banner at the top of the page.
 * It's controlled by the site settings and can be dismissed by users
 * if the admin has enabled that option.
 */
const AlertBanner = () => {
  const { settings, shouldShowAlert, dismissAlert } = useSiteSettings();

  // Don't render if alert shouldn't be shown
  if (!shouldShowAlert) {
    return null;
  }

  const {
    alert_type = "info",
    alert_message = "",
    alert_dismissible = true,
    alert_link_text,
    alert_link_url,
  } = settings;

  return (
    <div className="alert-banner-wrapper">
      <Container fluid className="p-0">
        <Alert
          variant={alert_type}
          dismissible={alert_dismissible}
          onClose={dismissAlert}
          className="mb-0 rounded-0 text-center"
        >
          <div className="d-flex align-items-center justify-content-center flex-wrap">
            {/* Alert message */}
            <span className="me-2">{alert_message}</span>

            {/* Optional link */}
            {alert_link_text && alert_link_url && (
              <>
                {alert_link_url.startsWith("http") ? (
                  <a
                    href={alert_link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="alert-link fw-bold"
                  >
                    {alert_link_text}
                  </a>
                ) : (
                  <Link to={alert_link_url} className="alert-link fw-bold">
                    {alert_link_text}
                  </Link>
                )}
              </>
            )}
          </div>
        </Alert>
      </Container>
    </div>
  );
};

export default AlertBanner;
