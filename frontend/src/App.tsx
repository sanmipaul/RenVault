import React, { useState, useEffect } from 'react';
import { WalletKit } from '@reown/walletkit';
import { Core } from '@walletconnect/core';
import { useWalletKit } from './hooks/useWalletKit';
import { WalletKitProvider } from './context/WalletKitProvider';
import { WalletConnect } from './components/WalletConnect';
import walletKitConfig from './lib/walletkit-config';
import './App.css';

const AppContent: React.FC = () => {
  const { walletKit, loading, error } = useWalletKit();

  if (loading) return <div className='loading'>Initializing WalletKit...</div>;
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
