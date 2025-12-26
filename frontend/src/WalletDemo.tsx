import React from 'react';
import { WalletProvider } from './context/WalletProvider';
import { WalletConnect } from './components/WalletConnect';
import './App.css';

const AppContent: React.FC = () => {
  return (
    <div className='app-container'>
      <header>
        <h1>RenVault Wallet</h1>
        <p>Multi-Provider Wallet Integration</p>
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
