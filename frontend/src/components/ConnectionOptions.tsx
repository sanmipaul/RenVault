// components/ConnectionOptions.tsx
import React from 'react';

interface ConnectionOptionsProps {
  onConnectStacks: () => void;
  onConnectWalletConnect: () => void;
  onCancel: () => void;
}

const ConnectionOptions: React.FC<ConnectionOptionsProps> = ({
  onConnectStacks,
  onConnectWalletConnect,
  onCancel,
}) => {
  return (
    <div className="card">
      <h2>Choose Connection Method</h2>
      <p>Select how you'd like to connect your wallet:</p>
      <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
        <button className="btn btn-primary" onClick={onConnectStacks}>
          Browser Extension (Stacks)
        </button>
        <button className="btn btn-secondary" onClick={onConnectWalletConnect}>
          WalletConnect (Mobile/Desktop)
        </button>
        <button className="btn btn-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ConnectionOptions;
