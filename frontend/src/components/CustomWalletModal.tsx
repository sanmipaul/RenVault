import React, { useEffect, useState, useCallback } from 'react';
import { useAppKit } from '@reown/appkit/react';
import WalletRecommendations from './WalletRecommendations';
import OnboardingGuide from './OnboardingGuide';
import {
  ModalHeader,
  ModalFooter,
  SecurityBadges,
  NetworkStatus,
  FeatureHighlights,
  FAQSection,
  WalletComparisonGuide
} from './modal';
import '../styles/modal.css';

type ModalView = 'main' | 'comparison' | 'faq' | 'onboarding';

interface CustomWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: ModalView;
  showSidebar?: boolean;
}

const CustomWalletModal: React.FC<CustomWalletModalProps> = ({
  isOpen,
  onClose,
  initialView = 'main',
  showSidebar = true
}) => {
  const { open } = useAppKit();
  const [networkStatus, setNetworkStatus] = useState<'online' | 'congested' | 'offline'>('online');
  const [currentView, setCurrentView] = useState<ModalView>(initialView);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Simulated network status check
  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        // In production, this would call actual Stacks network APIs
        const online = navigator.onLine;
        setNetworkStatus(online ? 'online' : 'offline');
      } catch {
        setNetworkStatus('offline');
      }
    };

    checkNetworkStatus();
    const interval = setInterval(checkNetworkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleWalletSelect = useCallback(
    (id: string) => {
      // Track wallet selection for analytics
      console.log('Wallet selected:', id);
      // Open AppKit modal
      open();
      onClose();
    },
    [open, onClose]
  );

  const handleViewChange = (view: ModalView) => {
    setCurrentView(view);
  };

  const handleGuideClick = () => {
    setCurrentView('onboarding');
  };

  const handleContactSupport = () => {
    window.open('https://renvault.app/support', '_blank');
  };

  if (!isOpen) return null;

  const renderMainContent = () => {
    switch (currentView) {
      case 'comparison':
        return (
          <div className="renvault-modal__view">
            <button
              className="renvault-modal__back-btn"
              onClick={() => setCurrentView('main')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Back to wallets
            </button>
            <WalletComparisonGuide onWalletSelect={handleWalletSelect} />
          </div>
        );

      case 'faq':
        return (
          <div className="renvault-modal__view">
            <button
              className="renvault-modal__back-btn"
              onClick={() => setCurrentView('main')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Back to wallets
            </button>
            <FAQSection
              showCategories
              maxItems={8}
              onContactSupport={handleContactSupport}
            />
          </div>
        );

      case 'onboarding':
        return (
          <div className="renvault-modal__view">
            <button
              className="renvault-modal__back-btn"
              onClick={() => setCurrentView('main')}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Back to wallets
            </button>
            <OnboardingGuide
              variant="full"
              onComplete={() => setCurrentView('main')}
            />
          </div>
        );

      default:
        return (
          <>
            <WalletRecommendations onSelect={handleWalletSelect} />

            <div className="renvault-modal__quick-links">
              <button
                className="quick-link"
                onClick={() => setCurrentView('comparison')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                  <rect x="9" y="3" width="6" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                Compare wallets
              </button>
              <button
                className="quick-link"
                onClick={() => setCurrentView('faq')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M6 6c0-1 1-2 2-2s2 1 2 2c0 1-1.5 1.5-1.5 2.5M8 12v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                FAQ
              </button>
            </div>
          </>
        );
    }
  };

  return (
    <div
      className={`renvault-modal-overlay ${isAnimating ? 'animating' : ''}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`renvault-modal-container ${isAnimating ? 'animating' : ''} ${
          !showSidebar ? 'no-sidebar' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="renvault-modal-main">
          <ModalHeader
            onClose={onClose}
            showNetworkIndicator={currentView === 'main'}
            networkStatus={networkStatus}
          />

          <div className="renvault-modal-content">{renderMainContent()}</div>

          <ModalFooter
            showGuideLink={currentView === 'main'}
            onGuideClick={handleGuideClick}
          />
        </div>

        {showSidebar && currentView === 'main' && (
          <div className="renvault-modal-sidebar">
            <div className="sidebar-section">
              <OnboardingGuide variant="compact" />
            </div>

            <div className="sidebar-section">
              <FeatureHighlights showStats={false} />
            </div>

            <div className="sidebar-section">
              <SecurityBadges />
            </div>

            <div className="sidebar-section sidebar-section--network">
              <NetworkStatus network="mainnet" showDetails={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomWalletModal;
