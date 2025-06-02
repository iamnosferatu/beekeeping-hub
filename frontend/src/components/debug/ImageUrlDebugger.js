// frontend/src/components/debug/ImageUrlDebugger.js

import React, { useEffect, useState } from 'react';
import { getImageUrl } from '../../utils/imageHelpers';
import { API_URL, ASSETS_URL } from '../../config';

/**
 * Debug component to check image URL generation
 */
const ImageUrlDebugger = ({ imagePath }) => {
  const [backendStatus, setBackendStatus] = useState('Testing...');
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const processedUrl = getImageUrl(imagePath);
  
  useEffect(() => {
    // Test backend connectivity
    const testBackend = async () => {
      try {
        const response = await fetch(ASSETS_URL + '/health', { 
          method: 'GET',
          timeout: 3000 
        });
        if (response.ok) {
          setBackendStatus('✅ Reachable');
        } else {
          setBackendStatus(`❌ Error ${response.status}`);
        }
      } catch (error) {
        setBackendStatus(`❌ ${error.message}`);
        
        // Also test if the image file specifically exists
        try {
          const imageResponse = await fetch(processedUrl, { 
            method: 'HEAD',
            timeout: 3000 
          });
          if (imageResponse.ok) {
            setBackendStatus(`⚠️ Backend unreachable but image accessible`);
          }
        } catch (imageError) {
          setBackendStatus(`❌ Backend and image both unreachable`);
        }
      }
    };
    
    testBackend();
  }, [processedUrl]);

  return (
    <div style={{ 
      background: '#343a40', 
      color: '#ffffff',
      border: '1px solid #dee2e6', 
      borderRadius: '4px', 
      padding: '8px', 
      margin: '8px 0',
      fontSize: '12px',
      fontFamily: 'monospace'
    }}>
      <strong>🔍 Image URL Debug:</strong><br/>
      <strong>Original path:</strong> {imagePath || 'null/undefined'}<br/>
      <strong>Original length:</strong> {imagePath ? imagePath.length : 'N/A'}<br/>
      <strong>Starts with /uploads/:</strong> {imagePath ? imagePath.startsWith('/uploads/').toString() : 'N/A'}<br/>
      <strong>API_URL:</strong> {API_URL}<br/>
      <strong>ASSETS_URL:</strong> {ASSETS_URL}<br/>
      <strong>Processed URL:</strong> {processedUrl}<br/>
      <strong>Processed length:</strong> {processedUrl ? processedUrl.length : 'N/A'}<br/>
      <strong>File extension missing:</strong> {(imagePath && processedUrl && imagePath.includes('.') && !processedUrl.includes('.')) ? 'YES - PROBLEM!' : 'No'}<br/>
      <strong>Test:</strong> <a href={processedUrl} target="_blank" rel="noopener noreferrer" style={{color: '#17a2b8'}}>Open in new tab</a><br/>
      <strong>Backend reachable:</strong> <span>{backendStatus}</span>
    </div>
  );
};

export default ImageUrlDebugger;