import React from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { BsExclamationTriangle, BsCheckCircle, BsInfoCircle, BsXCircle } from 'react-icons/bs';

/**
 * BaseModal - A flexible, reusable modal component
 * 
 * @param {Object} props
 * @param {boolean} props.show - Controls modal visibility
 * @param {Function} props.onHide - Called when modal should close
 * @param {string} props.title - Modal title
 * @param {string} [props.size='md'] - Modal size ('sm', 'md', 'lg', 'xl')
 * @param {boolean} [props.centered=true] - Center modal vertically
 * @param {string} [props.variant='primary'] - Bootstrap variant for primary button
 * @param {string} [props.headerVariant] - Bootstrap variant for header background
 * @param {ReactNode} [props.icon] - Icon component to display
 * @param {string} [props.iconVariant] - Bootstrap text color variant for icon
 * @param {boolean} [props.loading=false] - Shows loading state
 * @param {Function} [props.onConfirm] - Called when confirm button clicked
 * @param {string} [props.confirmText='Confirm'] - Text for confirm button
 * @param {string} [props.cancelText='Cancel'] - Text for cancel button
 * @param {boolean} [props.showCancel=true] - Whether to show cancel button
 * @param {boolean} [props.showConfirm=true] - Whether to show confirm button
 * @param {ReactNode} props.children - Modal body content
 * @param {ReactNode} [props.footer] - Custom footer content (overrides default buttons)
 * @param {string} [props.error] - Error message to display
 * @param {Function} [props.onErrorDismiss] - Called when error alert is dismissed
 * @param {boolean} [props.disableConfirm=false] - Disable confirm button
 * @param {boolean} [props.closeOnConfirm=true] - Auto-close modal after confirm
 * @param {Object} [props.confirmButtonProps] - Additional props for confirm button
 * @param {Object} [props.cancelButtonProps] - Additional props for cancel button
 * @param {boolean} [props.wrapInForm=false] - Wrap modal content in form element
 * @param {string} [props.className] - Additional CSS classes for modal
 */
const BaseModal = ({
  show,
  onHide,
  title,
  size = 'md',
  centered = true,
  variant = 'primary',
  headerVariant,
  icon,
  iconVariant,
  loading = false,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  showCancel = true,
  showConfirm = true,
  children,
  footer,
  error,
  onErrorDismiss,
  disableConfirm = false,
  closeOnConfirm = true,
  confirmButtonProps = {},
  cancelButtonProps = {},
  wrapInForm = false,
  className = '',
  ...modalProps
}) => {
  // Handle confirm action
  const handleConfirm = async (e) => {
    if (e) e.preventDefault();
    
    if (onConfirm) {
      const result = await onConfirm();
      // If onConfirm returns false, don't close the modal
      if (result !== false && closeOnConfirm) {
        onHide();
      }
    }
  };

  // Get icon based on variant if no icon provided
  const getDefaultIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case 'danger':
        return <BsExclamationTriangle size={50} />;
      case 'success':
        return <BsCheckCircle size={50} />;
      case 'info':
        return <BsInfoCircle size={50} />;
      case 'warning':
        return <BsExclamationTriangle size={50} />;
      default:
        return null;
    }
  };

  const displayIcon = getDefaultIcon();
  const displayIconVariant = iconVariant || variant;

  // Determine header class
  const headerClass = headerVariant ? `bg-${headerVariant} text-white` : '';

  // Modal content
  const modalContent = (
    <>
      <Modal.Header closeButton className={headerClass}>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && (
          <Alert 
            variant="danger" 
            dismissible={!!onErrorDismiss}
            onClose={onErrorDismiss}
            className="mb-3"
          >
            {error}
          </Alert>
        )}

        {displayIcon && (
          <div className="text-center mb-3">
            <div className={`text-${displayIconVariant}`}>
              {displayIcon}
            </div>
          </div>
        )}

        {children}
      </Modal.Body>

      {(footer || showCancel || showConfirm) && (
        <Modal.Footer>
          {footer || (
            <>
              {showCancel && (
                <Button
                  variant="secondary"
                  onClick={onHide}
                  disabled={loading}
                  {...cancelButtonProps}
                >
                  {cancelText}
                </Button>
              )}
              {showConfirm && onConfirm && (
                <Button
                  variant={variant}
                  onClick={handleConfirm}
                  disabled={loading || disableConfirm}
                  {...confirmButtonProps}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Loading...
                    </>
                  ) : (
                    confirmText
                  )}
                </Button>
              )}
            </>
          )}
        </Modal.Footer>
      )}
    </>
  );

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      className={className}
      {...modalProps}
    >
      {wrapInForm ? (
        <form onSubmit={handleConfirm}>
          {modalContent}
        </form>
      ) : (
        modalContent
      )}
    </Modal>
  );
};

export default BaseModal;