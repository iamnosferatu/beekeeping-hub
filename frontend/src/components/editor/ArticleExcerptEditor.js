// frontend/src/components/editor/ArticleExcerptEditor.js
import React from "react";
import { Form, Card, Button } from "react-bootstrap";

const ArticleExcerptEditor = ({
  formData,
  handleInputChange,
  generateExcerpt,
}) => (
  <Card className="mb-4">
    <Card.Header>
      <h5 className="mb-0">Excerpt</h5>
    </Card.Header>
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Form.Label>Article excerpt (displayed in article listings)</Form.Label>
        <Button
          variant="outline-secondary"
          size="sm"
          type="button"
          onClick={generateExcerpt}
        >
          Generate from content
        </Button>
      </div>
      <Form.Control
        as="textarea"
        rows={3}
        name="excerpt"
        value={formData.excerpt}
        onChange={handleInputChange}
        placeholder="Enter a brief excerpt or summary of your article"
      />
      <Form.Text className="text-muted">
        If left empty, an excerpt will be automatically generated from your
        content.
      </Form.Text>
    </Card.Body>
  </Card>
);

export default ArticleExcerptEditor;
