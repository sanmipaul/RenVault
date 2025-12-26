import React from 'react';
import { WalletProvider } from './context/WalletProvider';
import { WalletConnect } from './components/WalletConnect';
import { useWallet } from './hooks/useWallet';
import './App.css';

const AppContent: React.FC = () => {
  const { isConnected, disconnect, connectionState } = useWallet();

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  };

  return (
    <div className='app-container'>
      <header>
        <h1>RenVault Wallet</h1>
        <p>Multi-Provider Wallet Integration</p>
        {isConnected && (
          <div className="header-actions">
            <span>Connected: {connectionState?.address.slice(0, 6)}...{connectionState?.address.slice(-4)}</span>
            <button onClick={handleDisconnect} className="disconnect-btn">Disconnect</button>
          </div>
        )}
      </header>
      <main>
        <WalletConnect />
      </main>
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
