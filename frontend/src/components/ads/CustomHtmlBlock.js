// frontend/src/components/ads/CustomHtmlBlock.js

import React from 'react';

/**
 * Custom HTML advertisement component
 */
const CustomHtmlBlock = ({ ad, onAdClick }) => {
  const handleClick = () => {
    onAdClick();
  };

  return (
    <div 
      className="custom-html-block"
      style={{
        width: ad.size.width === '100%' ? '100%' : `${ad.size.width}px`,
        height: ad.size.height === 'auto' ? 'auto' : `${ad.size.height}px`,
        cursor: ad.content.clickable !== false ? 'pointer' : 'default',
        margin: '0 auto'
      }}
      onClick={ad.content.clickable !== false ? handleClick : undefined}
      dangerouslySetInnerHTML={{ __html: ad.content.html }}
    />
  );
};

export default CustomHtmlBlock;