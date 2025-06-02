// frontend/src/components/common/CookieConsentBanner.js

import React, { useState, useEffect } from 'react';
import { 
  Alert, 
  Button, 
  Badge, 
  Row, 
  Col, 
  Form, 
  Modal, 
  Accordion,
  Card 
} from 'react-bootstrap';
import { 
  BsCookie, 
  BsGear, 
  BsCheckCircle, 
  BsXCircle, 
  BsInfoCircle 
} from 'react-icons/bs';
import { 
  shouldShowConsentBanner,
  saveCookieConsent,
  getCookieConsent,
  getCookieConfig,
  getConsentSummary,
  COOKIE_CATEGORIES,
  withdrawCookieConsent
} from '../../utils/cookieConsent';

/**
 * Cookie Consent Banner Component
 * 
 * GDPR/CCPA compliant cookie consent banner with granular controls
 * for different cookie categories and detailed privacy information.
 */
const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({});
  const [cookieConfig, setCookieConfig] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize component
  useEffect(() => {
    const initializeBanner = () => {
      setShowBanner(shouldShowConsentBanner());
      setCookieConfig(getCookieConfig());
      
      // Get existing consent or default preferences
      const existingConsent = getCookieConsent();
      if (existingConsent && existingConsent.categories) {
        setPreferences(existingConsent.categories);
      } else {
        // Set default preferences (necessary cookies only)
        const defaultPrefs = {};
        Object.entries(getCookieConfig()).forEach(([category, config]) => {
          defaultPrefs[category] = config.required;
        });
        setPreferences(defaultPrefs);
      }
      
      setIsInitialized(true);
    };

    initializeBanner();
  }, []);

  // Handle accept all cookies
  const handleAcceptAll = () => {
    const allConsent = {};
    Object.keys(cookieConfig).forEach(category => {
      allConsent[category] = true;
    });
    
    if (saveCookieConsent(allConsent)) {
      setShowBanner(false);
      setShowSettings(false);
    }
  };

  // Handle reject all non-necessary cookies
  const handleRejectAll = () => {
    const necessaryOnly = {};
    Object.entries(cookieConfig).forEach(([category, config]) => {
      necessaryOnly[category] = config.required;
    });
    
    if (saveCookieConsent(necessaryOnly)) {
      setShowBanner(false);
      setShowSettings(false);
    }
  };

  // Handle save custom preferences
  const handleSavePreferences = () => {
    if (saveCookieConsent(preferences)) {
      setShowBanner(false);
      setShowSettings(false);
    }
  };

  // Handle preference change
  const handlePreferenceChange = (category, value) => {
    // Necessary cookies cannot be disabled
    if (cookieConfig[category]?.required && !value) {
      return;
    }
    
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Get category description with cookie details
  const getCategoryDetails = (category, config) => {
    return (
      <div>
        <p className="mb-2">{config.description}</p>
        
        {config.purposes && config.purposes.length > 0 && (
          <div className="mb-2">
            <strong>Purposes:</strong>
            <div className="mt-1">
              {config.purposes.map((purpose, index) => (
                <Badge key={index} bg="secondary" className="me-1 mb-1">
                  {purpose.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {config.cookies && config.cookies.length > 0 && (
          <div>
            <strong>Cookies:</strong>
            <ul className="mt-1 mb-0 small">
              {config.cookies.map((cookie, index) => (
                <li key={index}>
                  <code>{cookie.name}</code> - {cookie.purpose} 
                  <span className="text-muted"> (Retention: {cookie.retention})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Cookie Settings Modal
  const renderSettingsModal = () => (
    <Modal show={showSettings} onHide={() => setShowSettings(false)} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          <BsGear className="me-2" />
          Cookie Preferences
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="info" className="mb-4">
          <BsInfoCircle className="me-2" />
          We use cookies to enhance your experience. You can choose which types of cookies to allow.
          Necessary cookies are required for the website to function and cannot be disabled.
        </Alert>

        <Accordion>
          {Object.entries(cookieConfig).map(([category, config]) => (
            <Accordion.Item key={category} eventKey={category}>
              <Accordion.Header>
                <div className="d-flex justify-content-between align-items-center w-100 me-3">
                  <div className="d-flex align-items-center">
                    <span className="me-2">{config.name}</span>
                    {config.required && (
                      <Badge bg="primary" className="me-2">Required</Badge>
                    )}
                  </div>
                  <Form.Check
                    type="switch"
                    checked={preferences[category] || false}
                    disabled={config.required}
                    onChange={(e) => handlePreferenceChange(category, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </Accordion.Header>
              <Accordion.Body>
                {getCategoryDetails(category, config)}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>

        <div className="mt-4">
          <h6>Privacy Information</h6>
          <p className="small text-muted">
            For more information about how we handle your data, please read our{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>{' '}
            and{' '}
            <a href="/cookie-policy" target="_blank" rel="noopener noreferrer">
              Cookie Policy
            </a>.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleRejectAll}>
          <BsXCircle className="me-1" />
          Reject All
        </Button>
        <Button variant="outline-primary" onClick={handleAcceptAll}>
          <BsCheckCircle className="me-1" />
          Accept All
        </Button>
        <Button variant="primary" onClick={handleSavePreferences}>
          Save Preferences
        </Button>
      </Modal.Footer>
    </Modal>
  );

  // Don't render if not initialized or banner shouldn't be shown
  if (!isInitialized || !showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Consent Banner */}
      <div 
        className="position-fixed bottom-0 start-0 end-0 bg-white border-top shadow-lg p-3"
        style={{ zIndex: 1055 }}
      >
        <div className="container-fluid">
          <Row className="align-items-center">
            <Col md={8} lg={9}>
              <div className="d-flex align-items-start">
                <BsCookie className="text-warning me-2 mt-1" size={20} />
                <div>
                  <h6 className="mb-1">We use cookies</h6>
                  <p className="mb-0 small text-muted">
                    We use necessary cookies to make our site work. We'd also like to set optional 
                    cookies to help us improve our website and analyze how it's used. You can choose 
                    which cookies to allow below, or{' '}
                    <Button 
                      variant="link" 
                      className="p-0 text-decoration-none small"
                      onClick={() => setShowSettings(true)}
                    >
                      customize your preferences
                    </Button>.
                  </p>
                </div>
              </div>
            </Col>
            <Col md={4} lg={3}>
              <div className="d-flex flex-column flex-md-row gap-2">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  className="flex-fill"
                  onClick={handleRejectAll}
                >
                  Reject All
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  className="flex-fill"
                  onClick={() => setShowSettings(true)}
                >
                  <BsGear className="me-1" />
                  Settings
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  className="flex-fill"
                  onClick={handleAcceptAll}
                >
                  Accept All
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Settings Modal */}
      {renderSettingsModal()}
    </>
  );
};

/**
 * Cookie Status Indicator Component
 * 
 * Shows current cookie consent status and allows users to change preferences
 */
export const CookieStatusIndicator = ({ className = '' }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [consentSummary, setConsentSummary] = useState(null);

  useEffect(() => {
    const updateSummary = () => {
      setConsentSummary(getConsentSummary());
    };

    updateSummary();
    
    // Update every 30 seconds
    const interval = setInterval(updateSummary, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleWithdrawConsent = () => {
    withdrawCookieConsent();
    setConsentSummary(getConsentSummary());
    setShowSettings(false);
  };

  if (!consentSummary) {
    return null;
  }

  return (
    <>
      <Button
        variant="link"
        size="sm"
        className={`text-decoration-none ${className}`}
        onClick={() => setShowSettings(true)}
        title="Cookie Settings"
      >
        <BsCookie className="me-1" />
        Cookies ({consentSummary.allowed}/{consentSummary.total})
      </Button>

      <Modal show={showSettings} onHide={() => setShowSettings(false)} size="md">
        <Modal.Header closeButton>
          <Modal.Title>Cookie Consent Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Card className="mb-3">
            <Card.Body>
              <h6>Current Status</h6>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Allowed Categories:</span>
                <Badge bg="info">{consentSummary.allowed} of {consentSummary.total}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Necessary Cookies:</span>
                <Badge bg="success">{consentSummary.necessary}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Optional Cookies:</span>
                <Badge bg="secondary">{consentSummary.optional}</Badge>
              </div>
            </Card.Body>
          </Card>

          <div>
            <h6>Cookie Categories</h6>
            {Object.entries(consentSummary.categories).map(([category, info]) => (
              <div key={category} className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <span>{info.name}</span>
                  {info.required && <Badge bg="primary" className="ms-2">Required</Badge>}
                </div>
                <Badge bg={info.allowed ? 'success' : 'secondary'}>
                  {info.allowed ? 'Allowed' : 'Blocked'}
                </Badge>
              </div>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-danger" onClick={handleWithdrawConsent}>
            Withdraw Consent
          </Button>
          <Button variant="secondary" onClick={() => setShowSettings(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CookieConsentBanner;