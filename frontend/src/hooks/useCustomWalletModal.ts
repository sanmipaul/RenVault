import { useState, useCallback, useEffect } from 'react';
import { useAppKit } from '@reown/appkit/react';
import {
  modalFeatureFlags,
  renvaultBranding,
  customWalletsConfig,
  shouldUseCustomModal
} from '../config/walletconnect';

type ModalView = 'main' | 'comparison' | 'faq' | 'onboarding';

interface WalletSelectionEvent {
  walletId: string;
  timestamp: number;
  source: 'recent' | 'list' | 'comparison';
}

interface UseCustomWalletModalOptions {
  onWalletSelect?: (walletId: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  enableAnalytics?: boolean;
}

interface UseCustomWalletModalReturn {
  // Modal state
  isOpen: boolean;
  currentView: ModalView;
  isAnimating: boolean;

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setView: (view: ModalView) => void;

  // Wallet actions
  selectWallet: (walletId: string, source?: WalletSelectionEvent['source']) => void;
  getRecentWallets: () => string[];

  // Configuration
  branding: typeof renvaultBranding;
  features: typeof modalFeatureFlags;
  wallets: typeof customWalletsConfig.wallets;

  // Utilities
  shouldShowSidebar: boolean;
  useCustomModal: boolean;
}

/**
 * Custom hook for managing the RenVault wallet modal
 * Provides state management, wallet selection, and analytics tracking
 */
export const useCustomWalletModal = (
  options: UseCustomWalletModalOptions = {}
): UseCustomWalletModalReturn => {
  const {
    onWalletSelect,
    onConnect,
    onDisconnect,
    enableAnalytics = modalFeatureFlags.enableAnalytics
  } = options;

  const { open: openAppKit, close: closeAppKit } = useAppKit();

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ModalView>('main');
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  /**
   * Open the wallet modal
   */
  const openModal = useCallback(() => {
    if (shouldUseCustomModal()) {
      setIsAnimating(true);
      setIsOpen(true);
      setTimeout(() => setIsAnimating(false), 300);
    } else {
      // Fall back to standard AppKit modal
      openAppKit();
    }

    if (enableAnalytics) {
      trackModalEvent('open');
    }
  }, [openAppKit, enableAnalytics]);

  /**
   * Close the wallet modal
   */
  const closeModal = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsOpen(false);
      setCurrentView('main');
      setIsAnimating(false);
    }, 200);

    if (enableAnalytics) {
      trackModalEvent('close');
    }
  }, [enableAnalytics]);

  /**
   * Change the current view
   */
  const setView = useCallback((view: ModalView) => {
    setCurrentView(view);

    if (enableAnalytics) {
      trackModalEvent('view_change', { view });
    }
  }, [enableAnalytics]);

  /**
   * Handle wallet selection
   */
  const selectWallet = useCallback(
    (walletId: string, source: WalletSelectionEvent['source'] = 'list') => {
      // Save to recent wallets
      saveRecentWallet(walletId);

      // Track selection
      if (enableAnalytics && modalFeatureFlags.trackWalletSelections) {
        trackWalletSelection({ walletId, timestamp: Date.now(), source });
      }

      // Call callback
      onWalletSelect?.(walletId);

      // Open AppKit for actual connection
      openAppKit();

      // Close custom modal
      closeModal();
    },
    [onWalletSelect, openAppKit, closeModal, enableAnalytics]
  );

  /**
   * Get recent wallet connections
   */
  const getRecentWallets = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem('renvault_recent_wallets');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load recent wallets:', e);
    }
    return [];
  }, []);

  // Computed values
  const shouldShowSidebar =
    modalFeatureFlags.showOnboardingGuide ||
    modalFeatureFlags.showFeatureHighlights ||
    modalFeatureFlags.showSecurityBadges ||
    modalFeatureFlags.showNetworkStatus;

  const useCustomModal = shouldUseCustomModal();

  return {
    // Modal state
    isOpen,
    currentView,
    isAnimating,

    // Actions
    openModal,
    closeModal,
    setView,

    // Wallet actions
    selectWallet,
    getRecentWallets,

    // Configuration
    branding: renvaultBranding,
    features: modalFeatureFlags,
    wallets: customWalletsConfig.wallets,

    // Utilities
    shouldShowSidebar,
    useCustomModal
  };
};

/**
 * Save wallet to recent connections
 */
function saveRecentWallet(walletId: string): void {
  try {
    const stored = localStorage.getItem('renvault_recent_wallets');
    const recent: string[] = stored ? JSON.parse(stored) : [];
    const updated = [walletId, ...recent.filter((id) => id !== walletId)].slice(
      0,
      customWalletsConfig.options.recentConnectionsLimit
    );
    localStorage.setItem('renvault_recent_wallets', JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save recent wallet:', e);
  }
}

/**
 * Track modal events for analytics
 */
function trackModalEvent(event: string, data?: Record<string, unknown>): void {
  try {
    // In production, this would send to analytics service
    console.debug('[RenVault Modal Analytics]', event, data);

    // Example: window.gtag?.('event', event, { ...data, category: 'wallet_modal' });
  } catch (e) {
    console.warn('Failed to track modal event:', e);
  }
}

/**
 * Track wallet selection for analytics
 */
function trackWalletSelection(event: WalletSelectionEvent): void {
  try {
    console.debug('[RenVault Wallet Selection]', event);

    // Example: window.gtag?.('event', 'wallet_selected', {
    //   wallet_id: event.walletId,
    //   source: event.source,
    // });
  } catch (e) {
    console.warn('Failed to track wallet selection:', e);
  }
}

export default useCustomWalletModal;
