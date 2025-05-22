// frontend/src/components/editor/ArticleDeleteModal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";

const ArticleDeleteModal = ({ show, onHide, onConfirmDelete }) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Delete Article</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <div className="text-center">
        <BsExclamationTriangle size={50} className="text-danger mb-3" />
        <h5>Are you sure you want to delete this article?</h5>
        <p className="text-muted">
          This action cannot be undone. The article will be permanently removed
          from your account.
        </p>
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={onHide}>
        Cancel
      </Button>
      <Button variant="danger" onClick={onConfirmDelete}>
        Delete Article
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ArticleDeleteModal;
