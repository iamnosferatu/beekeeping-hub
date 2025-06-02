// frontend/src/components/ads/DirectSponsorBlock.js

import React from 'react';

/**
 * Direct sponsor advertisement component
 */
const DirectSponsorBlock = ({ ad, onAdClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onAdClick();
    
    // If there's a URL, open it
    if (ad.content.url) {
      window.open(ad.content.url, '_blank', 'noopener,noreferrer');
    }
  };

  // If we have custom HTML content, render it
  if (ad.content.html) {
    return (
      <div 
        className="direct-sponsor-block"
        style={{
          width: ad.size.width === '100%' ? '100%' : `${ad.size.width}px`,
          height: ad.size.height === 'auto' ? 'auto' : `${ad.size.height}px`,
          cursor: 'pointer'
        }}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: ad.content.html }}
      />
    );
  }

  // Otherwise render structured content
  return (
    <div 
      className="direct-sponsor-block card"
      style={{
        width: ad.size.width === '100%' ? '100%' : `${ad.size.width}px`,
        height: ad.size.height === 'auto' ? 'auto' : `${ad.size.height}px`,
        cursor: 'pointer',
        border: '1px solid #e9ecef'
      }}
      onClick={handleClick}
    >
      <div className="card-body p-3">
        {/* Sponsored label */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-secondary">Sponsored</span>
          {ad.content.logo && (
            <img 
              src={ad.content.logo} 
              alt="Sponsor" 
              style={{ height: '20px', objectFit: 'contain' }}
            />
          )}
        </div>
        
        {/* Main content */}
        <div className="text-center">
          {ad.content.image && (
            <img 
              src={ad.content.image} 
              alt={ad.content.title || 'Sponsored Content'}
              className="img-fluid mb-2"
              style={{ 
                maxWidth: '100%', 
                maxHeight: ad.size.height ? `${ad.size.height - 60}px` : '200px',
                objectFit: 'cover'
              }}
            />
          )}
          
          {ad.content.title && (
            <h6 className="card-title mb-2">{ad.content.title}</h6>
          )}
          
          {ad.content.description && (
            <p className="card-text small text-muted mb-2">
              {ad.content.description}
            </p>
          )}
          
          {ad.content.callToAction && (
            <button className="btn btn-primary btn-sm">
              {ad.content.callToAction}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectSponsorBlock;