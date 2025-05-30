// frontend/src/pages/PrivacyPage.js
import React, { useEffect } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { BsShieldLock, BsInfoCircle } from "react-icons/bs";
import "./StaticPages.scss";

/**
 * PrivacyPage Component
 *
 * Displays the privacy policy for BeeKeeper's Blog.
 * This is a legal requirement for websites that collect user data.
 */
const PrivacyPage = () => {
  // Update page title
  useEffect(() => {
    document.title = "Privacy Policy - BeeKeeper's Blog";
  }, []);

  // Get current date for last updated
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="static-page privacy-page">
      <Container>
        <Row>
          <Col lg={8} className="mx-auto">
            {/* Header */}
            <div className="page-header text-center mb-5">
              <BsShieldLock size={50} className="text-primary mb-3" />
              <h1>Privacy Policy</h1>
              <p className="text-muted">Last updated: {lastUpdated}</p>
            </div>

            {/* Introduction */}
            <Card className="mb-4">
              <Card.Body>
                <p className="lead">
                  At BeeKeeper's Blog, we take your privacy seriously. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you visit our website and use
                  our services.
                </p>
              </Card.Body>
            </Card>

            {/* Policy Sections */}
            <div className="policy-content">
              <section className="mb-5">
                <h2>1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us, such as
                  when you create an account, write an article, leave a comment,
                  or contact us. This may include:
                </p>
                <ul>
                  <li>Name, username, and email address</li>
                  <li>Profile information (bio, avatar)</li>
                  <li>Content you create (articles, comments)</li>
                  <li>Communications with us</li>
                  <li>Any other information you choose to provide</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2>2. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul>
                  <li>Provide, maintain, and improve our services</li>
                  <li>Create and manage your account</li>
                  <li>Process and publish your content</li>
                  <li>
                    Send you updates and notifications (with your consent)
                  </li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze usage patterns and trends</li>
                  <li>Detect, prevent, and address technical issues</li>
                  <li>Protect against unauthorized access and misuse</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2>3. Information Sharing and Disclosure</h2>
                <p>
                  We do not sell, trade, or rent your personal information to
                  third parties. We may share your information in the following
                  situations:
                </p>
                <ul>
                  <li>With your consent or at your direction</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights, privacy, safety, or property</li>
                  <li>In connection with a merger, sale, or acquisition</li>
                  <li>
                    With service providers who assist in operating our website
                  </li>
                </ul>
              </section>

              <section className="mb-5">
                <h2>4. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security
                  measures to protect your personal information against
                  unauthorized access, alteration, disclosure, or destruction.
                  However, no method of transmission over the Internet is 100%
                  secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section className="mb-5">
                <h2>5. Your Rights and Choices</h2>
                <p>You have the right to:</p>
                <ul>
                  <li>Access and update your personal information</li>
                  <li>Delete your account and associated data</li>
                  <li>Opt-out of promotional communications</li>
                  <li>Request a copy of your data</li>
                  <li>Withdraw consent where we rely on it for processing</li>
                </ul>
                <p>
                  To exercise these rights, please contact us using the
                  information provided below.
                </p>
              </section>

              <section className="mb-5">
                <h2>6. Cookies and Tracking Technologies</h2>
                <p>
                  We use cookies and similar tracking technologies to track
                  activity on our website and hold certain information. You can
                  instruct your browser to refuse all cookies or to indicate
                  when a cookie is being sent.
                </p>
              </section>

              <section className="mb-5">
                <h2>7. Children's Privacy</h2>
                <p>
                  Our services are not directed to individuals under the age of
                  13. We do not knowingly collect personal information from
                  children under 13. If we become aware that we have collected
                  personal information from a child under 13, we will take steps
                  to delete such information.
                </p>
              </section>

              <section className="mb-5">
                <h2>8. Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-5">
                <h2>9. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy or our
                  privacy practices, please contact us at:
                </p>
                <Card className="bg-light">
                  <Card.Body>
                    <p className="mb-1">
                      <strong>BeeKeeper's Blog</strong>
                    </p>
                    <p className="mb-1">Email: privacy@beekeeperblog.com</p>
                    <p className="mb-1">Phone: +1 (555) 123-4567</p>
                    <p className="mb-0">
                      Address: 123 Honey Lane, Beeville, CA 90210
                    </p>
                  </Card.Body>
                </Card>
              </section>
            </div>

            {/* Info Note */}
            <Alert variant="info" className="d-flex align-items-center">
              <BsInfoCircle className="me-2" size={20} />
              <div>
                This privacy policy is effective as of {lastUpdated} and will
                remain in effect except with respect to any changes in its
                provisions in the future, which will be in effect immediately
                after being posted on this page.
              </div>
            </Alert>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PrivacyPage;
