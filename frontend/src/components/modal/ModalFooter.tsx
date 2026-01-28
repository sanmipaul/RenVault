import React from 'react';

interface ModalFooterProps {
  showGuideLink?: boolean;
  onGuideClick?: () => void;
  termsUrl?: string;
  privacyUrl?: string;
  supportUrl?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({
  showGuideLink = true,
  onGuideClick,
  termsUrl = 'https://renvault.app/terms',
  privacyUrl = 'https://renvault.app/privacy',
  supportUrl = 'https://renvault.app/support'
}) => {
  return (
    <div className="renvault-modal-footer">
      {showGuideLink && (
        <div className="renvault-modal-footer__guide">
          <span className="renvault-modal-footer__guide-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 7v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <button
            className="renvault-modal-footer__guide-link"
            onClick={onGuideClick}
          >
            New to wallets? Get started here
          </button>
        </div>
      )}

      <div className="renvault-modal-footer__links">
        <a
          href={termsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="renvault-modal-footer__link"
        >
          Terms of Service
        </a>
        <span className="renvault-modal-footer__divider">|</span>
        <a
          href={privacyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="renvault-modal-footer__link"
        >
          Privacy Policy
        </a>
        <span className="renvault-modal-footer__divider">|</span>
        <a
          href={supportUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="renvault-modal-footer__link"
        >
          Support
        </a>
      </div>

      <div className="renvault-modal-footer__copyright">
        <p>By connecting, you agree to our Terms of Service and Privacy Policy</p>
        <p className="renvault-modal-footer__version">RenVault v1.0.0</p>
      </div>
    </div>
  );
};

export default ModalFooter;
