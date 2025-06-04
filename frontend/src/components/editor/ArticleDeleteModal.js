// frontend/src/components/editor/ArticleDeleteModal.js
import React from "react";
import BaseModal from "../common/BaseModal";

const ArticleDeleteModal = ({ show, onHide, onConfirmDelete }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title="Delete Article"
    variant="danger"
    onConfirm={onConfirmDelete}
    confirmText="Delete Article"
  >
    <div className="text-center">
      <h5>Are you sure you want to delete this article?</h5>
      <p className="text-muted">
        This action cannot be undone. The article will be permanently removed
        from your account.
      </p>
    </div>
  </BaseModal>
);

export default ArticleDeleteModal;
