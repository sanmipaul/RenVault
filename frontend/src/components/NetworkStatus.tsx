// components/NetworkStatus.tsx
import React from 'react';
import './NetworkStatus.css';
import { NetworkType } from '../types/app';

interface NetworkStatusProps {
  detectedNetwork: NetworkType | null;
  onPromptSwitch: () => void;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ detectedNetwork, onPromptSwitch }) => {
  if (detectedNetwork === 'mainnet') {
    return (
      <div className="card success">
        <h3>Connected to Mainnet</h3>
        <p>You are connected to the correct network. You can now use RenVault.</p>
      </div>
    );
  }

  return (
    <div className="card warning">
      <h3>Network Mismatch Detected</h3>
      <p>
        Your wallet is connected to <strong>{detectedNetwork}</strong>, but RenVault operates on{' '}
        <strong>mainnet</strong>.
      </p>
      <p>Please switch your wallet to mainnet to use this application.</p>
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button className="btn btn-primary" onClick={onPromptSwitch}>
          How to Switch Network
        </button>
        <button className="btn btn-secondary" onClick={() => window.location.reload()}>
          Refresh After Switching
        </button>
      </div>
    </div>
  );
};

export default NetworkStatus;
