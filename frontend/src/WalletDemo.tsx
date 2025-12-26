import React, { useState } from 'react';
import { WalletProvider } from './context/WalletProvider';
import { WalletConnect } from './components/WalletConnect';
import { useWallet } from './hooks/useWallet';
import DisconnectModal from './components/DisconnectModal';
import AddressDisplay from './components/AddressDisplay';
import './App.css';

const AppContent: React.FC = () => {
  const { isConnected, disconnect, connectionState, currentProvider } = useWallet();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const handleDisconnectClick = () => {
    setShowDisconnectModal(true);
  };

  const handleLogout = async () => {
    try {
      await disconnect();
      // Additional logout logic if needed
      setShowDisconnectModal(false);
    } catch (err) {
      console.error('Logout failed:', err);
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
            <AddressDisplay address={connectionState?.address || ''} />
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
        onLogout={handleLogout}
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
