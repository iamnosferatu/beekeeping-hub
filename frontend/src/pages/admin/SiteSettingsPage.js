// frontend/src/pages/admin/SiteSettingsPage.js
import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Alert,
  Row,
  Col,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  BsTools,
  BsBellFill,
  BsToggleOn,
  BsToggleOff,
  BsInfoCircle,
  BsExclamationTriangle,
  BsCheckCircle,
  BsXCircle,
} from "react-icons/bs";
import { useSiteSettings } from "../../contexts/SiteSettingsContext";
import moment from "moment";

/**
 * Site Settings Admin Page
 *
 * This page allows admins to manage site-wide settings including
 * maintenance mode and alert banners. Changes take effect immediately
 * across the entire site.
 */
const AdminSiteSettingsPage = () => {
  // Get site settings context
  const {
    settings,
    loading,
    updateSettings,
    toggleMaintenanceMode,
    toggleAlert,
  } = useSiteSettings();

  // Form state for maintenance settings
  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenance_title: "",
    maintenance_message: "",
    maintenance_estimated_time: "",
  });

  // Form state for alert settings
  const [alertForm, setAlertForm] = useState({
    alert_type: "info",
    alert_message: "",
    alert_dismissible: true,
    alert_link_text: "",
    alert_link_url: "",
  });

  // UI state
  const [saveStatus, setSaveStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with current settings when they load
  useEffect(() => {
    if (settings) {
      setMaintenanceForm({
        maintenance_title: settings.maintenance_title || "",
        maintenance_message: settings.maintenance_message || "",
        maintenance_estimated_time: settings.maintenance_estimated_time
          ? moment(settings.maintenance_estimated_time).format(
              "YYYY-MM-DDTHH:mm"
            )
          : "",
      });

      setAlertForm({
        alert_type: settings.alert_type || "info",
        alert_message: settings.alert_message || "",
        alert_dismissible: settings.alert_dismissible !== false,
        alert_link_text: settings.alert_link_text || "",
        alert_link_url: settings.alert_link_url || "",
      });
    }
  }, [settings]);

  /**
   * Handle maintenance settings save
   */
  const handleSaveMaintenanceSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const result = await updateSettings({
      ...maintenanceForm,
      maintenance_estimated_time:
        maintenanceForm.maintenance_estimated_time || null,
    });

    setIsSaving(false);
    setSaveStatus({
      type: result.success ? "success" : "danger",
      message: result.success
        ? "Maintenance settings saved successfully!"
        : result.error || "Failed to save maintenance settings",
    });

    // Clear status after 5 seconds
    setTimeout(() => setSaveStatus(null), 5000);
  };

  /**
   * Handle alert settings save
   */
  const handleSaveAlertSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const result = await updateSettings({
      ...alertForm,
      alert_link_text: alertForm.alert_link_text || null,
      alert_link_url: alertForm.alert_link_url || null,
    });

    setIsSaving(false);
    setSaveStatus({
      type: result.success ? "success" : "danger",
      message: result.success
        ? "Alert settings saved successfully!"
        : result.error || "Failed to save alert settings",
    });

    // Clear status after 5 seconds
    setTimeout(() => setSaveStatus(null), 5000);
  };

  /**
   * Handle quick toggle for maintenance mode
   */
  const handleToggleMaintenance = async () => {
    const result = await toggleMaintenanceMode();

    if (!result.success) {
      setSaveStatus({
        type: "danger",
        message: result.error || "Failed to toggle maintenance mode",
      });
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  /**
   * Handle quick toggle for alert
   */
  const handleToggleAlert = async () => {
    const result = await toggleAlert();

    if (!result.success) {
      setSaveStatus({
        type: "danger",
        message: result.error || "Failed to toggle alert",
      });
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  // Get alert type icon
  const getAlertIcon = (type) => {
    switch (type) {
      case "info":
        return <BsInfoCircle />;
      case "warning":
        return <BsExclamationTriangle />;
      case "success":
        return <BsCheckCircle />;
      case "danger":
        return <BsXCircle />;
      default:
        return <BsInfoCircle />;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading site settings...</p>
      </div>
    );
  }

  return (
    <div className="site-settings-page">
      <h1 className="mb-4">Site Settings</h1>

      {/* Save status alert */}
      {saveStatus && (
        <Alert
          variant={saveStatus.type}
          dismissible
          onClose={() => setSaveStatus(null)}
        >
          {saveStatus.message}
        </Alert>
      )}

      {/* Maintenance Mode Settings */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <BsTools className="me-2" size={20} />
            <h5 className="mb-0">Maintenance Mode</h5>
          </div>
          <div className="d-flex align-items-center">
            <Badge
              bg={settings.maintenance_mode ? "danger" : "success"}
              className="me-3"
            >
              {settings.maintenance_mode ? "ACTIVE" : "INACTIVE"}
            </Badge>
            <Button
              variant={settings.maintenance_mode ? "danger" : "success"}
              size="sm"
              onClick={handleToggleMaintenance}
              className="d-flex align-items-center"
            >
              {settings.maintenance_mode ? (
                <>
                  <BsToggleOn size={20} className="me-2" />
                  Disable
                </>
              ) : (
                <>
                  <BsToggleOff size={20} className="me-2" />
                  Enable
                </>
              )}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Maintenance Title */}
            <Form.Group className="mb-3">
              <Form.Label>Maintenance Title</Form.Label>
              <Form.Control
                type="text"
                value={maintenanceForm.maintenance_title}
                onChange={(e) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    maintenance_title: e.target.value,
                  })
                }
                placeholder="Site Under Maintenance"
              />
              <Form.Text className="text-muted">
                This title will be displayed prominently on the maintenance
                page.
              </Form.Text>
            </Form.Group>

            {/* Maintenance Message */}
            <Form.Group className="mb-3">
              <Form.Label>Maintenance Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={maintenanceForm.maintenance_message}
                onChange={(e) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    maintenance_message: e.target.value,
                  })
                }
                placeholder="We're currently performing scheduled maintenance..."
              />
              <Form.Text className="text-muted">
                Explain to users why the site is down and when they can expect
                it to be back.
              </Form.Text>
            </Form.Group>

            {/* Estimated Completion Time */}
            <Form.Group className="mb-4">
              <Form.Label>Estimated Completion Time (Optional)</Form.Label>
              <Form.Control
                type="datetime-local"
                value={maintenanceForm.maintenance_estimated_time}
                onChange={(e) =>
                  setMaintenanceForm({
                    ...maintenanceForm,
                    maintenance_estimated_time: e.target.value,
                  })
                }
              />
              <Form.Text className="text-muted">
                If provided, this will show users when they can expect the site
                to be back online.
              </Form.Text>
            </Form.Group>

            {/* Save Button */}
            <Button
              variant="primary"
              onClick={handleSaveMaintenanceSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                "Save Maintenance Settings"
              )}
            </Button>
          </Form>

          {/* Warning message when maintenance is active */}
          {settings.maintenance_mode && (
            <Alert variant="warning" className="mt-3">
              <BsExclamationTriangle className="me-2" />
              <strong>Maintenance mode is active!</strong> Regular users cannot
              access the site. Only admins can bypass maintenance mode.
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Alert Banner Settings */}
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <BsBellFill className="me-2" size={20} />
            <h5 className="mb-0">Alert Banner</h5>
          </div>
          <div className="d-flex align-items-center">
            <Badge
              bg={settings.alert_enabled ? "success" : "secondary"}
              className="me-3"
            >
              {settings.alert_enabled ? "VISIBLE" : "HIDDEN"}
            </Badge>
            <Button
              variant={settings.alert_enabled ? "secondary" : "success"}
              size="sm"
              onClick={handleToggleAlert}
              disabled={!alertForm.alert_message}
              className="d-flex align-items-center"
            >
              {settings.alert_enabled ? (
                <>
                  <BsToggleOn size={20} className="me-2" />
                  Hide
                </>
              ) : (
                <>
                  <BsToggleOff size={20} className="me-2" />
                  Show
                </>
              )}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row>
              {/* Alert Type */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Alert Type</Form.Label>
                  <Form.Select
                    value={alertForm.alert_type}
                    onChange={(e) =>
                      setAlertForm({ ...alertForm, alert_type: e.target.value })
                    }
                  >
                    <option value="info">Info (Blue)</option>
                    <option value="warning">Warning (Yellow)</option>
                    <option value="success">Success (Green)</option>
                    <option value="danger">Danger (Red)</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Choose the visual style based on the importance of your
                    message.
                  </Form.Text>
                </Form.Group>
              </Col>

              {/* Dismissible Option */}
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Allow Dismissal</Form.Label>
                  <Form.Check
                    type="switch"
                    id="alert-dismissible"
                    label="Users can dismiss this alert"
                    checked={alertForm.alert_dismissible}
                    onChange={(e) =>
                      setAlertForm({
                        ...alertForm,
                        alert_dismissible: e.target.checked,
                      })
                    }
                  />
                  <Form.Text className="text-muted">
                    If enabled, users can close the alert and it won't appear
                    again.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Alert Message */}
            <Form.Group className="mb-3">
              <Form.Label>Alert Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={alertForm.alert_message}
                onChange={(e) =>
                  setAlertForm({ ...alertForm, alert_message: e.target.value })
                }
                placeholder="Enter your alert message here..."
              />
              <Form.Text className="text-muted">
                This message will be displayed at the top of every page when the
                alert is enabled.
              </Form.Text>
            </Form.Group>

            {/* Optional Link */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Link Text (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={alertForm.alert_link_text}
                    onChange={(e) =>
                      setAlertForm({
                        ...alertForm,
                        alert_link_text: e.target.value,
                      })
                    }
                    placeholder="Learn more"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Link URL (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    value={alertForm.alert_link_url}
                    onChange={(e) =>
                      setAlertForm({
                        ...alertForm,
                        alert_link_url: e.target.value,
                      })
                    }
                    placeholder="/articles/important-update or https://example.com"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Alert Preview */}
            {alertForm.alert_message && (
              <div className="mb-4">
                <Form.Label>Preview:</Form.Label>
                <Alert
                  variant={alertForm.alert_type}
                  dismissible={alertForm.alert_dismissible}
                >
                  <div className="d-flex align-items-center">
                    {getAlertIcon(alertForm.alert_type)}
                    <span className="ms-2">{alertForm.alert_message}</span>
                    {alertForm.alert_link_text && alertForm.alert_link_url && (
                      <a
                        href="#"
                        className="alert-link ms-2 fw-bold"
                        onClick={(e) => e.preventDefault()}
                      >
                        {alertForm.alert_link_text}
                      </a>
                    )}
                  </div>
                </Alert>
              </div>
            )}

            {/* Save Button */}
            <Button
              variant="primary"
              onClick={handleSaveAlertSettings}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                "Save Alert Settings"
              )}
            </Button>
          </Form>

          {/* Info message when alert is active */}
          {settings.alert_enabled && (
            <Alert variant="info" className="mt-3">
              <BsInfoCircle className="me-2" />
              The alert banner is currently visible to all users at the top of
              every page.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminSiteSettingsPage;
