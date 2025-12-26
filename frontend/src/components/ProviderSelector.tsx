// components/ProviderSelector.tsx
import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { WalletProviderType } from '../types/wallet';

const ProviderSelector: React.FC = () => {
  const { walletManager, selectedProviderType, setSelectedProvider } = useWallet();
  const providers = walletManager.getAvailableProviders();

  return (
    <div className="provider-selector">
      <h3>Select Wallet Provider</h3>
      <div className="provider-list">
        {providers.map((provider) => (
          <button
            key={provider.id}
            className={`provider-button ${selectedProviderType === provider.id ? 'selected' : ''}`}
            onClick={() => setSelectedProvider(provider.id as WalletProviderType)}
          >
            {provider.icon && <img src={provider.icon} alt={provider.name} />}
            {provider.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProviderSelector;