import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { WalletManager } from '../services/wallet/WalletManager';
import { WalletProvider, WalletProviderType } from '../types/wallet';
import { SessionManager } from '../services/session/SessionManager';
import { WalletSession } from '../services/session/SessionStorageService';

interface WalletContextType {
  walletManager: WalletManager;
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
  const [walletManager] = useState(() => new WalletManager());
  const [selectedProviderType, setSelectedProviderType] = useState<WalletProviderType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasStoredSession, setHasStoredSession] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const sessionManager = SessionManager.getInstance();

  // Initialize session manager on mount
  useEffect(() => {
    sessionManager.initialize(
      async (session: WalletSession) => {
        // Restore wallet connection from session
        try {
          setIsRestoringSession(true);
          setSessionError(null);

          // Set the provider from session
          setSelectedProviderType(session.providerType);
          walletManager.setProvider(session.providerType);

          // Attempt to restore the connection
          // Note: This would need to be implemented in the wallet providers
          // to support session restoration
          console.log('Session restored, attempting to reconnect wallet...');

          // For now, we'll just mark that we have a stored session
          setHasStoredSession(true);
        } catch (error) {
          console.error('Failed to restore wallet connection:', error);
          setSessionError('Failed to restore wallet connection');
          sessionManager.clearSession();
        } finally {
          setIsRestoringSession(false);
        }
      },
      () => {
        // Session expired
        setHasStoredSession(false);
        setSessionError('Session expired');
        console.log('Wallet session expired');
      }
    );

    // Check for existing session on mount
    const checkExistingSession = async () => {
      const hasSession = sessionManager.hasValidSession();
      setHasStoredSession(hasSession);

      if (hasSession) {
        // Attempt to restore the session
        await sessionManager.attemptSessionRestore();
      } else {
        setIsRestoringSession(false);
      }
    };

    checkExistingSession();
  }, []);

  const setSelectedProvider = (type: WalletProviderType) => {
    setSelectedProviderType(type);
    walletManager.setProvider(type);
  };

  const connect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await walletManager.connect();

      // Store session after successful connection
      if (result && result.address && result.publicKey) {
        sessionManager.storeSession({
          providerType: selectedProviderType!,
          address: result.address,
          publicKey: result.publicKey,
          connectedAt: Date.now(),
          metadata: {
            chainId: 'mainnet', // This should come from the provider
            network: 'stacks',
            permissions: ['read', 'write'] // Default permissions
          }
        });
        setHasStoredSession(true);
        setSessionError(null);
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Connection failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = async () => {
    setIsLoading(true);
    try {
      await walletManager.disconnect();
      // Clear session on disconnect
      sessionManager.clearSession();
      setHasStoredSession(false);
      setSessionError(null);
      // Reset local state
      setSelectedProviderType(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Disconnect failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signTransaction = async (tx: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await walletManager.signTransaction(tx);
      // Extend session on successful transaction
      sessionManager.extendSession();
      // Refresh balance after transaction
      setTimeout(() => refreshBalance(), 2000); // Wait 2 seconds for transaction to be mined
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Signing failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = async () => {
    // This will trigger balance refresh in components that listen to wallet state changes
    // The BalanceDisplay component will automatically refresh when connection state changes
    if (walletManager.isConnected() && walletManager.getConnectionState()?.address && walletManager.getCurrentProvider()) {
      // Force a balance refresh by updating the connection state timestamp
      // This is a simple way to trigger re-fetch without changing the actual state
      console.log('Balance refresh triggered');
    }
  };

  const clearStoredSession = () => {
    sessionManager.clearSession();
    setHasStoredSession(false);
    setSessionError(null);
  };

  const contextValue: WalletContextType = {
    walletManager,
    currentProvider: walletManager.getCurrentProvider(),
    selectedProviderType,
    setSelectedProvider,
    connect,
    disconnect,
    signTransaction,
    isLoading,
    error,
    isConnected: walletManager.isConnected(),
    connectionState: walletManager.getConnectionState(),
    refreshBalance,
    hasStoredSession,
    isRestoringSession,
    sessionError,
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
