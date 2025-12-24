import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletKit, WalletKitTypes } from '@reown/walletkit';
import { logger } from '../utils/logger';

interface WalletKitContextType {
  walletKit: WalletKit | null;
  isLoading: boolean;
  error: Error | null;
  sessionProposal: WalletKitTypes.SessionProposal | null;
  setSessionProposal: (proposal: WalletKitTypes.SessionProposal | null) => void;
}

const WalletKitContext = createContext<WalletKitContextType | undefined>(undefined);

export const WalletKitProvider: React.FC<{
  children: ReactNode;
  value: {
    walletKit: WalletKit | null;
    isLoading: boolean;
    error: Error | null;
  };
}> = ({ children, value }) => {
  const [sessionProposal, setSessionProposal] = useState<WalletKitTypes.SessionProposal | null>(null);

  useEffect(() => {
    if (!value.walletKit) return;

    const onSessionProposal = (proposal: WalletKitTypes.SessionProposal) => {
      logger.info('Received session proposal', proposal);
      setSessionProposal(proposal);
    };

    value.walletKit.on('session_proposal', onSessionProposal);

    return () => {
      value.walletKit?.off('session_proposal', onSessionProposal);
    };
  }, [value.walletKit]);

  const contextValue: WalletKitContextType = {
    ...value,
    sessionProposal,
    setSessionProposal,
  };

  return (
    <WalletKitContext.Provider value={contextValue}>
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
