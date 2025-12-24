import { useState, useEffect } from 'react';
import { WalletKit } from '@reown/walletkit';
import { WalletKitService } from '../services/walletkit-service';

export const useWalletKit = () => {
  const [walletKit, setWalletKit] = useState<WalletKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initWalletKit = async () => {
      try {
        const service = await WalletKitService.init();
        setWalletKit(service.getKit());
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
