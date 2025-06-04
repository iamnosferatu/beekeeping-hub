// frontend/src/components/ads/AffiliateBlock.js

import React from 'react';

/**
 * Affiliate advertisement component (Amazon Associates, etc.)
 */
const AffiliateBlock = ({ ad, onAdClick }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onAdClick();
    
    // Open affiliate link
    if (ad.content.affiliateUrl) {
      window.open(ad.content.affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="affiliate-block card"
      style={{
        width: ad.size.width === '100%' ? '100%' : `${ad.size.width}px`,
        height: ad.size.height === 'auto' ? 'auto' : `${ad.size.height}px`,
        cursor: 'pointer',
        margin: '0 auto'
      }}
      onClick={handleClick}
    >
      <div className="card-body p-3">
        {/* Affiliate disclosure */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <span className="badge bg-info">
            {ad.content.provider === 'amazon' ? 'Amazon Associate' : 'Affiliate Link'}
          </span>
          {ad.content.rating && (
            <div className="text-warning">
              {'★'.repeat(Math.floor(ad.content.rating))}
              {'☆'.repeat(5 - Math.floor(ad.content.rating))}
              <small className="text-muted ms-1">({ad.content.rating})</small>
            </div>
          )}
        </div>
        
        {/* Product content */}
        <div className="row g-2">
          {ad.content.image && (
            <div className="col-4">
              <img 
                src={ad.content.image} 
                alt={ad.content.productName}
                className="img-fluid rounded"
                style={{ 
                  width: '100%',
                  height: '80px',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
          
          <div className={ad.content.image ? 'col-8' : 'col-12'}>
            {ad.content.productName && (
              <h6 className="card-title mb-1" style={{ fontSize: '14px' }}>
                {ad.content.productName}
              </h6>
            )}
            
            {ad.content.price && (
              <div className="mb-1">
                <span className="fw-bold text-primary">{ad.content.price}</span>
                {ad.content.originalPrice && (
                  <span className="text-muted text-decoration-line-through ms-2">
                    {ad.content.originalPrice}
                  </span>
                )}
              </div>
            )}
            
            {ad.content.description && (
              <p className="card-text small text-muted mb-2">
                {ad.content.description.length > 80 
                  ? `${ad.content.description.substring(0, 80)}...`
                  : ad.content.description
                }
              </p>
            )}
          </div>
        </div>
        
        {/* Call to action */}
        <div className="text-center mt-2">
          <button className="btn btn-warning btn-sm w-100">
            {ad.content.callToAction || 'View on Amazon'}
          </button>
        </div>
        
        {/* Prime badge if applicable */}
        {ad.content.isPrime && (
          <div className="text-center mt-1">
            <small className="badge bg-primary">Prime Eligible</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateBlock;