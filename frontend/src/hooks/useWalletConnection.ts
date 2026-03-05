import { useState, useEffect } from 'react';
import { walletState, walletEvents, sessionManager } from '../services';
import type { WalletState } from '../services';

export const useWalletConnection = () => {
  const [state, setState] = useState<WalletState>('disconnected');
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = walletState.onStateChange((newState) => {
      setState(newState);
    });

    const unsubConnect = walletEvents.on('connected', (data: any) => {
      setAddress(data.address);
    });

    const unsubDisconnect = walletEvents.on('disconnected', () => {
      setAddress(null);
    });

    return () => {
      unsubscribe();
      unsubConnect();
      unsubDisconnect();
    };
  }, []);

  const connect = async (walletType: string) => {
    walletState.setState('connecting');
    try {
      const result = await walletState.connect(walletType);
      walletState.setState('connected');
      walletEvents.emit('connected', result);
    } catch (error) {
      walletState.setState('error');
      walletEvents.emit('error', error);
    }
  };

  const disconnect = () => {
    if (address) {
      sessionManager.removeSession(address);
    }
    walletState.setState('disconnected');
    walletEvents.emit('disconnected');
  };

  return {
    state,
    address,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
    connect,
    disconnect
  };
};
