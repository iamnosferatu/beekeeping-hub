// frontend/src/components/editor/ArticleForm.js
import React from "react";
import { Card, Form } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

/**
 * ArticleForm Component
 *
 * Main form for editing article title and content
 * Uses ReactQuill for rich text editing
 */
const ArticleForm = ({ formData, handleInputChange, handleContentChange }) => {
  // Quill editor configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "link",
    "image",
  ];

  return (
    <Card className="mb-4">
      <Card.Body>
        {/* Article Title */}
        <Form.Group className="mb-4">
          <Form.Label>Article Title</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter article title"
            size="lg"
            required
          />
        </Form.Group>

        {/* Article Content */}
        <Form.Group>
          <Form.Label>Content</Form.Label>
          <ReactQuill
            theme="snow"
            value={formData.content}
            onChange={handleContentChange}
            modules={modules}
            formats={formats}
            placeholder="Write your article content here..."
            style={{ minHeight: "400px", marginBottom: "60px" }}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default ArticleForm;
