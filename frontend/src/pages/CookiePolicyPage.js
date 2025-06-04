// frontend/src/pages/CookiePolicyPage.js
import React, { useEffect } from "react";
import { Container, Row, Col, Card, Alert, Table, Badge } from "react-bootstrap";
import { BsCookie, BsInfoCircle } from "react-icons/bs";
import { getCookieConfig, COOKIE_CATEGORIES } from "../utils/cookieConsent";
import { SEO } from "../contexts/SEOContext";
import "./StaticPages.scss";

/**
 * Cookie Policy Page Component
 *
 * Displays detailed information about cookies used on the website,
 * their purposes, and how users can manage them.
 */
const CookiePolicyPage = () => {
  // Update page title
  useEffect(() => {
    document.title = "Cookie Policy - BeeKeeper's Blog";
  }, []);

  // Get current date for last updated
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const cookieConfig = getCookieConfig();

  return (
    <>
      <SEO 
        title="Cookie Policy"
        description="Learn about how BeeKeeper's Hub uses cookies and tracking technologies. Understand your options for managing cookie preferences and protecting your privacy."
        type="website"
      />
      <Container className="py-5">
        <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <div className="text-center mb-5">
            <BsCookie size={48} className="text-warning mb-3" />
            <h1 className="display-4 mb-3">Cookie Policy</h1>
            <p className="lead text-muted">
              Understanding how we use cookies and tracking technologies
            </p>
          </div>

          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Alert variant="info">
                <BsInfoCircle className="me-2" />
                <strong>Last Updated:</strong> {lastUpdated}
              </Alert>
            </Card.Body>
          </Card>

          {/* Policy Content */}
          <div className="policy-content">
            <section className="mb-5">
              <h2>What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device 
                when you visit a website. They are widely used to make websites work more 
                efficiently and provide information to site owners.
              </p>
              <p>
                We use cookies to enhance your experience on BeeKeeper's Blog, remember your 
                preferences, and help us understand how our website is used.
              </p>
            </section>

            <section className="mb-5">
              <h2>Types of Cookies We Use</h2>
              <p>
                We categorize cookies based on their purpose and ask for your consent 
                where required by law:
              </p>

              {Object.entries(cookieConfig).map(([category, config]) => (
                <Card key={category} className="mb-3">
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">{config.name}</h4>
                    {config.required && (
                      <Badge bg="primary">Required</Badge>
                    )}
                  </Card.Header>
                  <Card.Body>
                    <p>{config.description}</p>
                    
                    {config.purposes && config.purposes.length > 0 && (
                      <div className="mb-3">
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
                        <strong>Specific Cookies:</strong>
                        <Table striped size="sm" className="mt-2">
                          <thead>
                            <tr>
                              <th>Cookie Name</th>
                              <th>Purpose</th>
                              <th>Retention</th>
                            </tr>
                          </thead>
                          <tbody>
                            {config.cookies.map((cookie, index) => (
                              <tr key={index}>
                                <td><code>{cookie.name}</code></td>
                                <td>{cookie.purpose}</td>
                                <td>{cookie.retention}</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </section>

            <section className="mb-5">
              <h2>Managing Your Cookie Preferences</h2>
              <p>
                You have several options for managing cookies:
              </p>
              
              <h3>Cookie Consent Banner</h3>
              <p>
                When you first visit our website, you'll see a cookie consent banner 
                allowing you to:
              </p>
              <ul>
                <li>Accept all cookies</li>
                <li>Reject non-essential cookies</li>
                <li>Customize your preferences for different cookie categories</li>
              </ul>

              <h3>Browser Settings</h3>
              <p>
                You can also control cookies through your browser settings:
              </p>
              <ul>
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
              </ul>

              <Alert variant="warning" className="mt-3">
                <strong>Note:</strong> Disabling necessary cookies may affect website functionality 
                and your user experience.
              </Alert>
            </section>

            <section className="mb-5">
              <h2>Third-Party Cookies</h2>
              <p>
                We may use third-party services that set their own cookies. These include:
              </p>
              <ul>
                <li>Analytics services (if you consent to analytics cookies)</li>
                <li>Social media plugins (if you consent to marketing cookies)</li>
                <li>Content delivery networks for performance optimization</li>
              </ul>
              <p>
                These third parties have their own privacy policies and cookie policies 
                that govern their use of cookies.
              </p>
            </section>

            <section className="mb-5">
              <h2>Cookie Retention</h2>
              <p>
                Different cookies have different retention periods:
              </p>
              <ul>
                <li><strong>Session Cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain for a set period (see specific cookie details above)</li>
                <li><strong>Consent Cookies:</strong> Retained for 1 year to remember your preferences</li>
              </ul>
            </section>

            <section className="mb-5">
              <h2>Changes to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. When we make significant 
                changes, we will notify you through our website or by other means. The 
                "Last Updated" date at the top of this policy indicates when it was most 
                recently revised.
              </p>
            </section>

            <section className="mb-5">
              <h2>Contact Us</h2>
              <p>
                If you have questions about this Cookie Policy or our use of cookies, 
                please contact us:
              </p>
              <ul>
                <li>Email: privacy@beekeeperblog.com</li>
                <li>Contact form: <a href="/contact">Contact Us</a></li>
              </ul>
            </section>

            <Card className="mt-5">
              <Card.Body className="text-center">
                <h5>Need to Change Your Cookie Preferences?</h5>
                <p className="mb-3">
                  You can update your cookie preferences at any time by clicking the 
                  "Cookies" link in our website footer.
                </p>
                <Alert variant="info" className="mb-0">
                  <BsInfoCircle className="me-2" />
                  Your privacy matters to us. We only collect data that helps us 
                  improve your experience on our website.
                </Alert>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>
    </Container>
    </>
  );
};

export default CookiePolicyPage;