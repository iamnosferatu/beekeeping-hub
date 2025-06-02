// frontend/src/utils/cookieConsent.js

/**
 * Cookie Consent Management System
 * 
 * Handles GDPR/CCPA compliant cookie consent with granular controls
 * for different types of cookies and tracking technologies.
 */

/**
 * Cookie categories for granular consent
 */
export const COOKIE_CATEGORIES = {
  NECESSARY: 'necessary',
  FUNCTIONAL: 'functional',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
  PERFORMANCE: 'performance',
};

/**
 * Cookie purposes for detailed consent
 */
export const COOKIE_PURPOSES = {
  AUTHENTICATION: 'authentication',
  PREFERENCES: 'preferences',
  SECURITY: 'security',
  ANALYTICS: 'analytics',
  ADVERTISING: 'advertising',
  SOCIAL_MEDIA: 'social_media',
  PERFORMANCE: 'performance_monitoring',
  PERSONALIZATION: 'personalization',
};

/**
 * Default cookie configuration
 */
const DEFAULT_COOKIE_CONFIG = {
  [COOKIE_CATEGORIES.NECESSARY]: {
    name: 'Necessary Cookies',
    description: 'Essential cookies required for basic website functionality',
    required: true,
    purposes: [COOKIE_PURPOSES.AUTHENTICATION, COOKIE_PURPOSES.SECURITY],
    cookies: [
      {
        name: 'beekeeper_auth_token',
        purpose: 'User authentication',
        retention: '30 days',
        domain: window.location.hostname,
      },
      {
        name: 'beekeeper_session',
        purpose: 'Session management',
        retention: 'Session',
        domain: window.location.hostname,
      },
    ],
  },
  [COOKIE_CATEGORIES.FUNCTIONAL]: {
    name: 'Functional Cookies',
    description: 'Cookies that enhance functionality and personalization',
    required: false,
    purposes: [COOKIE_PURPOSES.PREFERENCES, COOKIE_PURPOSES.PERSONALIZATION],
    cookies: [
      {
        name: 'theme',
        purpose: 'Store user theme preference',
        retention: '1 year',
        domain: window.location.hostname,
      },
      {
        name: 'language',
        purpose: 'Store user language preference',
        retention: '1 year',
        domain: window.location.hostname,
      },
      {
        name: 'beekeeper_alert_dismissed',
        purpose: 'Remember dismissed alerts',
        retention: '30 days',
        domain: window.location.hostname,
      },
    ],
  },
  [COOKIE_CATEGORIES.ANALYTICS]: {
    name: 'Analytics Cookies',
    description: 'Cookies that help us understand how visitors use our website',
    required: false,
    purposes: [COOKIE_PURPOSES.ANALYTICS],
    cookies: [
      {
        name: 'performance_metrics',
        purpose: 'Store performance monitoring data',
        retention: '7 days',
        domain: window.location.hostname,
      },
      {
        name: 'app_errors',
        purpose: 'Store error tracking data',
        retention: '7 days',
        domain: window.location.hostname,
      },
    ],
  },
  [COOKIE_CATEGORIES.PERFORMANCE]: {
    name: 'Performance Cookies',
    description: 'Cookies that help us monitor and improve website performance',
    required: false,
    purposes: [COOKIE_PURPOSES.PERFORMANCE],
    cookies: [
      {
        name: 'error_session_id',
        purpose: 'Performance session tracking',
        retention: 'Session',
        domain: window.location.hostname,
      },
      {
        name: 'critical_error_occurred',
        purpose: 'Critical error state tracking',
        retention: 'Session',
        domain: window.location.hostname,
      },
    ],
  },
  [COOKIE_CATEGORIES.MARKETING]: {
    name: 'Marketing Cookies',
    description: 'Cookies used for advertising and marketing purposes',
    required: false,
    purposes: [COOKIE_PURPOSES.ADVERTISING, COOKIE_PURPOSES.SOCIAL_MEDIA],
    cookies: [
      // Add marketing cookies here when implemented
    ],
  },
};

/**
 * Cookie Consent Manager
 */
export class CookieConsentManager {
  constructor() {
    this.consentKey = 'beekeeper_cookie_consent';
    this.consentTimestampKey = 'beekeeper_consent_timestamp';
    this.consentVersionKey = 'beekeeper_consent_version';
    this.currentVersion = '1.0';
    this.consentExpiryDays = 365; // 1 year
    
    this.listeners = new Set();
    this.cookieConfig = DEFAULT_COOKIE_CONFIG;
    
    this.init();
  }

  /**
   * Initialize consent manager
   */
  init() {
    // Check if consent is still valid
    this.checkConsentValidity();
    
    // Set up consent expiry check
    this.setupConsentExpiryCheck();
  }

  /**
   * Check if existing consent is still valid
   */
  checkConsentValidity() {
    const consent = this.getStoredConsent();
    const timestamp = this.getConsentTimestamp();
    const version = this.getConsentVersion();
    
    if (!consent || !timestamp || version !== this.currentVersion) {
      // Consent is invalid, clear stored data
      this.clearStoredConsent();
      return false;
    }
    
    // Check if consent has expired
    const now = Date.now();
    const expiryTime = timestamp + (this.consentExpiryDays * 24 * 60 * 60 * 1000);
    
    if (now > expiryTime) {
      this.clearStoredConsent();
      return false;
    }
    
    return true;
  }

  /**
   * Set up periodic consent expiry check
   */
  setupConsentExpiryCheck() {
    // Check consent validity every hour
    setInterval(() => {
      if (!this.checkConsentValidity()) {
        this.notifyListeners('consent_expired');
      }
    }, 60 * 60 * 1000);
  }

  /**
   * Get current consent status
   */
  getConsent() {
    const stored = this.getStoredConsent();
    if (!stored) {
      return null;
    }
    
    return {
      ...stored,
      timestamp: this.getConsentTimestamp(),
      version: this.getConsentVersion(),
      isValid: this.checkConsentValidity(),
    };
  }

  /**
   * Save consent preferences
   */
  saveConsent(preferences) {
    const consent = {
      categories: preferences,
      timestamp: Date.now(),
      version: this.currentVersion,
      userAgent: navigator.userAgent,
      domain: window.location.hostname,
    };
    
    try {
      localStorage.setItem(this.consentKey, JSON.stringify(consent));
      localStorage.setItem(this.consentTimestampKey, consent.timestamp.toString());
      localStorage.setItem(this.consentVersionKey, this.currentVersion);
      
      // Apply consent preferences
      this.applyCookiePreferences(preferences);
      
      // Notify listeners
      this.notifyListeners('consent_saved', consent);
      
      return true;
    } catch (error) {
      console.error('Failed to save cookie consent:', error);
      return false;
    }
  }

  /**
   * Apply cookie preferences
   */
  applyCookiePreferences(preferences) {
    Object.entries(preferences).forEach(([category, allowed]) => {
      const categoryConfig = this.cookieConfig[category];
      if (!categoryConfig) return;
      
      if (!allowed && !categoryConfig.required) {
        // Remove cookies for disabled categories
        this.removeCookiesForCategory(category);
      }
    });
  }

  /**
   * Remove cookies for a specific category
   */
  removeCookiesForCategory(category) {
    const categoryConfig = this.cookieConfig[category];
    if (!categoryConfig || categoryConfig.required) return;
    
    categoryConfig.cookies.forEach(cookie => {
      this.deleteCookie(cookie.name);
      
      // Also remove from localStorage if applicable
      if (localStorage.getItem(cookie.name)) {
        localStorage.removeItem(cookie.name);
      }
    });
  }

  /**
   * Delete a specific cookie
   */
  deleteCookie(name, domain = null) {
    const domains = domain ? [domain] : [
      window.location.hostname,
      `.${window.location.hostname}`,
      window.location.hostname.replace(/^www\./, ''),
    ];
    
    domains.forEach(d => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${d}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  }

  /**
   * Check if a specific cookie category is allowed
   */
  isCategoryAllowed(category) {
    const consent = this.getStoredConsent();
    if (!consent) return false;
    
    // Necessary cookies are always allowed
    if (category === COOKIE_CATEGORIES.NECESSARY) return true;
    
    return consent.categories[category] === true;
  }

  /**
   * Check if a specific cookie is allowed
   */
  isCookieAllowed(cookieName) {
    // Find the category for this cookie
    for (const [category, config] of Object.entries(this.cookieConfig)) {
      const cookie = config.cookies.find(c => c.name === cookieName);
      if (cookie) {
        return this.isCategoryAllowed(category);
      }
    }
    
    // If cookie not found in config, check if it's a necessary cookie pattern
    const necessaryCookiePatterns = [
      /^beekeeper_auth/,
      /^beekeeper_session/,
      /^csrf/i,
      /^session/i,
    ];
    
    return necessaryCookiePatterns.some(pattern => pattern.test(cookieName));
  }

  /**
   * Get default consent (all necessary, others false)
   */
  getDefaultConsent() {
    const defaultConsent = {};
    
    Object.keys(this.cookieConfig).forEach(category => {
      defaultConsent[category] = this.cookieConfig[category].required;
    });
    
    return defaultConsent;
  }

  /**
   * Get all categories consent (accept all)
   */
  getAllConsent() {
    const allConsent = {};
    
    Object.keys(this.cookieConfig).forEach(category => {
      allConsent[category] = true;
    });
    
    return allConsent;
  }

  /**
   * Withdraw consent
   */
  withdrawConsent() {
    // Set all non-necessary categories to false
    const withdrawnConsent = {};
    
    Object.entries(this.cookieConfig).forEach(([category, config]) => {
      withdrawnConsent[category] = config.required;
    });
    
    this.saveConsent(withdrawnConsent);
    
    // Remove all non-necessary cookies
    Object.entries(this.cookieConfig).forEach(([category, config]) => {
      if (!config.required) {
        this.removeCookiesForCategory(category);
      }
    });
    
    this.notifyListeners('consent_withdrawn');
  }

  /**
   * Clear all stored consent data
   */
  clearStoredConsent() {
    localStorage.removeItem(this.consentKey);
    localStorage.removeItem(this.consentTimestampKey);
    localStorage.removeItem(this.consentVersionKey);
  }

  /**
   * Get stored consent from localStorage
   */
  getStoredConsent() {
    try {
      const stored = localStorage.getItem(this.consentKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to parse stored consent:', error);
      return null;
    }
  }

  /**
   * Get consent timestamp
   */
  getConsentTimestamp() {
    const timestamp = localStorage.getItem(this.consentTimestampKey);
    return timestamp ? parseInt(timestamp) : null;
  }

  /**
   * Get consent version
   */
  getConsentVersion() {
    return localStorage.getItem(this.consentVersionKey);
  }

  /**
   * Add event listener
   */
  addEventListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners
   */
  notifyListeners(event, data = null) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Cookie consent listener error:', error);
      }
    });
  }

  /**
   * Get cookie configuration
   */
  getCookieConfig() {
    return this.cookieConfig;
  }

  /**
   * Update cookie configuration
   */
  updateCookieConfig(newConfig) {
    this.cookieConfig = { ...this.cookieConfig, ...newConfig };
  }

  /**
   * Generate privacy policy link
   */
  getPrivacyPolicyUrl() {
    return '/privacy-policy';
  }

  /**
   * Generate cookie policy link
   */
  getCookiePolicyUrl() {
    return '/cookie-policy';
  }

  /**
   * Check if consent banner should be shown
   */
  shouldShowBanner() {
    return !this.getStoredConsent() || !this.checkConsentValidity();
  }

  /**
   * Get consent summary for display
   */
  getConsentSummary() {
    const consent = this.getStoredConsent();
    if (!consent) return null;
    
    const summary = {
      total: Object.keys(this.cookieConfig).length,
      allowed: 0,
      necessary: 0,
      optional: 0,
      categories: {},
    };
    
    Object.entries(this.cookieConfig).forEach(([category, config]) => {
      const isAllowed = consent.categories[category];
      summary.categories[category] = {
        name: config.name,
        allowed: isAllowed,
        required: config.required,
      };
      
      if (isAllowed) summary.allowed++;
      if (config.required) summary.necessary++;
      else summary.optional++;
    });
    
    return summary;
  }

  /**
   * Export consent data for compliance
   */
  exportConsentData() {
    const consent = this.getConsent();
    const summary = this.getConsentSummary();
    
    return {
      consent,
      summary,
      config: this.cookieConfig,
      timestamp: new Date().toISOString(),
      domain: window.location.hostname,
      userAgent: navigator.userAgent,
    };
  }
}

// Global instance
const cookieConsentManager = new CookieConsentManager();

/**
 * Convenience functions
 */
export const getCookieConsent = () => cookieConsentManager.getConsent();
export const saveCookieConsent = (preferences) => cookieConsentManager.saveConsent(preferences);
export const isCookieAllowed = (cookieName) => cookieConsentManager.isCookieAllowed(cookieName);
export const isCategoryAllowed = (category) => cookieConsentManager.isCategoryAllowed(category);
export const shouldShowConsentBanner = () => cookieConsentManager.shouldShowBanner();
export const withdrawCookieConsent = () => cookieConsentManager.withdrawConsent();
export const getCookieConfig = () => cookieConsentManager.getCookieConfig();
export const getConsentSummary = () => cookieConsentManager.getConsentSummary();

export default cookieConsentManager;