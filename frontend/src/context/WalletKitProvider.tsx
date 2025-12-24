import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { WalletKit, WalletKitTypes } from '@reown/walletkit';
import { logger } from '../utils/logger';

interface WalletKitContextType {
  walletKit: WalletKit | null;
  isLoading: boolean;
  error: Error | null;
  sessionProposal: WalletKitTypes.SessionProposal | null;
  setSessionProposal: (proposal: WalletKitTypes.SessionProposal | null) => void;
  sessionRequest: WalletKitTypes.SessionRequest | null;
  setSessionRequest: (request: WalletKitTypes.SessionRequest | null) => void;
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
  const [sessionRequest, setSessionRequest] = useState<WalletKitTypes.SessionRequest | null>(null);

  useEffect(() => {
    if (!value.walletKit) return;

    const onSessionProposal = (proposal: WalletKitTypes.SessionProposal) => {
      logger.info('Received session proposal', proposal);
      setSessionProposal(proposal);
    };

    const onSessionRequest = (requestEvent: WalletKitTypes.SessionRequest) => {
      logger.info('Received session request', requestEvent);
      setSessionRequest(requestEvent);
    };

    value.walletKit.on('session_proposal', onSessionProposal);
    value.walletKit.on('session_request', onSessionRequest);

    return () => {
      value.walletKit?.off('session_proposal', onSessionProposal);
      value.walletKit?.off('session_request', onSessionRequest);
    };
  }, [value.walletKit]);

  const contextValue: WalletKitContextType = {
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

export const useWalletKitContext = () => {
  const context = useContext(WalletKitContext);
  if (!context) {
    throw new Error('useWalletKitContext must be used within WalletKitProvider');
  }
  return context;
};
