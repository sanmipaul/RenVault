// hooks/useWalletConnect.ts
import { useState, useCallback } from 'react';
import { WalletConnectSession, AppUserProfile } from '../types/app';
import { trackAnalytics } from '../utils/analytics';

interface UseWalletConnectResult {
  session: WalletConnectSession | null;
  handleSession: (rawSession: WalletConnectSession) => AppUserProfile | null;
  clearSession: () => void;
}

export const useWalletConnect = (): UseWalletConnectResult => {
  const [session, setSession] = useState<WalletConnectSession | null>(null);

  const handleSession = useCallback((rawSession: WalletConnectSession): AppUserProfile | null => {
    const stacksAccount = rawSession.namespaces.stacks?.accounts?.[0];
    if (!stacksAccount) {
      trackAnalytics('wallet-connect', { user: 'anonymous', method: 'walletconnect', success: false });
      return null;
    }

    const address = stacksAccount.split(':')[2];
    const mockUserData: AppUserProfile = {
      profile: {
        stxAddress: { mainnet: address, testnet: address },
        name: 'WalletConnect User',
      },
      appPrivateKey: '',
    };

    setSession(rawSession);
    trackAnalytics('wallet-connect', { user: address, method: 'walletconnect', success: true });
    return mockUserData;
  }, []);

  const clearSession = useCallback(() => {
    setSession(null);
  }, []);

  return { session, handleSession, clearSession };
};
