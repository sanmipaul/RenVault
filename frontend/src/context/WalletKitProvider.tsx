import React, { createContext, useContext, ReactNode } from 'react';
import { WalletKit } from '@reown/walletkit';

interface WalletKitContextType {
  walletKit: WalletKit | null;
  isLoading: boolean;
  error: Error | null;
}

const WalletKitContext = createContext<WalletKitContextType | undefined>(undefined);

export const WalletKitProvider: React.FC<{
  children: ReactNode;
  value: WalletKitContextType;
}> = ({ children, value }) => {
  return (
    <WalletKitContext.Provider value={value}>
      {children}
    </WalletKitContext.Provider>
  );
};

export const useWalletKitContext = () => {
  const context = useContext(WalletKitContext);
  if (!context) {
    throw new Error('useWalletKitContext must be used within WalletKitProvider');
  }
  return context;
};
