import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { WalletProvider, WalletProviderType } from '../types/wallet';
import { WalletKitService } from '../services/walletkit-service';
import NotificationService from '../services/notificationService';
import SponsorshipService, { SponsorshipQuota } from '../services/SponsorshipService';
import { StacksConnectorAdapter } from '../services/wallet/StacksConnectorAdapter';
import { WalletInstallationDetector } from '../services/wallet/WalletInstallationDetector';
import { WalletErrorHandler, WalletErrorType } from '../services/wallet/WalletErrorHandler';
import { WalletFallbackManager } from '../services/wallet/WalletFallbackManager';
import { WalletProviderLoader } from '../services/wallet/WalletProviderLoader';

interface WalletContextType {
  currentProvider: WalletProvider | null;
  selectedProviderType: WalletProviderType | null;
  setSelectedProvider: (type: WalletProviderType) => void;
  connect: (walletId?: string) => Promise<any>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: any) => Promise<any>;
  signMessage: (message: string) => Promise<string>;
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
  connectionState: { address: string; publicKey: string } | null;
  refreshBalance: () => Promise<void>;
  // Session-related properties
  hasStoredSession: boolean;
  isRestoringSession: boolean;
  sessionError: string | null;
  clearStoredSession: () => void;
  // Sponsorship properties
  sponsorshipQuota: SponsorshipQuota | null;
  isEligibleForSponsorship: (operation: string, value?: number) => Promise<boolean>;
  // AppKit Custom Wallet Support
  appKitWallets: any[];
  availableWallets: any[];
  installedWallets: any[];
  isWalletInstalled: (walletId: string) => boolean;
  connectWithFallback: (walletId: string) => Promise<any>;
  // Wallet installation
  getInstallationLink: (walletId: string) => string;
  openWalletInstallation: (walletId: string) => Promise<void>;
  // Error handling
  walletError: any;
  clearError: () => void;
  // Deep linking
  handleDeepLinkReturn: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected, status } = useAppKitAccount();
  const [userId] = useState('user-' + Math.random().toString(36).substring(7));
  const [sponsorshipQuota, setSponsorshipQuota] = useState<SponsorshipQuota | null>(null);
  const [currentStacksAdapter, setCurrentStacksAdapter] = useState<StacksConnectorAdapter | null>(null);
  const [appKitWallets, setAppKitWallets] = useState<any[]>([]);
  const [installedWallets, setInstalledWallets] = useState<any[]>([]);
  const [walletError, setWalletError] = useState<any>(null);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);

  // Initialize AppKit wallets
  useEffect(() => {
    const initAppKitWallets = async () => {
      setIsLoadingWallets(true);
      try {
        // Load wallet configurations
        const wallets = WalletProviderLoader.getAppKitWallets();
        setAppKitWallets(wallets);

        // Get installed wallets
        const installed = WalletProviderLoader.getInstalledAppKitWallets();
        setInstalledWallets(installed);

        // Start monitoring for wallet changes
        const stopMonitoring = WalletProviderLoader.startWalletMonitoring((updatedWallets) => {
          setAppKitWallets(updatedWallets);
          setInstalledWallets(updatedWallets.filter(w => w.isInstalled));
        });

        return stopMonitoring;
      } catch (error) {
        console.error('Failed to initialize AppKit wallets:', error);
      } finally {
        setIsLoadingWallets(false);
      }
    };

    const cleanup = initAppKitWallets();

    return () => {
      cleanup?.then(stopMonitoring => stopMonitoring?.());
    };
  }, []);

  // Initialize sponsorship service
  useEffect(() => {
    const sponsorshipService = SponsorshipService.getInstance();
    sponsorshipService.setUserId(userId);
    
    if (isConnected) {
      sponsorshipService.getQuota().then(setSponsorshipQuota);
    }
  }, [isConnected, userId]);

  // Initialize WalletKit
  useEffect(() => {
    const initWalletKit = async () => {
      try {
        const walletKitService = await WalletKitService.init();
        const notificationService = NotificationService.getInstance(userId);

        const unsubProposal = walletKitService.on('session_proposal', (proposal) => {
          const { name, url } = proposal.params.proposer.metadata;
          const isSuspicious = url.includes('suspicious') || url.includes('untrusted');
          
          if (isSuspicious) {
            notificationService.notifySuspiciousSession(name, url);
          } else {
            notificationService.notifySessionProposal(
              name,
              proposal.params.proposer.metadata,
              proposal.id.toString()
            );
          }
        });

        const unsubRequest = walletKitService.on('session_request', (request) => {
          notificationService.notifySessionRequest(
            request.params.request.method,
            request.params.request.params,
            request.id,
            request.topic
          );
        });

        const unsubUpdate = walletKitService.on('session_update', (data) => {
          notificationService.notifySessionUpdate(data.topic, data.params.namespaces);
        });

        const unsubDelete = walletKitService.on('session_delete', (data) => {
          notificationService.notifySessionDelete(data.topic);
        });

        const unsubExpire = walletKitService.on('session_expire', (data) => {
          notificationService.notifySessionExpire(data.topic);
        });

        const unsubRequestExpiration = walletKitService.on('session_request_expire', (data) => {
          notificationService.notifySessionExpire(data.topic);
        });

        return () => {
          unsubProposal();
          unsubRequest();
          unsubUpdate();
          unsubDelete();
          unsubExpire();
          unsubRequestExpiration();
        };
      } catch (error) {
        console.error('Failed to initialize WalletKit events:', error);
        const notificationService = NotificationService.getInstance(userId);
        notificationService.notifyConnectionError(error instanceof Error ? error.message : 'Unknown connection error');
      }
    };

    if (isConnected) {
      initWalletKit();
    }
  }, [isConnected, userId]);

  // Setup wallet error handling
  useEffect(() => {
    const unsubscribe = WalletErrorHandler.onError((error) => {
      setWalletError(error);
      
      // Attempt suggested action if available and recoverable
      if (error.recoverable && error.suggestedAction) {
        console.log(`Attempting recovery for ${error.type}...`);
        error.suggestedAction().catch(err => {
          console.error('Recovery action failed:', err);
        });
      }
    });

    return unsubscribe;
  }, []);

  const setSelectedProvider = (type: WalletProviderType) => {
    console.log('Provider selection:', type);
  };

  const connect = async (walletId?: string) => {
    const middleware = WalletErrorHandler.createMiddleware({
      walletId: walletId || 'unknown',
      operation: 'connect',
    });

    return middleware.wrap(async () => {
      if (walletId) {
        // Use Stacks connector adapter for custom wallets
        const adapter = new StacksConnectorAdapter(walletId);
        const connectionState = await adapter.connect();
        setCurrentStacksAdapter(adapter);
        return { address: connectionState.address, publicKey: connectionState.publicKey };
      }

      // Fall back to AppKit connection
      return { address, publicKey: '' };
    });
  };

  const connectWithFallback = async (walletId: string) => {
    const middleware = WalletErrorHandler.createMiddleware({
      walletId,
      operation: 'connect',
    });

    return middleware.wrap(async () => {
      const result = await WalletFallbackManager.connectWithFallback(walletId);

      if (!result.success && result.strategy.action) {
        await result.strategy.action();
      }

      if (result.success || result.fallbackWalletId) {
        const adapter = new StacksConnectorAdapter(result.walletId || result.fallbackWalletId || walletId);
        setCurrentStacksAdapter(adapter);
        return { address: adapter.getConnectionState().address };
      }

      throw new Error(`Failed to connect to ${walletId}`);
    });
  };

  const disconnect = async () => {
    const middleware = WalletErrorHandler.createMiddleware({
      walletId: currentStacksAdapter?.getWalletId() || 'unknown',
      operation: 'disconnect',
    });

    return middleware.wrap(async () => {
      if (currentStacksAdapter) {
        await currentStacksAdapter.disconnect();
        setCurrentStacksAdapter(null);
      }
    });
  };

  const signTransaction = async (tx: any) => {
    const middleware = WalletErrorHandler.createMiddleware({
      walletId: currentStacksAdapter?.getWalletId() || 'unknown',
      operation: 'sign',
    });

    return middleware.wrap(async () => {
      if (!currentStacksAdapter) {
        throw new Error('No wallet connected');
      }
      return await currentStacksAdapter.signTransaction(tx);
    });
  };

  const signMessage = async (message: string): Promise<string> => {
    const middleware = WalletErrorHandler.createMiddleware({
      walletId: currentStacksAdapter?.getWalletId() || 'unknown',
      operation: 'sign',
    });

    return middleware.wrap(async () => {
      if (!currentStacksAdapter) {
        throw new Error('No wallet connected');
      }
      return await currentStacksAdapter.signMessage(message);
    });
  };

  const refreshBalance = async () => {
    // Trigger balance refresh logic
  };

  const clearStoredSession = () => {
    // Clear session logic
  };

  const isEligibleForSponsorship = async (operation: string, value?: number) => {
    const sponsorshipService = SponsorshipService.getInstance();
    return await sponsorshipService.isEligible(operation, value);
  };

  const isWalletInstalled = (walletId: string) => {
    return WalletInstallationDetector.isWalletInstalled(walletId);
  };

  const getInstallationLink = (walletId: string) => {
    return WalletInstallationDetector.getInstallationLink(walletId);
  };

  const openWalletInstallation = async (walletId: string) => {
    const installUrl = WalletInstallationDetector.getInstallationLink(walletId);
    window.open(installUrl, '_blank');
  };

  const clearError = () => {
    setWalletError(null);
  };

  const handleDeepLinkReturn = () => {
    // Handle return from deep link
    const appKitWallets = WalletProviderLoader.getAppKitWallets();
    setAppKitWallets(appKitWallets);
  };

  const contextValue: WalletContextType = {
    currentProvider: null,
    selectedProviderType: null,
    setSelectedProvider,
    connect,
    disconnect,
    signTransaction,
    signMessage,
    isLoading: status === 'connecting' || isLoadingWallets,
    error: null,
    isConnected,
    connectionState: isConnected && currentStacksAdapter ? {
      address: currentStacksAdapter.getConnectionState().address || '',
      publicKey: currentStacksAdapter.getConnectionState().publicKey || '',
    } : null,
    refreshBalance,
    hasStoredSession: false,
    isRestoringSession: false,
    sessionError: null,
    clearStoredSession,
    sponsorshipQuota,
    isEligibleForSponsorship,
    appKitWallets,
    availableWallets: appKitWallets,
    installedWallets,
    isWalletInstalled,
    connectWithFallback,
    getInstallationLink,
    openWalletInstallation,
    walletError,
    clearError,
    handleDeepLinkReturn,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
