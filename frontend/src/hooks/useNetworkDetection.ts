// hooks/useNetworkDetection.ts
import { useState, useCallback } from 'react';
import { NetworkType } from '../types/app';

interface UseNetworkDetectionResult {
  detectedNetwork: NetworkType | null;
  networkMismatch: boolean;
  detectFromAddress: (address: string) => void;
  reset: () => void;
  promptSwitch: () => string;
}

const detectNetworkFromAddress = (address: string): NetworkType => {
  return address.startsWith('SP') ? 'mainnet' : 'testnet';
};

export const useNetworkDetection = (): UseNetworkDetectionResult => {
  const [detectedNetwork, setDetectedNetwork] = useState<NetworkType | null>(null);
  const [networkMismatch, setNetworkMismatch] = useState<boolean>(false);

  const detectFromAddress = useCallback((address: string) => {
    const net = detectNetworkFromAddress(address);
    setDetectedNetwork(net);
    setNetworkMismatch(net !== 'mainnet');
  }, []);

  const reset = useCallback(() => {
    setDetectedNetwork(null);
    setNetworkMismatch(false);
  }, []);

  const promptSwitch = useCallback((): string => {
    return 'To switch networks: Open your Stacks wallet extension and select "Mainnet" from the network dropdown, then refresh this page.';
  }, []);

  return { detectedNetwork, networkMismatch, detectFromAddress, reset, promptSwitch };
};
