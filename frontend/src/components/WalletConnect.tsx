import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import ProviderSelector from './ProviderSelector';

export const WalletConnect: React.FC = () => {
  const { connect, disconnect, isLoading, error, selectedProviderType, isConnected, connectionState } = useWallet();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Connection failed:', err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  return (
    <div className="wallet-connect">
      <ProviderSelector />
      {selectedProviderType && (
        <div className="connect-section">
          {!isConnected ? (
            <button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? 'Connecting...' : `Connect with ${selectedProviderType}`}
            </button>
          ) : (
            <div className="connected-state">
              <p>Connected: {connectionState?.address}</p>
              <button onClick={handleDisconnect} className="disconnect-btn">
                Disconnect
              </button>
            </div>
          )}
          {error && <p className="error">{error.message}</p>}
        </div>
      )}
    </div>
  );
};
