/**
 * Privacy & GDPR Compliance Module
 * Handles privacy settings and GDPR compliance
 */

import { CookieConsent, PrivacySettings, GdprCompliance } from '../types/analytics';

export const GDPR_COMPLIANCE_CONFIG: GdprCompliance = {
  dataCollectionNotice: true,
  privacyPolicyLink: 'https://renvault.app/privacy-policy',
  optOutMechanism: true,
  dataExportCapability: true,
  dataDeleteCapability: true,
  retentionPolicy: '90 days for active users, 30 days for inactive users',
  consentRequired: true,
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  anonymizeWalletAddress: true,
  skipPII: true,
  gdprCompliant: true,
  optOutTrackingId: '',
};

class PrivacyManager {
  private cookieConsent: CookieConsent | null = null;
  private privacySettings: PrivacySettings = { ...DEFAULT_PRIVACY_SETTINGS };
  private consentVersion = '1.0';

  constructor() {
    this.loadConsent();
    this.loadPrivacySettings();
  }

  /**
   * Load cookie consent from storage
   */
  private loadConsent(): void {
    try {
      const stored = localStorage.getItem('cookie_consent');
      if (stored) {
        this.cookieConsent = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load cookie consent:', error);
    }
  }

  /**
   * Load privacy settings from storage
   */
  private loadPrivacySettings(): void {
    try {
      const stored = localStorage.getItem('privacy_settings');
      if (stored) {
        this.privacySettings = {
          ...this.privacySettings,
          ...JSON.parse(stored),
        };
      }
    } catch (error) {
      console.warn('Failed to load privacy settings:', error);
    }
  }

  /**
   * Save cookie consent
   */
  saveCookieConsent(consent: Omit<CookieConsent, 'consentDate' | 'version'>): void {
    this.cookieConsent = {
      ...consent,
      consentDate: Date.now(),
      version: this.consentVersion,
    };

    try {
      localStorage.setItem('cookie_consent', JSON.stringify(this.cookieConsent));
    } catch (error) {
      console.warn('Failed to save cookie consent:', error);
    }
  }

  /**
   * Get current cookie consent
   */
  getCookieConsent(): CookieConsent | null {
    return this.cookieConsent;
  }

  /**
   * Check if analytics cookies are consented
   */
  isAnalyticsConsented(): boolean {
    return this.cookieConsent?.analytics ?? false;
  }

  /**
   * Check if marketing cookies are consented
   */
  isMarketingConsented(): boolean {
    return this.cookieConsent?.marketing ?? false;
  }

  /**
   * Check if functional cookies are consented
   */
  isFunctionalConsented(): boolean {
    return this.cookieConsent?.functional ?? false;
  }

  /**
   * Update privacy settings
   */
  updatePrivacySettings(settings: Partial<PrivacySettings>): void {
    this.privacySettings = {
      ...this.privacySettings,
      ...settings,
    };

    try {
      localStorage.setItem('privacy_settings', JSON.stringify(this.privacySettings));
    } catch (error) {
      console.warn('Failed to save privacy settings:', error);
    }
  }

  /**
   * Get privacy settings
   */
  getPrivacySettings(): PrivacySettings {
    return { ...this.privacySettings };
  }

  /**
   * Check if PII collection is enabled
   */
  canCollectPII(): boolean {
    return !this.privacySettings.skipPII && this.isAnalyticsConsented();
  }

  /**
   * Check if wallet addresses should be anonymized
   */
  shouldAnonymizeWalletAddresses(): boolean {
    return this.privacySettings.anonymizeWalletAddress;
  }

  /**
   * Check GDPR compliance status
   */
  getGDPRComplianceStatus(): GdprCompliance {
    return GDPR_COMPLIANCE_CONFIG;
  }

  /**
   * Generate data export (GDPR right to access)
   */
  async generateDataExport(userId: string): Promise<any> {
    return {
      userId,
      exportDate: new Date().toISOString(),
      data: {
        analytics: [],
        preferences: this.privacySettings,
        consent: this.cookieConsent,
      },
    };
  }

  /**
   * Request data deletion (GDPR right to be forgotten)
   */
  async requestDataDeletion(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/gdpr/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to request data deletion');
      }

      // Clear local consent and settings
      localStorage.removeItem('cookie_consent');
      localStorage.removeItem('privacy_settings');
      localStorage.removeItem('analytics_opt_out');

      return true;
    } catch (error) {
      console.error('Error requesting data deletion:', error);
      return false;
    }
  }

  /**
   * Should show consent banner
   */
  shouldShowConsentBanner(): boolean {
    if (!this.cookieConsent) {
      return true;
    }

    // Show again if consent version has changed
    if (this.cookieConsent.version !== this.consentVersion) {
      return true;
    }

    return false;
  }

  /**
   * Reset consent (for testing)
   */
  resetConsent(): void {
    this.cookieConsent = null;
    try {
      localStorage.removeItem('cookie_consent');
    } catch (error) {
      console.warn('Failed to reset consent:', error);
    }
  }
}

export const privacyManager = new PrivacyManager();

export default PrivacyManager;
