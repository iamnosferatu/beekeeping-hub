// frontend/src/components/editor/WysiwygEditor.js
import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Button, Spinner } from "react-bootstrap";
import "./WysiwygEditor.scss";

const WysiwygEditor = ({ value, onChange, height = "400px" }) => {
  const [editorValue, setEditorValue] = useState(value || "");
  const [isLoading, setIsLoading] = useState(true);
  const quillRef = useRef(null);

  // Update internal value when prop changes
  useEffect(() => {
    setEditorValue(value || "");
  }, [value]);

  // Simulate loading delay to match the behavior of the previous editor
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle editor change
  const handleChange = (content) => {
    setEditorValue(content);
    if (onChange) {
      onChange(content);
    }
  };

  // Quill modules configuration
  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ color: [] }, { background: [] }],
        ["link", "image", "video"],
        ["blockquote", "code-block"],
        ["clean"],
      ],
    },
    clipboard: {
      // Allow pasting HTML from Word, Google Docs, etc.
      matchVisual: false,
    },
  };

  // Quill formats to enable
  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background",
    "blockquote",
    "code-block",
  ];

  // Helper to insert an image from URL
  const insertImage = () => {
    const url = prompt("Enter the image URL:");
    if (url) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", url);
    }
  };

  // Helper to insert a table (not supported by Quill by default)
  const insertTable = () => {
    alert(
      "Table insertion is not supported in the basic Quill editor. For complex tables, consider using HTML code blocks."
    );
  };

  // Helper to get word count
  const getWordCount = () => {
    const text = editorValue.replace(/<[^>]+>/g, " ");
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  };

  if (isLoading) {
    return (
      <div className="text-center py-5" style={{ height }}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading editor...</p>
      </div>
    );
  }

  return (
    <div className="wysiwyg-editor">
      {/* Custom buttons for functionality not included in toolbar */}
      <div className="editor-extras mb-2">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={insertImage}
          className="me-2"
        >
          Insert Image from URL
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={insertTable}>
          Insert Table
        </Button>
      </div>

      {/* The Quill Editor */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={editorValue}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        style={{ height }}
      />

      {/* Word counter */}
      <div className="d-flex justify-content-between mt-2 text-muted">
        <small>{getWordCount()} words</small>
        <small>HTML formatting supported</small>
      </div>
    </div>
  );
};

export default WysiwygEditor;
