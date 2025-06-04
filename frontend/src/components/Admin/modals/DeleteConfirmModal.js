import React from 'react';
import BaseModal from '../../common/BaseModal';

/**
 * Generic Delete Confirmation Modal for Admin Pages
 * Replaces inline delete modals throughout admin interface
 */
const DeleteConfirmModal = ({
  show,
  onHide,
  onConfirm,
  itemType = "item",
  itemName,
  loading = false,
  warningMessage
}) => {
  return (
    <BaseModal
      show={show}
      onHide={onHide}
      title={`Delete ${itemType}`}
      variant="danger"
      centered
      onConfirm={onConfirm}
      confirmText={loading ? "Deleting..." : `Delete ${itemType}`}
      loading={loading}
    >
      <div className="text-center">
        <h5>Are you sure you want to delete this {itemType.toLowerCase()}?</h5>
        {itemName && (
          <p className="text-muted mt-2">"{itemName}"</p>
        )}
        {warningMessage && (
          <div className="alert alert-warning mt-3">
            {warningMessage}
          </div>
        )}
      </div>
    </BaseModal>
  );
};

export default DeleteConfirmModal;