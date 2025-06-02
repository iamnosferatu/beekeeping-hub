// frontend/src/utils/navigationPerformance.js

/**
 * Navigation Performance Monitor
 * Helps debug navigation-related performance issues
 */

class NavigationPerformanceMonitor {
  constructor() {
    this.hoverEvents = [];
    this.renderCounts = new Map();
    this.isMonitoring = false;
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    this.isMonitoring = true;

    // Monitor hover events on navigation
    const navContainer = document.querySelector('.navbar');
    if (navContainer) {
      navContainer.addEventListener('mouseover', this.trackHover.bind(this), { passive: true });
    }

    console.log('📊 Navigation performance monitoring started');
  }

  stopMonitoring() {
    this.isMonitoring = false;
    const navContainer = document.querySelector('.navbar');
    if (navContainer) {
      navContainer.removeEventListener('mouseover', this.trackHover.bind(this));
    }

    this.reportStats();
  }

  trackHover(event) {
    const link = event.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    this.hoverEvents.push({
      href,
      timestamp: performance.now(),
      target: link.textContent
    });

    // Keep only last 100 events
    if (this.hoverEvents.length > 100) {
      this.hoverEvents.shift();
    }
  }

  trackRender(componentName) {
    const count = this.renderCounts.get(componentName) || 0;
    this.renderCounts.set(componentName, count + 1);
  }

  reportStats() {
    console.group('📊 Navigation Performance Report');
    
    // Hover frequency analysis
    const hoverFrequency = this.analyzeHoverFrequency();
    console.log('Hover Frequency:', hoverFrequency);

    // Render counts
    console.log('Component Render Counts:');
    this.renderCounts.forEach((count, component) => {
      console.log(`  ${component}: ${count} renders`);
    });

    // Recent hover events
    console.log('Recent Hover Events:', this.hoverEvents.slice(-10));
    
    console.groupEnd();
  }

  analyzeHoverFrequency() {
    if (this.hoverEvents.length < 2) return { averageInterval: 0, totalEvents: 0 };

    const intervals = [];
    for (let i = 1; i < this.hoverEvents.length; i++) {
      intervals.push(this.hoverEvents[i].timestamp - this.hoverEvents[i - 1].timestamp);
    }

    const averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    
    return {
      averageInterval: Math.round(averageInterval),
      totalEvents: this.hoverEvents.length,
      eventsPerSecond: 1000 / averageInterval
    };
  }

  reset() {
    this.hoverEvents = [];
    this.renderCounts.clear();
  }
}

// Export singleton instance
export const navPerfMonitor = new NavigationPerformanceMonitor();

// Convenience functions
export const trackNavRender = (componentName) => {
  if (process.env.NODE_ENV === 'development') {
    navPerfMonitor.trackRender(componentName);
  }
};

export const startNavMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    navPerfMonitor.startMonitoring();
  }
};

export const stopNavMonitoring = () => {
  if (process.env.NODE_ENV === 'development') {
    navPerfMonitor.stopMonitoring();
  }
};

export default navPerfMonitor;