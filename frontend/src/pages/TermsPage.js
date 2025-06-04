// frontend/src/pages/TermsPage.js
import React, { useEffect } from "react";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import { BsFileText, BsExclamationTriangle } from "react-icons/bs";
import { SEO } from "../contexts/SEOContext";
import "./StaticPages.scss";

/**
 * TermsPage Component
 *
 * Displays the terms of service for BeeKeeper's Blog.
 * Outlines the rules and agreements for using the website.
 */
const TermsPage = () => {
  // Update page title
  useEffect(() => {
    document.title = "Terms of Service - BeeKeeper's Blog";
  }, []);

  // Get current date for effective date
  const effectiveDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <SEO 
        title="Terms of Service"
        description="Review BeeKeeper's Hub terms of service. Learn about the rules and agreements for using our beekeeping community platform, user responsibilities, and content guidelines."
        type="website"
      />
      <div className="static-page terms-page">
        <Container>
        <Row>
          <Col lg={8} className="mx-auto">
            {/* Header */}
            <div className="page-header text-center mb-5">
              <BsFileText size={50} className="text-primary mb-3" />
              <h1>Terms of Service</h1>
              <p className="text-muted">Effective Date: {effectiveDate}</p>
            </div>

            {/* Introduction */}
            <Card className="mb-4">
              <Card.Body>
                <p className="lead">
                  Welcome to BeeKeeper's Blog! These Terms of Service ("Terms")
                  govern your use of our website and services. By accessing or
                  using BeeKeeper's Blog, you agree to be bound by these Terms.
                </p>
              </Card.Body>
            </Card>

            {/* Important Notice */}
            <Alert variant="warning" className="mb-5">
              <BsExclamationTriangle className="me-2" />
              <strong>
                Please read these Terms carefully before using our services.
              </strong>{" "}
              If you do not agree with any part of these terms, you may not
              access or use our services.
            </Alert>

            {/* Terms Sections */}
            <div className="terms-content">
              <section className="mb-5">
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By creating an account, accessing, or using BeeKeeper's Blog,
                  you acknowledge that you have read, understood, and agree to
                  be bound by these Terms and our Privacy Policy. If you are
                  using our services on behalf of an organization, you agree to
                  these Terms on behalf of that organization.
                </p>
              </section>

              <section className="mb-5">
                <h2>2. Use of Services</h2>
                <h3>2.1 Eligibility</h3>
                <p>
                  You must be at least 13 years old to use our services. By
                  using BeeKeeper's Blog, you represent and warrant that you meet
                  this age requirement.
                </p>

                <h3>2.2 Account Registration</h3>
                <p>
                  To access certain features, you must register for an account.
                  You agree to:
                </p>
                <ul>
                  <li>Provide accurate, current, and complete information</li>
                  <li>
                    Maintain and update your information to keep it accurate
                  </li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>
                    Accept responsibility for all activities under your account
                  </li>
                </ul>

                <h3>2.3 Prohibited Uses</h3>
                <p>You agree not to:</p>
                <ul>
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Post spam, malware, or malicious content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>
                    Use automated systems to access our services without
                    permission
                  </li>
                  <li>Impersonate others or provide false information</li>
                  <li>Engage in any activity that disrupts our services</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2>3. User Content</h2>
                <h3>3.1 Your Content</h3>
                <p>
                  You retain ownership of content you create and post on
                  BeeKeeper's Blog. However, by posting content, you grant us a
                  worldwide, non-exclusive, royalty-free license to:
                </p>
                <ul>
                  <li>Use, reproduce, modify, and distribute your content</li>
                  <li>Display your content on our platform</li>
                  <li>Allow other users to view and share your content</li>
                </ul>

                <h3>3.2 Content Standards</h3>
                <p>
                  All content must be relevant to beekeeping and comply with our
                  community guidelines. We reserve the right to remove content
                  that violates these Terms or is otherwise objectionable.
                </p>

                <h3>3.3 Responsibility for Content</h3>
                <p>
                  You are solely responsible for your content and any
                  consequences of posting it. We do not endorse user content and
                  are not liable for any user-generated content.
                </p>
              </section>

              <section className="mb-5">
                <h2>4. Intellectual Property</h2>
                <p>
                  The BeeKeeper's Blog service, including its original content,
                  features, and functionality, is owned by BeeKeeper's Blog and is
                  protected by international copyright, trademark, patent, trade
                  secret, and other intellectual property laws.
                </p>
                <p>
                  Our trademarks and trade dress may not be used in connection
                  with any product or service without our prior written consent.
                </p>
              </section>

              <section className="mb-5">
                <h2>5. Privacy</h2>
                <p>
                  Your use of our services is also governed by our Privacy
                  Policy. Please review our Privacy Policy, which also governs
                  the site and informs users of our data collection practices.
                </p>
              </section>

              <section className="mb-5">
                <h2>6. Disclaimers</h2>
                <p>
                  THE INFORMATION ON THIS WEBSITE IS PROVIDED ON AN "AS IS"
                  BASIS. TO THE FULLEST EXTENT PERMITTED BY LAW, THIS COMPANY:
                </p>
                <ul>
                  <li>
                    Makes no warranties or representations about the accuracy or
                    completeness of this website's content
                  </li>
                  <li>
                    Assumes no liability for any errors or omissions in the
                    content
                  </li>
                  <li>
                    Does not warrant that the website will be uninterrupted or
                    error-free
                  </li>
                  <li>
                    Is not responsible for any loss or damage arising from your
                    use of the website
                  </li>
                </ul>
              </section>

              <section className="mb-5">
                <h2>7. Limitation of Liability</h2>
                <p>
                  IN NO EVENT SHALL BeeKeeper's Blog, ITS DIRECTORS, EMPLOYEES, OR
                  AGENTS BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, SPECIAL,
                  INCIDENTAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATED TO
                  YOUR USE OF THE SERVICES.
                </p>
              </section>

              <section className="mb-5">
                <h2>8. Indemnification</h2>
                <p>
                  You agree to defend, indemnify, and hold harmless BeeKeeper
                  Blog and its officers, directors, employees, and agents from
                  any claims, damages, obligations, losses, liabilities, costs,
                  or expenses arising from:
                </p>
                <ul>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any third-party rights</li>
                  <li>Your use of our services</li>
                  <li>Any content you post or submit</li>
                </ul>
              </section>

              <section className="mb-5">
                <h2>9. Termination</h2>
                <p>
                  We may terminate or suspend your account and access to our
                  services immediately, without prior notice or liability, for
                  any reason, including if you breach these Terms.
                </p>
                <p>
                  Upon termination, your right to use the services will cease
                  immediately. All provisions of these Terms which should
                  reasonably survive termination shall survive.
                </p>
              </section>

              <section className="mb-5">
                <h2>10. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of the State of California, without regard to
                  its conflict of law provisions. Any disputes shall be resolved
                  in the courts located in Los Angeles County, California.
                </p>
              </section>

              <section className="mb-5">
                <h2>11. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. If we
                  make material changes, we will notify you by email or by
                  posting a notice on our website. Your continued use of the
                  services after any changes constitutes acceptance of the new
                  Terms.
                </p>
              </section>

              <section className="mb-5">
                <h2>12. Contact Information</h2>
                <p>
                  If you have any questions about these Terms, please contact us
                  at:
                </p>
                <Card className="bg-light">
                  <Card.Body>
                    <p className="mb-1">
                      <strong>BeeKeeper's Blog Legal Department</strong>
                    </p>
                    <p className="mb-1">Email: legal@beekeeperblog.com</p>
                    <p className="mb-1">Phone: +1 (555) 123-4567</p>
                    <p className="mb-0">
                      Address: 123 Honey Lane, Beeville, CA 90210
                    </p>
                  </Card.Body>
                </Card>
              </section>
            </div>

            {/* Agreement Notice */}
            <Card className="border-primary">
              <Card.Body className="text-center">
                <p className="mb-0">
                  <strong>
                    By using BeeKeeper's Blog, you acknowledge that you have read,
                    understood, and agree to be bound by these Terms of Service.
                  </strong>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
    </>
  );
};

export default TermsPage;
