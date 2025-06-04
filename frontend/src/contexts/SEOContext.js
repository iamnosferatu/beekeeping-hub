// frontend/src/contexts/SEOContext.js
import React, { createContext, useContext } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

/**
 * SEO Context for managing meta tags and structured data
 */
const SEOContext = createContext();

/**
 * Default SEO configuration
 */
const DEFAULT_SEO = {
  siteName: "BeeKeeper's Hub",
  defaultTitle: "BeeKeeper's Hub - Your Guide to Beekeeping",
  titleTemplate: "%s | BeeKeeper's Hub",
  defaultDescription: "Discover expert beekeeping tips, guides, and community insights. Join our community of beekeepers to learn about hive management, honey production, and sustainable beekeeping practices.",
  siteUrl: process.env.REACT_APP_SITE_URL || "https://beekeepershub.com",
  defaultImage: "/images/og-image.jpg",
  twitterHandle: "@beekeepershub",
  locale: "en_US",
};

/**
 * SEO Provider Component
 */
export const SEOProvider = ({ children }) => {
  const location = useLocation();
  const currentUrl = `${DEFAULT_SEO.siteUrl}${location.pathname}`;

  return (
    <HelmetProvider>
      <SEOContext.Provider value={{ ...DEFAULT_SEO, currentUrl }}>
        {children}
      </SEOContext.Provider>
    </HelmetProvider>
  );
};

/**
 * SEO Component for setting page-specific meta tags
 */
export const SEO = ({
  title,
  description,
  image,
  article,
  author,
  publishedTime,
  modifiedTime,
  tags,
  noindex = false,
  canonical,
  type = "website",
}) => {
  const seo = useContext(SEOContext);
  const location = useLocation();

  // Use provided values or fall back to defaults
  const pageTitle = title || seo.defaultTitle;
  const pageDescription = description || seo.defaultDescription;
  const pageImage = image ? `${seo.siteUrl}${image}` : `${seo.siteUrl}${seo.defaultImage}`;
  const pageUrl = canonical || `${seo.siteUrl}${location.pathname}`;
  const pageType = article ? "article" : type;

  return (
    <Helmet>
      {/* Basic HTML Meta Tags */}
      <title>{title ? seo.titleTemplate.replace('%s', title) : seo.defaultTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={pageUrl} />
      
      {/* Robots Meta Tag */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph Tags */}
      <meta property="og:site_name" content={seo.siteName} />
      <meta property="og:type" content={pageType} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:locale" content={seo.locale} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={seo.twitterHandle} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      
      {/* Article-specific Tags */}
      {article && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {tags && tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Additional SEO Tags */}
      {tags && <meta name="keywords" content={tags.join(', ')} />}
    </Helmet>
  );
};

/**
 * Hook to access SEO context
 */
export const useSEO = () => {
  const context = useContext(SEOContext);
  if (!context) {
    throw new Error('useSEO must be used within SEOProvider');
  }
  return context;
};