// components/ProviderSelector.tsx
import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { WalletProviderType } from '../types/wallet';
import HardwareWalletConnector from './HardwareWalletConnector';

const ProviderSelector: React.FC = () => {
  const { walletManager, selectedProviderType, setSelectedProvider } = useWallet();
  const providers = walletManager.getAvailableProviders();

  const isHardwareWallet = (type: string) => type === 'ledger' || type === 'trezor';

  return (
    <div className="provider-selector">
      <h3>Select Wallet Provider</h3>
      <div className="provider-list">
        {providers.map((provider) => (
          <div key={provider.id}>
            <button
              className={`provider-button ${selectedProviderType === provider.id ? 'selected' : ''}`}
              onClick={() => setSelectedProvider(provider.id as WalletProviderType)}
            >
              {provider.icon && <img src={provider.icon} alt={provider.name} />}
              {provider.name}
            </button>
            {selectedProviderType === provider.id && isHardwareWallet(provider.id) && (
              <HardwareWalletConnector providerType={provider.id as 'ledger' | 'trezor'} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProviderSelector;