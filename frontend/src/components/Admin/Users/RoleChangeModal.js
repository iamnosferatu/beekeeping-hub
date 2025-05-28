// components/Admin/Users/RoleChangeModal.js
/**
 * Modal for changing user roles
 * Handles role selection with proper validation
 */
import React, { useState } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";

const RoleChangeModal = ({
  show,
  user,
  onHide,
  onConfirm,
  loading = false,
}) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || "user");

  /**
   * Reset state when modal opens/closes
   */
  React.useEffect(() => {
    if (show && user) {
      setSelectedRole(user.role);
    }
  }, [show, user]);

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(selectedRole);
  };

  if (!user) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Change User Role</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="mb-3">
            <p>
              Update role for user: <strong>{user.username}</strong>
            </p>
            <small className="text-muted">Email: {user.email}</small>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Select New Role</Form.Label>
            <Form.Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={loading}
              required
            >
              <option value="user">Regular User</option>
              <option value="author">Author</option>
              <option value="admin">Administrator</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Role determines user permissions across the entire system.
            </Form.Text>
          </Form.Group>

          <Alert variant="warning">
            <strong>Warning:</strong> Changing user roles affects their
            permissions across the entire system. This action will take effect
            immediately.
          </Alert>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || selectedRole === user.role}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              "Update Role"
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default RoleChangeModal;
