// frontend/src/utils/adManager.js

/**
 * Advertisement Management System
 * 
 * Provides centralized management for advertisements with feature flag control,
 * multiple ad providers, tracking, and analytics.
 */

// Ad placement types
export const AD_PLACEMENTS = {
  BANNER_TOP: 'banner_top',
  BANNER_BOTTOM: 'banner_bottom',
  SIDEBAR_TOP: 'sidebar_top',
  SIDEBAR_BOTTOM: 'sidebar_bottom',
  ARTICLE_TOP: 'article_top',
  ARTICLE_MIDDLE: 'article_middle',
  ARTICLE_BOTTOM: 'article_bottom',
  BETWEEN_ARTICLES: 'between_articles',
  MOBILE_STICKY: 'mobile_sticky',
  POPUP: 'popup',
  NATIVE: 'native',
};

// Ad provider types
export const AD_PROVIDERS = {
  GOOGLE_ADSENSE: 'google_adsense',
  AMAZON_ASSOCIATES: 'amazon_associates',
  DIRECT_SPONSOR: 'direct_sponsor',
  AFFILIATE: 'affiliate',
  CUSTOM_HTML: 'custom_html',
};

// Ad sizes (IAB standard sizes)
export const AD_SIZES = {
  BANNER: { width: 728, height: 90 },
  LEADERBOARD: { width: 728, height: 90 },
  RECTANGLE: { width: 300, height: 250 },
  SQUARE: { width: 250, height: 250 },
  SKYSCRAPER: { width: 160, height: 600 },
  WIDE_SKYSCRAPER: { width: 160, height: 600 },
  MOBILE_BANNER: { width: 320, height: 50 },
  LARGE_MOBILE: { width: 320, height: 100 },
  RESPONSIVE: { width: '100%', height: 'auto' },
};

class AdManager {
  constructor() {
    this.ads = new Map();
    this.analytics = {
      impressions: 0,
      clicks: 0,
      ctr: 0,
      revenue: 0,
    };
    this.adBlockDetected = false;
    this.initialized = false;
    
    this.init();
  }

  /**
   * Initialize the ad manager
   */
  async init() {
    if (this.initialized) return;
    
    try {
      // Detect ad blockers
      await this.detectAdBlocker();
      
      // Load ad configurations
      await this.loadAdConfigurations();
      
      // Initialize analytics
      this.initializeAnalytics();
      
      this.initialized = true;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('🎯 Ad Manager initialized', {
          adBlockDetected: this.adBlockDetected,
          totalAds: this.ads.size
        });
      }
    } catch (error) {
      console.error('Ad Manager initialization failed:', error);
    }
  }

  /**
   * Detect if ad blocker is present
   */
  async detectAdBlocker() {
    return new Promise((resolve) => {
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox';
      testAd.style.position = 'absolute';
      testAd.style.left = '-10000px';
      document.body.appendChild(testAd);
      
      setTimeout(() => {
        this.adBlockDetected = testAd.offsetHeight === 0;
        document.body.removeChild(testAd);
        resolve();
      }, 100);
    });
  }

  /**
   * Load ad configurations from API or local storage
   */
  async loadAdConfigurations() {
    try {
      // Try to load from API first
      const response = await fetch('/api/admin/ads');
      if (response.ok) {
        const ads = await response.json();
        ads.forEach(ad => this.ads.set(ad.id, ad));
        return;
      }
    } catch (error) {
      // Fallback to default configurations
      console.warn('Could not load ads from API, using defaults');
    }
    
    // Default ad configurations
    this.loadDefaultAds();
  }

  /**
   * Load default ad configurations
   */
  loadDefaultAds() {
    const defaultAds = [
      {
        id: 'header_banner',
        placement: AD_PLACEMENTS.BANNER_TOP,
        provider: AD_PROVIDERS.GOOGLE_ADSENSE,
        size: AD_SIZES.LEADERBOARD,
        priority: 1,
        enabled: true,
        content: {
          slotId: 'ca-pub-XXXXXXXX/XXXXXXXX',
          format: 'auto',
        }
      },
      {
        id: 'sidebar_rectangle',
        placement: AD_PLACEMENTS.SIDEBAR_TOP,
        provider: AD_PROVIDERS.GOOGLE_ADSENSE,
        size: AD_SIZES.RECTANGLE,
        priority: 2,
        enabled: true,
        content: {
          slotId: 'ca-pub-XXXXXXXX/XXXXXXXX',
          format: 'rectangle',
        }
      },
      {
        id: 'article_middle',
        placement: AD_PLACEMENTS.ARTICLE_MIDDLE,
        provider: AD_PROVIDERS.DIRECT_SPONSOR,
        size: AD_SIZES.RECTANGLE,
        priority: 3,
        enabled: true,
        content: {
          title: 'Premium Bee Hives',
          description: 'Professional-grade beehives for serious beekeepers. Built to last with cedar wood.',
          image: '/images/placeholder-beehive.jpg',
          callToAction: 'Shop Now',
          url: 'https://example-beehive-shop.com',
          logo: '/images/logo-beehive-shop.png'
        }
      },
      {
        id: 'sidebar_beekeeping_tools',
        placement: AD_PLACEMENTS.SIDEBAR_BOTTOM,
        provider: AD_PROVIDERS.AFFILIATE,
        size: AD_SIZES.RECTANGLE,
        priority: 5,
        enabled: true,
        content: {
          provider: 'amazon',
          productName: 'Professional Bee Smoker - Stainless Steel',
          price: '$24.99',
          originalPrice: '$34.99',
          rating: 4.5,
          description: 'Heavy-duty stainless steel smoker with leather bellows. Perfect for calming your bees during hive inspections.',
          image: '/images/placeholder-smoker.jpg',
          callToAction: 'View on Amazon',
          affiliateUrl: 'https://amazon.com/bee-smoker-example',
          isPrime: true
        }
      },
      {
        id: 'between_articles_honey',
        placement: AD_PLACEMENTS.BETWEEN_ARTICLES,
        provider: AD_PROVIDERS.DIRECT_SPONSOR,
        size: AD_SIZES.RECTANGLE,
        priority: 6,
        enabled: true,
        content: {
          title: 'Raw Wildflower Honey',
          description: 'Support local beekeepers! Pure, unprocessed honey from our family apiaries.',
          image: '/images/placeholder-honey.jpg',
          callToAction: 'Order Now',
          url: 'https://example-honey-farm.com',
          logo: '/images/logo-honey-farm.png'
        }
      },
      {
        id: 'mobile_sticky',
        placement: AD_PLACEMENTS.MOBILE_STICKY,
        provider: AD_PROVIDERS.GOOGLE_ADSENSE,
        size: AD_SIZES.MOBILE_BANNER,
        priority: 7,
        enabled: true,
        mobileOnly: true,
        content: {
          slotId: 'ca-pub-XXXXXXXX/XXXXXXXX',
          format: 'fluid',
        }
      }
    ];

    defaultAds.forEach(ad => this.ads.set(ad.id, ad));
  }

  /**
   * Get ads for a specific placement
   */
  getAdsForPlacement(placement, options = {}) {
    const {
      limit = 1,
      isMobile = false,
      pageType = 'general'
    } = options;

    const availableAds = Array.from(this.ads.values())
      .filter(ad => {
        // Check placement
        if (ad.placement !== placement) return false;
        
        // Check if enabled
        if (!ad.enabled) return false;
        
        // Check mobile-only ads
        if (ad.mobileOnly && !isMobile) return false;
        
        // Check desktop-only ads
        if (ad.desktopOnly && isMobile) return false;
        
        // Check page type restrictions
        if (ad.pageTypes && !ad.pageTypes.includes(pageType)) return false;
        
        return true;
      })
      .sort((a, b) => (a.priority || 999) - (b.priority || 999))
      .slice(0, limit);

    return availableAds;
  }

  /**
   * Record ad impression
   */
  recordImpression(adId, placement) {
    this.analytics.impressions++;
    
    // Send to analytics service
    this.sendAnalytics('impression', {
      adId,
      placement,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Ad impression recorded:', { adId, placement });
    }
  }

  /**
   * Record ad click
   */
  recordClick(adId, placement) {
    this.analytics.clicks++;
    this.analytics.ctr = (this.analytics.clicks / this.analytics.impressions) * 100;
    
    // Send to analytics service
    this.sendAnalytics('click', {
      adId,
      placement,
      timestamp: Date.now(),
    });
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🖱️ Ad click recorded:', { adId, placement });
    }
  }

  /**
   * Send analytics data
   */
  sendAnalytics(event, data) {
    // In a real implementation, send to your analytics service
    try {
      fetch('/api/analytics/ads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          ...data,
        }),
      }).catch(() => {
        // Silently fail analytics
      });
    } catch (error) {
      // Silently fail analytics
    }
  }

  /**
   * Initialize analytics tracking
   */
  initializeAnalytics() {
    // Set up intersection observer for viewability tracking
    if ('IntersectionObserver' in window) {
      this.viewabilityObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const adId = entry.target.dataset.adId;
              const placement = entry.target.dataset.placement;
              
              // Only process elements that have both adId and placement
              // This prevents article images from being affected
              if (adId && placement && entry.target.classList.contains('ad-block')) {
                console.log('📊 Ad viewed:', { adId, placement });
                this.recordImpression(adId, placement);
              }
            }
          });
        },
        {
          threshold: 0.5, // 50% visibility required
          rootMargin: '0px'
        }
      );
    }
  }

  /**
   * Observe ad for viewability tracking
   */
  observeAd(element, adId, placement) {
    if (this.viewabilityObserver && element && element.classList.contains('ad-block')) {
      element.dataset.adId = adId;
      element.dataset.placement = placement;
      this.viewabilityObserver.observe(element);
      console.log('👀 Now observing ad:', { adId, placement, element: element.className });
    }
  }

  /**
   * Check if ads are enabled globally
   */
  isAdsEnabled() {
    // Check feature flag from site settings
    const siteSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    return siteSettings.adsEnabled !== false; // Default to enabled
  }

  /**
   * Get analytics data
   */
  getAnalytics() {
    return {
      ...this.analytics,
      adBlockDetected: this.adBlockDetected,
      totalAds: this.ads.size,
    };
  }

  /**
   * Update ad configuration
   */
  updateAd(adId, updates) {
    const ad = this.ads.get(adId);
    if (ad) {
      this.ads.set(adId, { ...ad, ...updates });
      return true;
    }
    return false;
  }

  /**
   * Add new ad
   */
  addAd(ad) {
    if (!ad.id) {
      ad.id = `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    this.ads.set(ad.id, ad);
    return ad.id;
  }

  /**
   * Remove ad
   */
  removeAd(adId) {
    return this.ads.delete(adId);
  }

  /**
   * Get all ads
   */
  getAllAds() {
    return Array.from(this.ads.values());
  }
}

// Global ad manager instance
export const adManager = new AdManager();

// Utility functions
export const checkFeatureFlag = (flagName, defaultValue = false) => {
  try {
    const siteSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
    return siteSettings[flagName] !== undefined ? siteSettings[flagName] : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const isAdsEnabled = () => checkFeatureFlag('adsEnabled', true);
export const isMobileDevice = () => window.innerWidth <= 768;

export default adManager;