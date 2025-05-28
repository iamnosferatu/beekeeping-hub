// components/Admin/Users/DeleteUserModal.js (MISSING COMPONENT)
/**
 * Modal for confirming user deletion
 * Handles user deletion with proper warnings and confirmation
 */
import React, { useState } from "react";
import { Modal, Button, Alert, Form } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";

const DeleteUserModal = ({
  show,
  user,
  onHide,
  onConfirm,
  loading = false,
}) => {
  const [confirmText, setConfirmText] = useState("");

  /**
   * Reset confirmation text when modal opens/closes
   */
  React.useEffect(() => {
    if (show) {
      setConfirmText("");
    }
  }, [show]);

  /**
   * Handle form submission with confirmation check
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (confirmText.toLowerCase() === "delete") {
      onConfirm();
    }
  };

  /**
   * Check if deletion can be confirmed
   */
  const canConfirm = confirmText.toLowerCase() === "delete";

  if (!user) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <BsExclamationTriangle className="me-2" />
            Delete User
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="text-center mb-4">
            <BsExclamationTriangle
              size={60}
              className="text-danger mb-3"
              aria-hidden="true"
            />
            <h5>Are you sure you want to delete this user?</h5>

            {/* User Info */}
            <div className="bg-light p-3 rounded my-3">
              <div className="d-flex align-items-center justify-content-center">
                <img
                  src={
                    user.avatar || "https://via.placeholder.com/40x40?text=👤"
                  }
                  alt={user.username}
                  className="rounded-circle me-3"
                  width="40"
                  height="40"
                  style={{ objectFit: "cover" }}
                />
                <div className="text-start">
                  <strong>{user.username}</strong>
                  <div className="text-muted small">{user.email}</div>
                  <div className="text-muted small">
                    Role: {user.role} | Articles: {user.article_count || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Messages */}
            <Alert variant="danger" className="text-start">
              <strong>⚠️ This action is irreversible!</strong>
              <ul className="mb-0 mt-2">
                <li>The user account will be permanently deleted</li>
                <li>All articles by this user will also be deleted</li>
                <li>All comments by this user will be deleted</li>
                <li>This cannot be undone</li>
              </ul>
            </Alert>

            {/* Confirmation Input */}
            <div className="text-start">
              <Form.Group>
                <Form.Label>
                  Type <strong>"DELETE"</strong> to confirm:
                </Form.Label>
                <Form.Control
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type DELETE to confirm"
                  disabled={loading}
                  className={canConfirm ? "border-success" : ""}
                />
              </Form.Group>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={loading || !canConfirm}
          >
            {loading ? "Deleting User..." : "Delete User"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default DeleteUserModal;
