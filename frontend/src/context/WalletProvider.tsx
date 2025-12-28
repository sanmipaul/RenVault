import React, { createContext, useContext, ReactNode } from 'react';
import { useAppKitAccount } from '@reown/appkit/react';
import { WalletProvider, WalletProviderType } from '../types/wallet';
import { useAuth, AuthMethod } from './AuthContext';

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
  // Email/Social auth properties
  authMethod: AuthMethod | null;
  isEmailAuth: boolean;
  isSocialAuth: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { address, isConnected, status } = useAppKitAccount();
  const { user, isLoading: authLoading } = useAuth();

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

  const authMethod = user?.method || null;
  const isEmailAuth = authMethod === 'email';
  const isSocialAuth = authMethod === 'social';

  const contextValue: WalletContextType = {
    currentProvider: null, // AppKit manages this
    selectedProviderType: null,
    setSelectedProvider,
    connect,
    disconnect,
    signTransaction,
    isLoading: status === 'connecting' || authLoading,
    error: null,
    isConnected,
    connectionState: isConnected ? { address: address || '', publicKey: '' } : null,
    refreshBalance,
    hasStoredSession: false,
    isRestoringSession: false,
    sessionError: null,
    clearStoredSession,
    authMethod,
    isEmailAuth,
    isSocialAuth,
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
