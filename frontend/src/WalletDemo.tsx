import React, { useState } from 'react';
import { WalletProvider } from './context/WalletProvider';
import { WalletConnect } from './components/WalletConnect';
import { useWallet } from './hooks/useWallet';
import DisconnectModal from './components/DisconnectModal';
import './App.css';

const AppContent: React.FC = () => {
  const { isConnected, disconnect, connectionState, currentProvider } = useWallet();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const handleDisconnectClick = () => {
    setShowDisconnectModal(true);
  };

  const handleDisconnectConfirm = async () => {
    try {
      await disconnect();
      setShowDisconnectModal(false);
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  const handleDisconnectCancel = () => {
    setShowDisconnectModal(false);
  };

  return (
    <div className='app-container'>
      <header>
        <h1>RenVault Wallet</h1>
        <p>Multi-Provider Wallet Integration</p>
        {isConnected && (
          <div className="header-actions">
            <span>Connected: {connectionState?.address.slice(0, 6)}...{connectionState?.address.slice(-4)}</span>
            <button onClick={handleDisconnectClick} className="disconnect-btn">Disconnect</button>
          </div>
        )}
      </header>
      <main>
        <WalletConnect />
      </main>
      <DisconnectModal
        isOpen={showDisconnectModal}
        onConfirm={handleDisconnectConfirm}
        onCancel={handleDisconnectCancel}
        providerName={currentProvider?.name || 'wallet'}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
};

export default App;
