// frontend/src/components/ads/GoogleAdSenseBlock.js

import React, { useEffect, useRef } from 'react';

/**
 * Google AdSense advertisement component
 */
const GoogleAdSenseBlock = ({ ad, onAdClick }) => {
  const adRef = useRef(null);

  useEffect(() => {
    // Load Google AdSense script if not already loaded
    if (!window.adsbygoogle && ad.content.slotId !== 'ca-pub-XXXXXXXX/XXXXXXXX') {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Initialize AdSense ad
    if (window.adsbygoogle && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
      }
    }
  }, [ad.content.slotId]);

  // For demo purposes, show placeholder if using default slot ID
  if (ad.content.slotId === 'ca-pub-XXXXXXXX/XXXXXXXX') {
    return (
      <div 
        className="adsense-placeholder"
        style={{
          width: ad.size.width,
          height: ad.size.height,
          backgroundColor: '#f8f9fa',
          border: '1px dashed #dee2e6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          textAlign: 'center',
          cursor: 'pointer'
        }}
        onClick={onAdClick}
      >
        <div className="text-muted">
          <i className="fas fa-ad" style={{ fontSize: '24px', marginBottom: '8px' }}></i>
          <div>Google AdSense</div>
          <small>({ad.size.width}x{ad.size.height})</small>
        </div>
      </div>
    );
  }

  return (
    <div className="adsense-block" onClick={onAdClick}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: ad.size.width === '100%' ? '100%' : `${ad.size.width}px`,
          height: ad.size.height === 'auto' ? 'auto' : `${ad.size.height}px`
        }}
        data-ad-client={ad.content.slotId.split('/')[0]}
        data-ad-slot={ad.content.slotId.split('/')[1]}
        data-ad-format={ad.content.format || 'auto'}
        data-full-width-responsive={ad.content.responsive !== false ? 'true' : 'false'}
      />
    </div>
  );
};

export default GoogleAdSenseBlock;