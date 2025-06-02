// frontend/src/components/ads/AdBlock.js

import React, { useEffect, useRef, useState } from 'react';
import { adManager, isAdsEnabled, isMobileDevice } from '../../utils/adManager';
import GoogleAdSenseBlock from './GoogleAdSenseBlock';
import DirectSponsorBlock from './DirectSponsorBlock';
import AffiliateBlock from './AffiliateBlock';
import CustomHtmlBlock from './CustomHtmlBlock';

/**
 * Main advertisement component that renders different ad types
 * based on configuration and feature flags
 */
const AdBlock = ({ 
  placement, 
  className = '', 
  style = {},
  pageType = 'general',
  fallbackContent = null 
}) => {
  const adRef = useRef(null);
  const [ads, setAds] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if ads are enabled globally
    if (!isAdsEnabled()) {
      setIsVisible(false);
      return;
    }

    // Get ads for this placement
    const loadAds = async () => {
      try {
        await adManager.init();
        
        const availableAds = adManager.getAdsForPlacement(placement, {
          isMobile: isMobileDevice(),
          pageType,
          limit: 1 // For now, show one ad per placement
        });

        if (availableAds.length === 0) {
          setIsVisible(false);
          return;
        }

        setAds(availableAds);
        setIsVisible(true);

        // Set up viewability tracking for the first ad
        if (availableAds[0] && adRef.current) {
          adManager.observeAd(adRef.current, availableAds[0].id, placement);
        }
      } catch (err) {
        console.error('Error loading ads:', err);
        setError(err.message);
        setIsVisible(false);
      }
    };

    loadAds();
  }, [placement, pageType]);

  // Handle ad click tracking
  const handleAdClick = (adId) => {
    adManager.recordClick(adId, placement);
  };

  // Don't render if ads disabled or no ads available
  if (!isVisible || ads.length === 0) {
    return fallbackContent;
  }

  // Don't render if there's an error
  if (error) {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="alert alert-warning" role="alert">
          <small>Ad Error: {error}</small>
        </div>
      );
    }
    return fallbackContent;
  }

  const ad = ads[0]; // Show the first (highest priority) ad

  const renderAdContent = () => {
    switch (ad.provider) {
      case 'google_adsense':
        return (
          <GoogleAdSenseBlock
            ad={ad}
            onAdClick={() => handleAdClick(ad.id)}
          />
        );
      
      case 'direct_sponsor':
        return (
          <DirectSponsorBlock
            ad={ad}
            onAdClick={() => handleAdClick(ad.id)}
          />
        );
      
      case 'affiliate':
        return (
          <AffiliateBlock
            ad={ad}
            onAdClick={() => handleAdClick(ad.id)}
          />
        );
      
      case 'custom_html':
        return (
          <CustomHtmlBlock
            ad={ad}
            onAdClick={() => handleAdClick(ad.id)}
          />
        );
      
      default:
        return (
          <div className="ad-placeholder">
            <p>Advertisement</p>
          </div>
        );
    }
  };

  return (
    <div 
      ref={adRef}
      className={`ad-block ad-${placement} ${className}`}
      style={style}
      data-ad-id={ad.id}
      data-placement={placement}
    >
      {/* Ad label for transparency */}
      <div className="ad-label">
        <small className="text-muted">Advertisement</small>
      </div>
      
      {/* Ad content */}
      <div className="ad-content">
        {renderAdContent()}
      </div>
      
      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="ad-debug-info">
          <small style={{ fontSize: '10px', color: '#666' }}>
            ID: {ad.id} | Placement: {placement} | Provider: {ad.provider}
          </small>
        </div>
      )}
    </div>
  );
};

export default AdBlock;