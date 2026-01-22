/**
 * Cookie Consent Banner Component
 * GDPR-compliant cookie consent management
 */

import React, { useState, useEffect } from 'react';
import { privacyManager } from '../services/privacy-manager';

interface CookieConsentProps {
  onConsentChange?: (consent: any) => void;
  position?: 'bottom' | 'top';
  theme?: 'light' | 'dark';
}

export const CookieConsentBanner: React.FC<CookieConsentProps> = ({
  onConsentChange,
  position = 'bottom',
  theme = 'light',
}) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState({
    analytics: false,
    marketing: false,
    functional: true,
  });

  useEffect(() => {
    if (privacyManager.shouldShowConsentBanner()) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const fullConsent = {
      analytics: true,
      marketing: true,
      functional: true,
    };
    privacyManager.saveCookieConsent(fullConsent);
    setConsent(fullConsent);
    setShowBanner(false);
    onConsentChange?.(fullConsent);
  };

  const handleRejectAll = () => {
    const minimalConsent = {
      analytics: false,
      marketing: false,
      functional: true,
    };
    privacyManager.saveCookieConsent(minimalConsent);
    setConsent(minimalConsent);
    setShowBanner(false);
    onConsentChange?.(minimalConsent);
  };

  const handleSavePreferences = () => {
    privacyManager.saveCookieConsent(consent);
    setShowBanner(false);
    onConsentChange?.(consent);
  };

  const handleToggleConsent = (type: 'analytics' | 'marketing' | 'functional') => {
    if (type === 'functional') {
      return;
    }
    setConsent((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`cookie-consent-banner ${position} ${theme}`}>
      {!showDetails && (
        <div className="cookie-consent-summary">
          <div className="consent-content">
            <h3>Cookie Preferences</h3>
            <p>
              We use cookies to enhance your experience. By using RenVault, you
              consent to our cookie policy. You can manage your preferences here.
            </p>
          </div>
          <div className="consent-actions">
            <button className="btn-secondary" onClick={handleRejectAll}>
              Reject All
            </button>
            <button className="btn-tertiary" onClick={() => setShowDetails(true)}>
              Customize
            </button>
            <button className="btn-primary" onClick={handleAcceptAll}>
              Accept All
            </button>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="cookie-consent-details">
          <div className="details-header">
            <h3>Cookie Settings</h3>
            <button
              className="close-btn"
              onClick={() => setShowDetails(false)}
              aria-label="Close"
            >
              ×
            </button>
          </div>

          <div className="cookie-options">
            <CookieOption
              label="Functional Cookies"
              description="Required for basic functionality and security"
              checked={true}
              disabled={true}
              onChange={() => {}}
            />
            <CookieOption
              label="Analytics Cookies"
              description="Help us understand how you use RenVault"
              checked={consent.analytics}
              disabled={false}
              onChange={() => handleToggleConsent('analytics')}
            />
            <CookieOption
              label="Marketing Cookies"
              description="Used to track interests and tailor marketing messages"
              checked={consent.marketing}
              disabled={false}
              onChange={() => handleToggleConsent('marketing')}
            />
          </div>

          <div className="consent-actions">
            <button className="btn-secondary" onClick={handleRejectAll}>
              Reject All
            </button>
            <button className="btn-primary" onClick={handleSavePreferences}>
              Save Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface CookieOptionProps {
  label: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}

const CookieOption: React.FC<CookieOptionProps> = ({
  label,
  description,
  checked,
  disabled,
  onChange,
}) => (
  <div className="cookie-option">
    <div className="option-control">
      <input
        type="checkbox"
        id={label}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
      />
      <label htmlFor={label}>{label}</label>
      {disabled && <span className="badge">Required</span>}
    </div>
    <p className="option-description">{description}</p>
  </div>
);

export default CookieConsentBanner;
