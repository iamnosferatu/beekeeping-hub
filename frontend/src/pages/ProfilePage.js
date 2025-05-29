// frontend/src/pages/ProfilePage.js
import React, { useState, useContext } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Image,
  Modal,
  Badge,
  Spinner,
} from "react-bootstrap";
import { BsPencil, BsShieldLock, BsUpload, BsTrash, BsEnvelope, BsCheckCircle, BsXCircle } from "react-icons/bs";
import AuthContext from "../contexts/AuthContext";
import * as Yup from "yup";
import { Formik } from "formik";
import api from "../services/api";
import "./ProfilePage.scss";

const ProfilePage = () => {
  const { user, updateProfile, changePassword, error, clearError } =
    useContext(AuthContext);

  const [profileImage, setProfileImage] = useState(
    user?.avatar || "/api/placeholder/200/200"
  );
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Newsletter subscription state
  const [newsletterStatus, setNewsletterStatus] = useState(null);
  const [newsletterLoading, setNewsletterLoading] = useState(true);
  const [newsletterError, setNewsletterError] = useState(null);
  const [newsletterActionLoading, setNewsletterActionLoading] = useState(false);

  // Profile update validation schema
  const profileValidationSchema = Yup.object().shape({
    firstName: Yup.string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters"),
    lastName: Yup.string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    bio: Yup.string().max(500, "Bio must be at most 500 characters"),
  });

  // Password change validation schema
  const passwordValidationSchema = Yup.object().shape({
    currentPassword: Yup.string().required("Current password is required"),
    newPassword: Yup.string()
      .required("New password is required")
      .min(8, "Password must be at least 8 characters")
      .notOneOf(
        [Yup.ref("currentPassword")],
        "New password must be different from current password"
      ),
    confirmPassword: Yup.string()
      .required("Please confirm your new password")
      .oneOf([Yup.ref("newPassword")], "Passwords must match"),
  });

  // Handle image upload simulation
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      clearError();
      await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        bio: values.bio,
        avatar: profileImage,
      });

      setSuccessMessage("Profile updated successfully");
    } catch (err) {
      // Error is handled by context
      console.error("Profile update error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (values, { setSubmitting, resetForm }) => {
    try {
      clearError();
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setSuccessMessage("Password changed successfully");
      setShowChangePasswordModal(false);
      resetForm();
    } catch (err) {
      // Error is handled by context
      console.error("Password change error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Remove profile image
  const handleRemoveImage = () => {
    setProfileImage("/api/placeholder/200/200");
  };

  // Check newsletter subscription status
  const checkNewsletterStatus = async () => {
    if (!user?.email) return;
    
    try {
      setNewsletterLoading(true);
      setNewsletterError(null);
      const response = await api.newsletter.checkStatus(user.email);
      setNewsletterStatus(response.data);
    } catch (error) {
      console.error("Error checking newsletter status:", error);
      setNewsletterError("Unable to check newsletter status");
    } finally {
      setNewsletterLoading(false);
    }
  };

  // Handle newsletter subscribe
  const handleNewsletterSubscribe = async () => {
    try {
      setNewsletterActionLoading(true);
      setNewsletterError(null);
      await api.newsletter.subscribe(user.email);
      setSuccessMessage("Successfully subscribed to newsletter!");
      await checkNewsletterStatus(); // Refresh status
    } catch (error) {
      console.error("Newsletter subscribe error:", error);
      setNewsletterError("Failed to subscribe to newsletter");
    } finally {
      setNewsletterActionLoading(false);
    }
  };

  // Handle newsletter unsubscribe
  const handleNewsletterUnsubscribe = async () => {
    if (!newsletterStatus?.token) return;
    
    try {
      setNewsletterActionLoading(true);
      setNewsletterError(null);
      await api.newsletter.unsubscribe(newsletterStatus.token);
      setSuccessMessage("Successfully unsubscribed from newsletter");
      await checkNewsletterStatus(); // Refresh status
    } catch (error) {
      console.error("Newsletter unsubscribe error:", error);
      setNewsletterError("Failed to unsubscribe from newsletter");
    } finally {
      setNewsletterActionLoading(false);
    }
  };

  // Check newsletter status on component mount
  React.useEffect(() => {
    checkNewsletterStatus();
  }, [user?.email]);

  return (
    <Container className="profile-page py-5">
      <h1 className="mb-4">My Profile</h1>

      {/* Success Message */}
      {successMessage && (
        <Alert
          variant="success"
          dismissible
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="danger" dismissible onClose={clearError}>
          {error}
        </Alert>
      )}

      <Formik
        initialValues={{
          firstName: user?.first_name || "",
          lastName: user?.last_name || "",
          email: user?.email || "",
          bio: user?.bio || "",
        }}
        validationSchema={profileValidationSchema}
        onSubmit={handleProfileUpdate}
        enableReinitialize
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <Form onSubmit={handleSubmit}>
            <Row>
              {/* Profile Image Section */}
              <Col lg={4} className="mb-4 mb-lg-0">
                <Card className="shadow-sm">
                  <Card.Body className="text-center">
                    <div className="position-relative d-inline-block mb-3">
                      <Image
                        src={profileImage}
                        roundedCircle
                        className="mb-3"
                        style={{
                          width: "200px",
                          height: "200px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="position-absolute bottom-0 end-0">
                        <label
                          htmlFor="profile-image-upload"
                          className="btn btn-primary btn-sm rounded-circle p-2 shadow"
                          style={{ cursor: "pointer" }}
                        >
                          <BsUpload />
                          <input
                            type="file"
                            id="profile-image-upload"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                          />
                        </label>
                        {profileImage !== "/api/placeholder/200/200" && (
                          <Button
                            variant="danger"
                            size="sm"
                            className="rounded-circle p-2 ms-2 shadow"
                            onClick={handleRemoveImage}
                          >
                            <BsTrash />
                          </Button>
                        )}
                      </div>
                    </div>
                    <h4>{`${user?.first_name || ""} ${
                      user?.last_name || ""
                    }`}</h4>
                    <p className="text-muted">
                      <Badge bg="secondary">{user?.role}</Badge>
                    </p>
                  </Card.Body>
                </Card>
              </Col>

              {/* Profile Details Section */}
              <Col lg={8}>
                <Card className="shadow-sm mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Personal Information</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={values.firstName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.firstName && errors.firstName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.firstName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={values.lastName}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.lastName && errors.lastName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.lastName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && errors.email}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group>
                      <Form.Label>Bio</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="bio"
                        value={values.bio}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.bio && errors.bio}
                        placeholder="Tell us a bit about yourself..."
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.bio}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Card.Body>
                  <Card.Footer>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Updating..." : "Update Profile"}
                      <BsPencil className="ms-2" />
                    </Button>
                  </Card.Footer>
                </Card>

                {/* Account Security Section */}
                <Card className="shadow-sm mb-4">
                  <Card.Header>
                    <h5 className="mb-0">Account Security</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">Change Password</h6>
                        <p className="text-muted">
                          Regularly changing your password helps keep your
                          account secure.
                        </p>
                      </div>
                      <Button
                        variant="outline-primary"
                        onClick={() => setShowChangePasswordModal(true)}
                      >
                        <BsShieldLock className="me-2" />
                        Change Password
                      </Button>
                    </div>
                  </Card.Body>
                </Card>

                {/* Newsletter Subscription Section */}
                <Card className="shadow-sm">
                  <Card.Header>
                    <h5 className="mb-0">Newsletter Subscription</h5>
                  </Card.Header>
                  <Card.Body>
                    {newsletterError && (
                      <Alert variant="danger" dismissible onClose={() => setNewsletterError(null)} className="mb-3">
                        {newsletterError}
                      </Alert>
                    )}
                    
                    {newsletterLoading ? (
                      <div className="text-center py-3">
                        <Spinner animation="border" size="sm" />
                        <p className="mt-2 mb-0">Checking subscription status...</p>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1 d-flex align-items-center">
                            <BsEnvelope className="me-2" />
                            Newsletter Status
                          </h6>
                          {newsletterStatus?.isSubscribed ? (
                            <>
                              <p className="text-success mb-1 d-flex align-items-center">
                                <BsCheckCircle className="me-2" />
                                You are subscribed to our newsletter
                              </p>
                              <small className="text-muted">
                                Subscribed since {new Date(newsletterStatus.subscribed_at).toLocaleDateString()}
                              </small>
                            </>
                          ) : (
                            <>
                              <p className="text-muted mb-1 d-flex align-items-center">
                                <BsXCircle className="me-2" />
                                You are not subscribed to our newsletter
                              </p>
                              <small className="text-muted">
                                Stay updated with the latest beekeeping tips and news
                              </small>
                            </>
                          )}
                        </div>
                        <div>
                          {newsletterStatus?.isSubscribed ? (
                            <Button
                              variant="outline-danger"
                              onClick={handleNewsletterUnsubscribe}
                              disabled={newsletterActionLoading}
                            >
                              {newsletterActionLoading ? (
                                <>
                                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                                  Processing...
                                </>
                              ) : (
                                "Unsubscribe"
                              )}
                            </Button>
                          ) : (
                            <Button
                              variant="primary"
                              onClick={handleNewsletterSubscribe}
                              disabled={newsletterActionLoading}
                            >
                              {newsletterActionLoading ? (
                                <>
                                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                                  Processing...
                                </>
                              ) : (
                                "Subscribe"
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>

      {/* Change Password Modal */}
      <Modal
        show={showChangePasswordModal}
        onHide={() => setShowChangePasswordModal(false)}
      >
        <Formik
          initialValues={{
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={passwordValidationSchema}
          onSubmit={handlePasswordChange}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>Change Password</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Current Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="currentPassword"
                    value={values.currentPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={
                      touched.currentPassword && errors.currentPassword
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.currentPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="newPassword"
                    value={values.newPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={touched.newPassword && errors.newPassword}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.newPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group>
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    isInvalid={
                      touched.confirmPassword && errors.confirmPassword
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowChangePasswordModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Changing Password..." : "Change Password"}
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </Container>
  );
};

export default ProfilePage;
