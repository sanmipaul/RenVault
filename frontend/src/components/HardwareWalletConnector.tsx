// components/HardwareWalletConnector.tsx
import React, { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { WalletProviderType } from '../types/wallet';

interface HardwareWalletConnectorProps {
  providerType: 'ledger' | 'trezor';
}

const HardwareWalletConnector: React.FC<HardwareWalletConnectorProps> = ({ providerType }) => {
  const { connectWallet } = useWallet();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      await connectWallet(providerType);
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  const instructions = providerType === 'ledger'
    ? [
        'Ensure your Ledger device is connected via USB.',
        'Open the Stacks app on your Ledger.',
        'Click "Connect" below.',
      ]
    : [
        'Ensure your Trezor device is connected.',
        'Open the Trezor Bridge or use web interface.',
        'Click "Connect" below.',
      ];

  return (
    <div className="hardware-wallet-connector">
      <h3>Connect {providerType === 'ledger' ? 'Ledger' : 'Trezor'} Wallet</h3>
      <ul>
        {instructions.map((instruction, index) => (
          <li key={index}>{instruction}</li>
        ))}
      </ul>
      {error && <p className="error">{error}</p>}
      <button onClick={handleConnect} disabled={connecting}>
        {connecting ? 'Connecting...' : 'Connect'}
      </button>
    </div>
  );
};

export default HardwareWalletConnector;