// components/common/ConfirmDialog.js
import React from 'react';
import BaseModal from './BaseModal';
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
  return (
    <BaseModal
      show={show}
      onHide={onHide}
      title={title}
      variant={variant}
      icon={icon}
      onConfirm={onConfirm}
      confirmText={confirmText}
      cancelText={cancelText}
      centered
    >
      <div className="text-center">
        <p className="mb-0">{message}</p>
      </div>
    </BaseModal>
  );
};

export default ConfirmDialog;