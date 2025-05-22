// frontend/src/components/editor/ArticleForm.js
import React from "react";
import { Form, Card } from "react-bootstrap";
import WysiwygEditor from "./WysiwygEditor";

const ArticleForm = ({ formData, handleInputChange, handleContentChange }) => (
  <Card className="mb-4">
    <Card.Body>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter article title"
          required
        />
      </Form.Group>

      <WysiwygEditor
        value={formData.content}
        onChange={handleContentChange}
        height="500px"
      />
    </Card.Body>
  </Card>
);

export default ArticleForm;
