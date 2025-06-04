import React from 'react';
import { Form, Alert, Spinner } from 'react-bootstrap';
import BaseModal from '../../common/BaseModal';

/**
 * Tag Edit Modal - Example of refactored admin modal using BaseModal
 * This demonstrates how to replace inline modals in admin pages
 */
const TagEditModal = ({
  show,
  onHide,
  formData,
  setFormData,
  onUpdate,
  loading,
  error,
  onErrorDismiss,
  selectedTag
}) => {
  return (
    <BaseModal
      show={show}
      onHide={onHide}
      title="Edit Tag"
      size="lg"
      variant="primary"
      onConfirm={onUpdate}
      confirmText={loading ? "Updating..." : "Update Tag"}
      loading={loading}
      error={error}
      onErrorDismiss={onErrorDismiss}
      disableConfirm={!formData.name.trim()}
      closeOnConfirm={false} // Let the parent handle closing after successful update
    >
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>
            Tag Name <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData(prevData => ({ ...prevData, name: e.target.value }))
            }
            placeholder="Enter tag name"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Slug</Form.Label>
          <Form.Control
            type="text"
            value={formData.slug}
            onChange={(e) =>
              setFormData(prevData => ({ ...prevData, slug: e.target.value }))
            }
            placeholder="tag-slug"
          />
          <Form.Text className="text-muted">
            Changing the slug will break existing links to this tag.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData(prevData => ({ ...prevData, description: e.target.value }))
            }
            placeholder="Optional description for this tag"
          />
        </Form.Group>
      </Form>

      {selectedTag?.article_count > 0 && (
        <Alert variant="info">
          This tag is used by {selectedTag.article_count} article
          {selectedTag.article_count !== 1 ? "s" : ""}. Changes will affect
          all tagged articles.
        </Alert>
      )}
    </BaseModal>
  );
};

export default TagEditModal;