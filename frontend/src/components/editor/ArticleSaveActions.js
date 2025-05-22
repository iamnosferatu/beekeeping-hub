// frontend/src/components/editor/ArticleSaveActions.js
import React from "react";
import { Button, Spinner } from "react-bootstrap";
import { BsCheck2Circle, BsSave } from "react-icons/bs";

const ArticleSaveActions = ({ saving, formData, handleSave, isEditMode }) => (
  <div className="d-grid gap-2">
    <Button variant="primary" type="submit" disabled={saving}>
      {saving ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          Saving...
        </>
      ) : (
        <>
          <BsCheck2Circle className="me-2" />
          {formData.status === "published" ? "Publish" : "Save and Publish"}
        </>
      )}
    </Button>

    <Button
      variant="outline-secondary"
      type="button"
      onClick={(e) => handleSave(e, true)}
      disabled={saving}
    >
      <BsSave className="me-2" />
      Save as Draft
    </Button>

    {isEditMode && (
      <Button
        variant="outline-danger"
        type="button"
        onClick={() => setShowDeleteConfirm(true)}
        disabled={saving}
      >
        <BsTrash className="me-2" />
        Delete Article
      </Button>
    )}
  </div>
);

export default ArticleSaveActions;
