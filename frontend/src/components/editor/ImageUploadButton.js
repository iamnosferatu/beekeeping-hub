// frontend/src/components/editor/ImageUploadButton.js
import React, { useRef } from 'react';
import { Button, Spinner, ProgressBar, Alert } from 'react-bootstrap';
import { BsImageFill, BsUpload } from 'react-icons/bs';
import useArticleImageUpload from '../../hooks/api/useArticleImageUpload';
import { ASSETS_URL } from '../../config';

const ImageUploadButton = ({ onImageUploaded, size = "sm", variant = "outline-secondary" }) => {
  const fileInputRef = useRef(null);
  const { uploadImage, uploading, uploadProgress, uploadError } = useArticleImageUpload();
  const [validationError, setValidationError] = React.useState(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setValidationError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setValidationError('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setValidationError('File size must be less than 10MB');
      return;
    }

    try {
      // Starting file upload
      const result = await uploadImage(file);
      const fullUrl = `${ASSETS_URL}${result.url}`;
      
      if (onImageUploaded) {
        onImageUploaded({
          url: fullUrl,
          filename: result.filename,
          markdown: `![${file.name}](${fullUrl})`,
        });
      }
    } catch (error) {
      // Upload failed, error handled by hook
      // Error already handled by the hook
    }

    // Reset file input
    event.target.value = '';
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <Button
        size={size}
        variant={variant}
        onClick={handleButtonClick}
        disabled={uploading}
        className="d-inline-flex align-items-center gap-2"
      >
        {uploading ? (
          <>
            <Spinner animation="border" size="sm" />
            Uploading... {uploadProgress}%
          </>
        ) : (
          <>
            <BsImageFill />
            Upload Image
          </>
        )}
      </Button>

      {uploading && uploadProgress > 0 && (
        <ProgressBar 
          now={uploadProgress} 
          label={`${uploadProgress}%`}
          className="mt-2"
          style={{ height: '10px' }}
        />
      )}

      {validationError && (
        <Alert variant="warning" className="mt-2 mb-0" dismissible onClose={() => setValidationError(null)}>
          {validationError}
        </Alert>
      )}

      {uploadError && (
        <Alert variant="danger" className="mt-2 mb-0" dismissible>
          {uploadError}
        </Alert>
      )}
    </>
  );
};

export default ImageUploadButton;