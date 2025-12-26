import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import ProviderSelector from './ProviderSelector';

export const WalletConnect: React.FC = () => {
  const { connect, disconnect, isLoading, error, selectedProviderType } = useWallet();
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState('');

  const handleConnect = async () => {
    try {
      const result = await connect();
      setAddress(result.address);
      setConnected(true);
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setConnected(false);
      setAddress('');
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  return (
    <div className="wallet-connect">
      <ProviderSelector />
      {selectedProviderType && (
        <div className="connect-section">
          {!connected ? (
            <button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? 'Connecting...' : `Connect with ${selectedProviderType}`}
            </button>
          ) : (
            <div>
              <p>Connected: {address}</p>
              <button onClick={handleDisconnect}>Disconnect</button>
            </div>
          )}
          {error && <p className="error">{error.message}</p>}
        </div>
      )}
    </div>
  );
};
