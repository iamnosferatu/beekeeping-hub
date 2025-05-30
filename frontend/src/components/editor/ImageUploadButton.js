// frontend/src/components/editor/ImageUploadButton.js
import React, { useRef } from 'react';
import { Button, Spinner, ProgressBar, Alert } from 'react-bootstrap';
import { BsImageFill, BsUpload } from 'react-icons/bs';
import useArticleImageUpload from '../../hooks/api/useArticleImageUpload';
import { ASSETS_URL } from '../../config';

const ImageUploadButton = ({ onImageUploaded, size = "sm", variant = "outline-secondary" }) => {
  const fileInputRef = useRef(null);
  const { uploadImage, uploading, uploadProgress, uploadError } = useArticleImageUpload();

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      console.log('Starting upload for file:', file.name, 'Size:', file.size, 'Type:', file.type);
      const result = await uploadImage(file);
      console.log('Upload result:', result);
      const fullUrl = `${ASSETS_URL}${result.url}`;
      
      if (onImageUploaded) {
        onImageUploaded({
          url: fullUrl,
          filename: result.filename,
          markdown: `![${file.name}](${fullUrl})`,
        });
      }
    } catch (error) {
      console.error('Upload failed:', error);
      // Show more detailed error
      alert(`Upload failed: ${error.message}`);
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

      {uploadError && (
        <Alert variant="danger" className="mt-2 mb-0" dismissible>
          {uploadError}
        </Alert>
      )}
    </>
  );
};

export default ImageUploadButton;