// frontend/src/pages/ContactPage.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  BsEnvelope,
  BsGeoAlt,
  BsTelephone,
  BsClock,
  BsCheckCircle,
  BsExclamationTriangle,
  BsGithub,
  BsTwitter,
  BsFacebook,
} from "react-icons/bs";
import { useSendContactMessage } from "../hooks";
import "./ContactPage.scss";

/**
 * ContactPage Component
 *
 * Provides a contact form and contact information for the BeeKeeper's Blog.
 * Includes form validation, error handling, and integration with the backend API.
 */
const ContactPage = () => {
  // Update page title
  useEffect(() => {
    document.title = "Contact Us - BeeKeeper's Blog";
  }, []);

  // Form state management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Form submission state
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [submitMessage, setSubmitMessage] = useState("");
  
  // Use the contact API hook
  const { mutate: sendMessage, loading: isSubmitting } = useSendContactMessage({
    onSuccess: (response) => {
      setSubmitStatus("success");
      setSubmitMessage(
        "Thank you for your message! We'll get back to you soon."
      );
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
      setErrors({});
    },
    onError: (error) => {
      setSubmitStatus("error");
      setSubmitMessage(
        error.message || "Failed to send message. Please try again."
      );
    },
  });

  /**
   * Handle input changes
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset previous submission status
    setSubmitStatus(null);
    setSubmitMessage("");

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Send the message using the API hook
    sendMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
    });
  };

  // Contact information
  const contactInfo = [
    {
      icon: <BsEnvelope size={24} />,
      title: "Email",
      content: "info@beekeeperblog.com",
      link: "mailto:info@beekeeperblog.com",
    },
    {
      icon: <BsTelephone size={24} />,
      title: "Phone",
      content: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: <BsGeoAlt size={24} />,
      title: "Address",
      content: "123 Honey Lane, Beeville, CA 90210",
      link: null,
    },
    {
      icon: <BsClock size={24} />,
      title: "Hours",
      content: "Mon-Fri: 9AM-5PM PST",
      link: null,
    },
  ];

  // Social media links
  const socialLinks = [
    {
      icon: <BsTwitter size={20} />,
      url: "https://twitter.com/beekeeperblog",
      label: "Twitter",
    },
    {
      icon: <BsFacebook size={20} />,
      url: "https://facebook.com/beekeeperblog",
      label: "Facebook",
    },
    {
      icon: <BsGithub size={20} />,
      url: "https://github.com/beekeeperblog",
      label: "GitHub",
    },
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="hero-section text-center py-5 mb-5">
        <Container>
          <h1 className="display-4 mb-4">Get in Touch</h1>
          <p className="lead">
            Have questions about beekeeping? Want to contribute? We'd love to
            hear from you!
          </p>
        </Container>
      </div>

      <Container>
        <Row>
          {/* Contact Form */}
          <Col lg={8} className="mb-5">
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <h2 className="mb-4">Send us a Message</h2>

                {/* Success/Error Messages */}
                {submitStatus === "success" && (
                  <Alert
                    variant="success"
                    className="d-flex align-items-center"
                  >
                    <BsCheckCircle className="me-2" size={20} />
                    {submitMessage}
                  </Alert>
                )}

                {submitStatus === "error" && (
                  <Alert variant="danger" className="d-flex align-items-center">
                    <BsExclamationTriangle className="me-2" size={20} />
                    {submitMessage}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Name *</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          isInvalid={!!errors.name}
                          placeholder="John Doe"
                          disabled={isSubmitting}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.name}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Your Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          isInvalid={!!errors.email}
                          placeholder="john@example.com"
                          disabled={isSubmitting}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Subject *</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      isInvalid={!!errors.subject}
                      placeholder="How can we help?"
                      disabled={isSubmitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.subject}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Message *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      isInvalid={!!errors.message}
                      placeholder="Tell us more about your inquiry..."
                      disabled={isSubmitting}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.message}
                    </Form.Control.Feedback>
                  </Form.Group>

                  <div className="d-grid gap-2 d-md-block">
                    <Button
                      variant="primary"
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="px-5"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Contact Information */}
          <Col lg={4} className="mb-5">
            <div className="contact-info-section">
              <h3 className="mb-4">Contact Information</h3>

              {contactInfo.map((item, index) => (
                <Card key={index} className="mb-3 contact-info-card">
                  <Card.Body className="d-flex align-items-center">
                    <div className="contact-icon text-warning me-3">
                      {item.icon}
                    </div>
                    <div>
                      <h6 className="mb-1">{item.title}</h6>
                      {item.link ? (
                        <a href={item.link} className="text-decoration-none">
                          {item.content}
                        </a>
                      ) : (
                        <p className="mb-0 text-muted">{item.content}</p>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              ))}

              {/* Social Media Links */}
              <Card className="mt-4">
                <Card.Body>
                  <h6 className="mb-3">Follow Us</h6>
                  <div className="social-links d-flex gap-3">
                    {socialLinks.map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-link"
                        aria-label={social.label}
                      >
                        {social.icon}
                      </a>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {/* Quick Links */}
              {/*<Card className="mt-4">
                <Card.Body>
                  <h6 className="mb-3">Quick Links</h6>
                  <ul className="list-unstyled mb-0">
                    <li className="mb-2">
                      <a href="/faq" className="text-decoration-none">
                        Frequently Asked Questions
                      </a>
                    </li>
                    <li className="mb-2">
                      <a href="/privacy" className="text-decoration-none">
                        Privacy Policy
                      </a>
                    </li>
                    <li className="mb-2">
                      <a href="/terms" className="text-decoration-none">
                        Terms of Service
                      </a>
                    </li>
                    <li>
                      <a href="/about" className="text-decoration-none">
                        About Us
                      </a>
                    </li>
                  </ul>
                </Card.Body>
              </Card> */}
            </div>
          </Col>
        </Row>

        {/* Map Section (Optional) */}
{/*         <Row className="mb-5">
          <Col>
            <Card className="shadow-sm">
              <Card.Body className="p-0">
                <div className="map-container">
                  <iframe
                    title="BeeKeeper's Blog Location"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3306.033456016228!2d-118.4511!3d34.0219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDAxJzE4LjgiTiAxMTjCsDI3JzAzLjYiVw!5e0!3m2!1sen!2sus!4v1234567890"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row> */}
      </Container>
    </div>
  );
};

export default ContactPage;
