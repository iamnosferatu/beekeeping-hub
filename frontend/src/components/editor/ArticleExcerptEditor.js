// frontend/src/components/editor/ArticleExcerptEditor.js
import React from "react";
import { Card, Form, Button } from "react-bootstrap";
import { BsArrowRepeat } from "react-icons/bs";

/**
 * ArticleExcerptEditor Component
 *
 * Allows editing of the article excerpt with auto-generation option
 */
const ArticleExcerptEditor = ({
  formData,
  handleInputChange,
  generateExcerpt,
}) => {
  /**
   * Character count for excerpt
   */
  const excerptLength = formData.excerpt ? formData.excerpt.length : 0;
  const maxLength = 200;

  return (
    <Card className="mb-4">
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Article Excerpt</h5>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={generateExcerpt}
            disabled={!formData.content}
            title="Generate excerpt from content"
          >
            <BsArrowRepeat className="me-1" />
            Auto-generate
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <Form.Group>
          <Form.Control
            as="textarea"
            rows={3}
            name="excerpt"
            value={formData.excerpt}
            onChange={handleInputChange}
            placeholder="Brief description of your article (optional)"
            maxLength={maxLength}
          />
          <Form.Text className="text-muted">
            {excerptLength}/{maxLength} characters
            {!formData.excerpt && " - Will be auto-generated if left empty"}
          </Form.Text>
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default ArticleExcerptEditor;
