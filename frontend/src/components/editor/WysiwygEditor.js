// frontend/src/components/editor/WysiwygEditor.js
import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import "react-quill/dist/quill.snow.css";

// Lazy load ReactQuill to reduce initial bundle size
const ReactQuill = lazy(() => import("react-quill"));
import { Button, Spinner, Alert } from "react-bootstrap";
import ImageUploadButton from "./ImageUploadButton";
import useArticleImageUpload from "../../hooks/api/useArticleImageUpload";
import { ASSETS_URL } from "../../config";
import "./WysiwygEditor.scss";
import PromptDialog from "../common/PromptDialog";
import ErrorAlert from "../common/ErrorAlert";

const WysiwygEditor = ({ value, onChange, height = "400px" }) => {
  const [editorValue, setEditorValue] = useState(value || "");
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [featureError, setFeatureError] = useState(null);
  const quillRef = useRef(null);
  const { uploadImage } = useArticleImageUpload();

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
        ["link", "video"], // Removed "image" from toolbar since we have custom upload
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
    setShowImageDialog(true);
  };

  const handleImageInsert = (url) => {
    if (url && url.trim()) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", url.trim());
    }
  };

  // Helper to insert a table (not supported by Quill by default)
  const insertTable = () => {
    setFeatureError(
      "Table insertion is not supported in the basic Quill editor. For complex tables, consider using HTML code blocks."
    );
  };

  // Helper to get word count
  const getWordCount = () => {
    const text = editorValue.replace(/<[^>]+>/g, " ");
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  };

  // Handle image upload
  const handleImageUploaded = ({ url }) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", url);
      quill.setSelection(range.index + 1);
    }
  };

  // Upload image file and return URL
  const uploadImageFile = async (file) => {
    try {
      setUploadingImage(true);
      setUploadError(null);
      const result = await uploadImage(file);
      return `${ASSETS_URL}${result.url}`;
    } catch (error) {
      // Image upload failed, error handled
      setUploadError(error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Extract images from paste data and upload them
  const handlePaste = async (e) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const clipboardData = e.clipboardData || window.clipboardData;
    const items = clipboardData.items;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        const url = await uploadImageFile(file);
        if (url) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', url);
          quill.setSelection(range.index + 1);
        }
        return;
      }
    }
  };

  // Handle drag and drop
  const handleDrop = async (e) => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const files = e.dataTransfer.files;
    
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.indexOf('image') !== -1) {
        e.preventDefault();
        e.stopPropagation();
        
        const url = await uploadImageFile(files[i]);
        if (url) {
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', url);
          quill.setSelection(range.index + 1);
        }
        return;
      }
    }
  };

  // Setup Quill to handle paste and drop events
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      // Override paste handling
      quill.root.addEventListener('paste', handlePaste, true);
      quill.root.addEventListener('drop', handleDrop, true);
      
      // Prevent default drag over to allow drop
      quill.root.addEventListener('dragover', (e) => {
        e.preventDefault();
      });
      
      // Clean up
      return () => {
        quill.root.removeEventListener('paste', handlePaste, true);
        quill.root.removeEventListener('drop', handleDrop, true);
      };
    }
  }, [isLoading]);

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
      {/* Upload status alerts */}
      {uploadingImage && (
        <Alert variant="info" className="mb-2">
          <Spinner animation="border" size="sm" className="me-2" />
          Uploading image...
        </Alert>
      )}
      {uploadError && (
        <Alert variant="danger" dismissible className="mb-2" onClose={() => setUploadError(null)}>
          Image upload failed: {uploadError}
        </Alert>
      )}

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
        <ImageUploadButton 
          onImageUploaded={handleImageUploaded}
          size="sm"
          variant="outline-secondary"
        />
        <Button 
          variant="outline-secondary" 
          size="sm" 
          onClick={insertTable}
          className="ms-2"
        >
          Insert Table
        </Button>
      </div>

      {/* The Quill Editor */}
      <Suspense fallback={
        <div className="text-center py-5" style={{ height }}>
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading editor...</p>
        </div>
      }>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={editorValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          style={{ height }}
        />
      </Suspense>

      {/* Word counter */}
      <div className="d-flex justify-content-between mt-2 text-muted">
        <small>{getWordCount()} words</small>
        <small>HTML formatting supported</small>
      </div>

      {/* Feature Error Alert */}
      <ErrorAlert 
        error={featureError}
        variant="info"
        onDismiss={() => setFeatureError(null)}
        className="mt-2"
        showIcon={false}
      />

      {/* Image URL Dialog */}
      <PromptDialog
        show={showImageDialog}
        onHide={() => setShowImageDialog(false)}
        onSubmit={handleImageInsert}
        title="Insert Image"
        message="Enter the image URL:"
        placeholder="https://example.com/image.jpg"
        submitText="Insert"
        inputType="url"
        required={true}
      />
    </div>
  );
};

export default WysiwygEditor;
