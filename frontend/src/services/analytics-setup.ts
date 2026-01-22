/**
 * Analytics Setup Module
 * Initializes and orchestrates all analytics services
 */

import { analyticsService } from './analytics-service';
import { privacyManager } from './privacy-manager';
import { errorAnalyticsService } from './error-analytics';
import { funnelAnalyticsService } from './funnel-analytics';
import { performanceMetricsService } from './performance-metrics';
import { walletConnectAnalytics } from './walletconnect-analytics';

export interface AnalyticsConfig {
  enableErrorTracking?: boolean;
  enableFunnelTracking?: boolean;
  enablePerformanceTracking?: boolean;
  enableWalletConnectSync?: boolean;
  errorRatioThreshold?: number;
  performanceAlertThreshold?: number;
  privacyFirstMode?: boolean;
  environment?: 'development' | 'staging' | 'production';
}

class AnalyticsSetup {
  private initialized = false;
  private config: AnalyticsConfig = {
    enableErrorTracking: true,
    enableFunnelTracking: true,
    enablePerformanceTracking: true,
    enableWalletConnectSync: true,
    errorRatioThreshold: 0.05,
    performanceAlertThreshold: 3000,
    privacyFirstMode: false,
    environment: 'production',
  };

  /**
   * Initialize all analytics services
   */
  initialize(config: Partial<AnalyticsConfig> = {}): void {
    if (this.initialized) {
      console.warn('Analytics already initialized');
      return;
    }

    this.config = { ...this.config, ...config };

    try {
      // Initialize privacy manager first
      this.initializePrivacyManager();

      // Initialize core analytics
      this.initializeAnalyticsService();

      // Initialize error tracking
      if (this.config.enableErrorTracking) {
        this.initializeErrorTracking();
      }

      // Initialize funnel tracking
      if (this.config.enableFunnelTracking) {
        this.initializeFunnelTracking();
      }

      // Initialize performance tracking
      if (this.config.enablePerformanceTracking) {
        this.initializePerformanceTracking();
      }

      // Initialize WalletConnect sync
      if (this.config.enableWalletConnectSync) {
        this.initializeWalletConnectSync();
      }

      // Setup global error handler
      this.setupGlobalErrorHandler();

      // Setup page visibility tracking
      this.setupPageVisibilityTracking();

      this.initialized = true;

      if (this.config.environment === 'development') {
        console.log('Analytics initialized with config:', this.config);
      }
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
      this.initialized = false;
    }
  }

  private initializePrivacyManager(): void {
    // Load saved privacy settings
    const privacySettings = privacyManager.getPrivacySettings();

    if (this.config.privacyFirstMode) {
      // In privacy-first mode, disable analytics tracking by default
      privacyManager.setPrivacyPreference('analytics_enabled', false);
    }

    // Load GDPR compliance settings
    if (!privacyManager.isGdprCompliant()) {
      privacyManager.initializeGdprCompliance();
    }
  }

  private initializeAnalyticsService(): void {
    // Enable analytics if privacy settings allow
    const privacySettings = privacyManager.getPrivacySettings();
    if (!privacySettings.analyticsEnabled && this.config.privacyFirstMode) {
      analyticsService.optOut();
    } else {
      analyticsService.optIn();
    }

    // Setup auto page view tracking
    this.setupAutoPageViewTracking();
  }

  private setupAutoPageViewTracking(): void {
    // Track initial page load
    analyticsService.trackEvent('page_view', {
      page: window.location.pathname,
      referrer: document.referrer,
      timestamp: Date.now(),
    });

    // Track page navigation
    window.addEventListener('hashchange', () => {
      analyticsService.trackEvent('page_view', {
        page: window.location.pathname + window.location.hash,
        timestamp: Date.now(),
      });
    });

    // Track popstate for browser back/forward
    window.addEventListener('popstate', () => {
      analyticsService.trackEvent('page_navigation', {
        page: window.location.pathname,
        type: 'popstate',
        timestamp: Date.now(),
      });
    });
  }

  private initializeErrorTracking(): void {
    // Setup uncaught error tracking
    window.addEventListener('error', (event: ErrorEvent) => {
      errorAnalyticsService.recordError(event.error, {
        source: 'uncaught_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Setup unhandled promise rejection tracking
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      errorAnalyticsService.recordError(event.reason, {
        source: 'unhandled_promise_rejection',
        message: String(event.reason),
      });
    });
  }

  private initializeFunnelTracking(): void {
    // Initialize pre-defined funnels
    funnelAnalyticsService.initializeFunnels();

    // Auto-track wallet connection funnel
    this.setupWalletConnectionFunnelTracking();

    // Auto-track transaction funnels
    this.setupTransactionFunnelTracking();
  }

  private setupWalletConnectionFunnelTracking(): void {
    // These will be called from wallet connection hooks
    const trackConnectionStep = (step: string) => {
      funnelAnalyticsService.trackFunnelStep('wallet_connection', step);
    };

    // Store in window for hook access
    (window as any).__trackWalletConnectionStep = trackConnectionStep;
  }

  private setupTransactionFunnelTracking(): void {
    const trackTransactionStep = (type: 'deposit' | 'withdrawal', step: string) => {
      const funnelName = `${type}_transaction`;
      funnelAnalyticsService.trackFunnelStep(funnelName, step);
    };

    (window as any).__trackTransactionStep = trackTransactionStep;
  }

  private initializePerformanceTracking(): void {
    // Track Core Web Vitals when available
    if ('PerformanceObserver' in window) {
      this.trackCoreWebVitals();
    }

    // Manual performance monitoring
    this.setupManualPerformanceTracking();
  }

  private trackCoreWebVitals(): void {
    try {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        performanceMetricsService.recordLatency('lcp', lastEntry.startTime);
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            performanceMetricsService.recordLatency('cls', entry.value);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          performanceMetricsService.recordLatency('fid', entry.processingDuration);
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      if (this.config.environment === 'development') {
        console.warn('Web Vitals tracking unavailable:', error);
      }
    }
  }

  private setupManualPerformanceTracking(): void {
    // Store reference for hook access
    const recordLatency = (metric: string, value: number) => {
      performanceMetricsService.recordLatency(metric, value);
    };

    (window as any).__recordLatency = recordLatency;
  }

  private initializeWalletConnectSync(): void {
    // Initialize WalletConnect Cloud sync
    walletConnectAnalytics.setEnabled(true);

    // Setup periodic sync
    setInterval(() => {
      walletConnectAnalytics.flush().catch((error) => {
        if (this.config.environment === 'development') {
          console.error('Failed to sync analytics with WalletConnect Cloud:', error);
        }
      });
    }, 30000); // Sync every 30 seconds
  }

  private setupGlobalErrorHandler(): void {
    // Wrap console.error to track errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      errorAnalyticsService.recordError(args[0], {
        source: 'console_error',
        args: args.slice(1),
      });
      originalConsoleError.apply(console, args);
    };
  }

  private setupPageVisibilityTracking(): void {
    document.addEventListener('visibilitychange', () => {
      const isVisible = document.visibilityState === 'visible';
      analyticsService.trackEvent('page_visibility', {
        visible: isVisible,
        timestamp: Date.now(),
      });
    });
  }

  /**
   * Get current analytics configuration
   */
  getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  /**
   * Update analytics configuration
   */
  updateConfig(config: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if analytics is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Disable all analytics tracking
   */
  disableAnalytics(): void {
    analyticsService.optOut();
    privacyManager.setPrivacyPreference('analytics_enabled', false);
  }

  /**
   * Enable analytics tracking
   */
  enableAnalytics(): void {
    analyticsService.optIn();
    privacyManager.setPrivacyPreference('analytics_enabled', true);
  }

  /**
   * Reset all analytics data
   */
  resetAnalyticsData(): void {
    analyticsService.clearData();
    errorAnalyticsService.clearData();
    funnelAnalyticsService.clearData();
    performanceMetricsService.clearData();
  }
}

export const analyticsSetup = new AnalyticsSetup();
