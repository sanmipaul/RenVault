import React, { createContext, useContext, useState, ReactNode } from 'react';
import { WalletManager } from '../services/wallet/WalletManager';
import { WalletProvider, WalletProviderType } from '../types/wallet';

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
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletManager] = useState(() => new WalletManager());
  const [selectedProviderType, setSelectedProviderType] = useState<WalletProviderType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setSelectedProvider = (type: WalletProviderType) => {
    setSelectedProviderType(type);
    walletManager.setProvider(type);
  };

  const connect = async () => {
    setIsLoading(true);
    setError(null);
    try {
      return await walletManager.connect();
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
      return await walletManager.signTransaction(tx);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Signing failed'));
      throw err;
    } finally {
      setIsLoading(false);
    }
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
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};
    ...value,
    sessionProposal,
    setSessionProposal,
    sessionRequest,
    setSessionRequest,
  };

  return (
    <WalletKitContext.Provider value={contextValue}>
      {children}
    </WalletKitContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};
