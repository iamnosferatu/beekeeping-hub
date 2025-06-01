// components/common/PromptDialog.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

/**
 * Reusable prompt dialog component
 * Replaces window.prompt() with a proper modal
 */
const PromptDialog = ({
  show,
  onHide,
  onSubmit,
  title = "Enter Information",
  message = "Please enter the required information:",
  placeholder = "",
  defaultValue = "",
  submitText = "Submit",
  cancelText = "Cancel",
  inputType = "text",
  required = false
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, show]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (required && !value.trim()) return;
    
    onSubmit(value);
    onHide();
    setValue("");
  };

  const handleCancel = () => {
    onHide();
    setValue("");
  };

  return (
    <Modal show={show} onHide={handleCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="mb-3">{message}</p>
          <Form.Group>
            <Form.Control
              type={inputType}
              placeholder={placeholder}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required={required}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancel}>
            {cancelText}
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={required && !value.trim()}
          >
            {submitText}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PromptDialog;