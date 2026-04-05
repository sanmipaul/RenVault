// hooks/useVaultStats.ts
import { useState, useCallback } from 'react';
import { callReadOnlyFunction, standardPrincipalCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
import { CONTRACT_ADDRESS, CONTRACT_NAME } from '../constants/app';
import { trackAnalytics } from '../utils/analytics';

interface VaultStats {
  balance: string;
  points: string;
}

interface UseVaultStatsResult {
  balance: string;
  points: string;
  fetchStats: (address: string, networkMismatch: boolean) => Promise<void>;
  resetStats: () => void;
}

const network = new StacksMainnet();

export const useVaultStats = (): UseVaultStatsResult => {
  const [balance, setBalance] = useState<string>('0');
  const [points, setPoints] = useState<string>('0');

  const fetchStats = useCallback(async (address: string, networkMismatch: boolean) => {
    if (!address || networkMismatch) return;

    const startTime = Date.now();
    try {
      const balanceResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(address)],
        network,
        senderAddress: address,
      });

      const pointsResult = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-points',
        functionArgs: [standardPrincipalCV(address)],
        network,
        senderAddress: address,
      });

      // @ts-ignore
      setBalance((parseInt(balanceResult.value) / 1000000).toFixed(6));
      // @ts-ignore
      setPoints(pointsResult.value);

      trackAnalytics('performance', { operation: 'fetch-user-stats', duration: Date.now() - startTime });
    } catch (error) {
      console.error('Error fetching vault stats:', error);
      trackAnalytics('performance', { operation: 'fetch-user-stats', duration: Date.now() - startTime });
    }
  }, []);

  const resetStats = useCallback(() => {
    setBalance('0');
    setPoints('0');
  }, []);

  return { balance, points, fetchStats, resetStats };
};
