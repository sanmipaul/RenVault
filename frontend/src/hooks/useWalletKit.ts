import { useState, useEffect } from 'react';
import { WalletKit } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import walletKitConfig from '../lib/walletkit-config';

export const useWalletKit = () => {
  const [walletKit, setWalletKit] = useState<WalletKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initWalletKit = async () => {
      try {
        const core = new Core({
          projectId: walletKitConfig.projectId,
        });

        const kit = await WalletKit.init({
          core,
          metadata: walletKitConfig.metadata,
        });

        setWalletKit(kit);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    initWalletKit();
  }, []);

  return { walletKit, loading, error };
};
