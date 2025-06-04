// components/MyArticles/DeleteConfirmModal.js
/**
 * Modal for confirming article deletion
 * Reusable confirmation modal with proper accessibility
 */
import React from "react";
import { Alert } from "react-bootstrap";
import BaseModal from "../common/BaseModal";

const DeleteConfirmModal = ({
  show,
  articleTitle,
  onHide,
  onConfirm,
  loading = false,
}) => {
  return (
    <BaseModal
      show={show}
      onHide={onHide}
      title="Delete Article"
      variant="danger"
      centered
      loading={loading}
      onConfirm={onConfirm}
      confirmText={loading ? "Deleting..." : "Delete Article"}
      cancelText="Cancel"
      wrapInForm
    >
      <div className="text-center mb-4">
        <h5>Are you sure you want to delete this article?</h5>
        <p className="text-muted">"{articleTitle}"</p>

        <Alert variant="danger" className="mt-3">
          <strong>Warning:</strong> This action cannot be undone. The
          article and all associated comments will be permanently deleted.
        </Alert>
      </div>
    </BaseModal>
  );
};

export default DeleteConfirmModal;
