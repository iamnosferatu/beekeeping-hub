/**
 * BaseModal Usage Examples
 * This file demonstrates various ways to use the BaseModal component
 */

import React, { useState } from 'react';
import BaseModal from './BaseModal';
import { Form, Alert } from 'react-bootstrap';
import { BsTrash, BsCheckCircle, BsExclamationTriangle } from 'react-icons/bs';

// Example 1: Simple Confirmation Modal
export const SimpleConfirmExample = () => {
  const [show, setShow] = useState(false);
  
  return (
    <BaseModal
      show={show}
      onHide={() => setShow(false)}
      title="Confirm Action"
      variant="primary"
      onConfirm={() => {
        console.log('Confirmed!');
        // Return false to keep modal open, or omit/return true to close
      }}
      confirmText="Yes, Continue"
      cancelText="Cancel"
    >
      <p>Are you sure you want to proceed with this action?</p>
    </BaseModal>
  );
};

// Example 2: Delete Confirmation with Loading State
export const DeleteWithLoadingExample = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleDelete = async () => {
    setLoading(true);
    try {
      await someDeleteOperation();
      return true; // Close modal on success
    } catch (error) {
      return false; // Keep modal open on error
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <BaseModal
      show={show}
      onHide={() => setShow(false)}
      title="Delete Item"
      variant="danger"
      icon={<BsTrash size={50} />}
      loading={loading}
      onConfirm={handleDelete}
      confirmText={loading ? "Deleting..." : "Delete"}
    >
      <div className="text-center">
        <h5>Are you sure you want to delete this item?</h5>
        <p className="text-muted">This action cannot be undone.</p>
      </div>
    </BaseModal>
  );
};

// Example 3: Form Modal with Validation
export const FormModalExample = () => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [error, setError] = useState(null);
  
  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      setError('Please fill in all fields');
      return false; // Keep modal open
    }
    
    try {
      await submitForm(formData);
      return true; // Close modal on success
    } catch (err) {
      setError(err.message);
      return false; // Keep modal open on error
    }
  };
  
  return (
    <BaseModal
      show={show}
      onHide={() => setShow(false)}
      title="Add New User"
      size="lg"
      variant="primary"
      onConfirm={handleSubmit}
      confirmText="Add User"
      error={error}
      onErrorDismiss={() => setError(null)}
      disableConfirm={!formData.name || !formData.email}
      wrapInForm // This wraps content in a form for proper submission
    >
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter name"
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="Enter email"
          />
        </Form.Group>
      </Form>
    </BaseModal>
  );
};

// Example 4: Custom Footer Modal
export const CustomFooterExample = () => {
  const [show, setShow] = useState(false);
  
  const customFooter = (
    <>
      <Button variant="secondary" onClick={() => setShow(false)}>
        Close
      </Button>
      <Button variant="info" onClick={() => console.log('Custom action')}>
        Custom Action
      </Button>
      <Button variant="primary" onClick={() => console.log('Save')}>
        Save Changes
      </Button>
    </>
  );
  
  return (
    <BaseModal
      show={show}
      onHide={() => setShow(false)}
      title="Custom Footer Modal"
      footer={customFooter}
    >
      <p>This modal has a completely custom footer with multiple actions.</p>
    </BaseModal>
  );
};

// Example 5: Success Modal with Auto-close
export const SuccessModalExample = () => {
  const [show, setShow] = useState(false);
  
  return (
    <BaseModal
      show={show}
      onHide={() => setShow(false)}
      title="Success!"
      variant="success"
      icon={<BsCheckCircle size={60} />}
      centered
      showCancel={false}
      onConfirm={() => setShow(false)}
      confirmText="OK"
    >
      <div className="text-center">
        <h5>Operation completed successfully!</h5>
        <p className="text-muted">Your changes have been saved.</p>
      </div>
    </BaseModal>
  );
};

// Example 6: Warning Modal with Custom Header
export const WarningModalExample = () => {
  const [show, setShow] = useState(false);
  
  return (
    <BaseModal
      show={show}
      onHide={() => setShow(false)}
      title="Warning"
      headerVariant="warning"
      variant="warning"
      icon={<BsExclamationTriangle size={50} />}
      iconVariant="warning"
      onConfirm={() => console.log('Acknowledged')}
      confirmText="I Understand"
      cancelText="Go Back"
    >
      <Alert variant="warning">
        <strong>Important:</strong> This action may have unintended consequences.
      </Alert>
      <p>Please review the following before proceeding:</p>
      <ul>
        <li>All related data will be affected</li>
        <li>This change is difficult to reverse</li>
        <li>Users may experience temporary disruption</li>
      </ul>
    </BaseModal>
  );
};

// Example 7: Migration from inline Modal
// Before:
/*
<Modal show={show} onHide={onHide}>
  <Modal.Header closeButton>
    <Modal.Title>Delete Tag</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <p>Are you sure you want to delete this tag?</p>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={onHide}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete}>Delete</Button>
  </Modal.Footer>
</Modal>
*/

// After:
export const MigratedModalExample = () => {
  const [show, setShow] = useState(false);
  
  return (
    <BaseModal
      show={show}
      onHide={() => setShow(false)}
      title="Delete Tag"
      variant="danger"
      onConfirm={handleDelete}
      confirmText="Delete"
    >
      <p>Are you sure you want to delete this tag?</p>
    </BaseModal>
  );
};