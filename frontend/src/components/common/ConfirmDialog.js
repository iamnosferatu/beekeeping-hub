// components/common/ConfirmDialog.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { BsExclamationTriangle } from 'react-icons/bs';

/**
 * Reusable confirmation dialog component
 * Replaces window.confirm() with a proper modal
 */
const ConfirmDialog = ({
  show,
  onHide,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  icon = <BsExclamationTriangle size={50} />
}) => {
  const handleConfirm = () => {
    onConfirm();
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center">
          <div className={`text-${variant} mb-3`}>
            {icon}
          </div>
          <p className="mb-0">{message}</p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={handleConfirm}>
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDialog;