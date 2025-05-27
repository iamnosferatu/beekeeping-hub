// frontend/src/components/editor/ArticleActions.js
import React, { useState } from "react";
import { Card, Button, Spinner } from "react-bootstrap";
import { BsSave, BsTrash, BsEye } from "react-icons/bs";
import { Link } from "react-router-dom";

/**
 * ArticleActions Component
 *
 * Action buttons for saving, deleting, and previewing articles
 */
const ArticleActions = ({ isEditMode, formData, onSave, onDelete }) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /**
   * Handle save action
   */
  const handleSave = async (e, saveAsDraft = false) => {
    setSaving(true);
    try {
      const result = await onSave(e, saveAsDraft);
      if (result.success) {
        // Show success message or handle success
        console.log("Article saved successfully");
      } else if (result.error) {
        alert(result.error);
      }
    } catch (error) {
      console.error("Error saving article:", error);
      alert("Failed to save article. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle delete action
   */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this article?")) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete();
    } catch (error) {
      console.error("Error deleting article:", error);
      alert("Failed to delete article. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Actions</h5>
      </Card.Header>
      <Card.Body>
        <div className="d-grid gap-2">
          {/* Save/Publish Button */}
          <Button
            variant="primary"
            onClick={(e) => handleSave(e, false)}
            disabled={saving || !formData.title || !formData.content}
          >
            {saving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              <>
                <BsSave className="me-2" />
                {formData.status === "published" ? "Update" : "Publish"}
              </>
            )}
          </Button>

          {/* Save as Draft Button */}
          {formData.status !== "draft" && (
            <Button
              variant="secondary"
              onClick={(e) => handleSave(e, true)}
              disabled={saving || !formData.title || !formData.content}
            >
              Save as Draft
            </Button>
          )}

          {/* Preview Button (if article is saved) */}
          {isEditMode && formData.slug && (
            <Button
              as={Link}
              to={`/articles/${formData.slug}`}
              target="_blank"
              variant="outline-primary"
            >
              <BsEye className="me-2" />
              Preview
            </Button>
          )}

          {/* Delete Button (only in edit mode) */}
          {isEditMode && (
            <Button
              variant="outline-danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Deleting...
                </>
              ) : (
                <>
                  <BsTrash className="me-2" />
                  Delete Article
                </>
              )}
            </Button>
          )}
        </div>

        {/* Save hint */}
        <div className="mt-3 text-muted small">
          <p className="mb-0">
            • Articles must have a title and content to be saved
          </p>
          {formData.status === "draft" && (
            <p className="mb-0">
              • Publishing will make the article visible to all users
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ArticleActions;
