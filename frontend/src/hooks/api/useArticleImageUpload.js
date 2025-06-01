// frontend/src/hooks/api/useArticleImageUpload.js
import { useState } from 'react';
import api from '../../services/api';

export const useArticleImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

  const uploadImage = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);

    const formData = new FormData();
    formData.append('image', file);

    // FormData prepared for upload

    try {
      const response = await api.client.post('/articles/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: [function (data, headers) {
          // Delete the Content-Type header to let axios set it with boundary
          delete headers['Content-Type'];
          return data;
        }],
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setUploading(false);
      setUploadProgress(100);
      return response.data;
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      // Upload failed, error details processed
      const errorMessage = error.response?.data?.message || error.message || 'Failed to upload image';
      setUploadError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteImage = async (filename) => {
    try {
      const response = await api.client.delete(`/articles/delete-image/${filename}`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete image';
      throw new Error(errorMessage);
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    uploadProgress,
    uploadError,
  };
};

export default useArticleImageUpload;