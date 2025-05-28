// components/MyArticles/DeleteConfirmModal.js
/**
 * Modal for confirming article deletion
 * Reusable confirmation modal with proper accessibility
 */
import React from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";

const DeleteConfirmModal = ({
  show,
  articleTitle,
  onHide,
  onConfirm,
  loading = false,
}) => {
  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Article</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="text-center mb-4">
            <BsExclamationTriangle
              size={50}
              className="text-danger mb-3"
              aria-hidden="true"
            />
            <h5>Are you sure you want to delete this article?</h5>
            <p className="text-muted">"{articleTitle}"</p>

            <Alert variant="danger" className="mt-3">
              <strong>Warning:</strong> This action cannot be undone. The
              article and all associated comments will be permanently deleted.
            </Alert>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" type="submit" disabled={loading}>
            {loading ? "Deleting..." : "Delete Article"}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default DeleteConfirmModal;
