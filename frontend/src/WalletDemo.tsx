import React from 'react';
import { useWalletKit } from './hooks/useWalletKit';
import { WalletKitProvider, useWalletKitContext } from './context/WalletKitProvider';
import { WalletConnect } from './components/WalletConnect';
import './App.css';

const AppContent: React.FC = () => {
  const { isLoading, error } = useWalletKitContext();

  if (isLoading) return <div className='loading'>Initializing WalletKit...</div>;
  if (error) return <div className='error'>Error: {error.message}</div>;

  return (
    <div className='app-container'>
      <header>
        <h1>RenVault Wallet</h1>
        <p>WalletConnect Integration</p>
      </header>
      <main>
        <WalletConnect />
      </main>
    </div>
  );
};

const App: React.FC = () => {
  const { walletKit, loading, error } = useWalletKit();

  return (
    <WalletKitProvider value={{ walletKit, isLoading: loading, error }}>
      <AppContent />
    </WalletKitProvider>
  );
};

export default App;
