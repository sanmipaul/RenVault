import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { WalletProvider, WalletProviderType } from '../types/wallet';
import { WalletKitService } from '../services/walletkit-service';
import NotificationService from '../services/notificationService';

interface WalletContextType {
  currentProvider: WalletProvider | null;
  selectedProviderType: WalletProviderType | null;
  setSelectedProvider: (type: WalletProviderType) => void;
  connect: () => Promise<any>;
  disconnect: () => Promise<void>;
  signTransaction: (tx: any) => Promise<any>;
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
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected, status } = useAppKitAccount();
  const [userId] = useState('user-' + Math.random().toString(36).substring(7)); // In real app, get from auth

  useEffect(() => {
    const initWalletKit = async () => {
      try {
        const walletKitService = await WalletKitService.init();
        const notificationService = NotificationService.getInstance(userId);

        // Subscribe to WalletKit events
        const unsubProposal = walletKitService.on('session_proposal', (proposal) => {
          const { name, url } = proposal.params.proposer.metadata;
          
          // Security check: Simple example of suspicious dApp detection
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

  const setSelectedProvider = (type: WalletProviderType) => {
    // AppKit handles provider selection internally
    console.log('Provider selection:', type);
  };

  const connect = async () => {
    // AppKit handles connection
    return { address, publicKey: '' }; // Simplified
  };

  const disconnect = async () => {
    // AppKit handles disconnection
  };

  const signTransaction = async (tx: any) => {
    // AppKit handles signing
    return tx;
  };

  const refreshBalance = async () => {
    // Trigger balance refresh
  };

  const clearStoredSession = () => {
    // Clear session
  };

  const contextValue: WalletContextType = {
    currentProvider: null, // AppKit manages this
    selectedProviderType: null,
    setSelectedProvider,
    connect,
    disconnect,
    signTransaction,
    isLoading: status === 'connecting',
    error: null,
    isConnected,
    connectionState: isConnected ? { address: address || '', publicKey: '' } : null,
    refreshBalance,
    hasStoredSession: false,
    isRestoringSession: false,
    sessionError: null,
    clearStoredSession,
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
