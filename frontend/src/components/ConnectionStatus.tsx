import React from 'react';
import './ConnectionStatus.css';

interface ConnectionStatusProps {
  isConnected: boolean;
  connectionMethod: 'stacks' | 'walletconnect' | null;
  walletAddress?: string;
  onDisconnect?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  connectionMethod,
  walletAddress,
  onDisconnect
}) => {
  const getStatusIcon = () => {
    if (!isConnected) return '🔴';
    return connectionMethod === 'walletconnect' ? '📱' : '🌐';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Not Connected';
    return connectionMethod === 'walletconnect' ? 'WalletConnect' : 'Stacks Wallet';
  };

  const getStatusClass = () => {
    if (!isConnected) return 'disconnected';
    return 'connected';
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`connection-status ${getStatusClass()}`}>
      <div className="status-indicator">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
      </div>

      {isConnected && walletAddress && (
        <div className="wallet-info">
          <span className="wallet-address">{formatAddress(walletAddress)}</span>
          {onDisconnect && (
            <button
              className="disconnect-btn"
              onClick={onDisconnect}
              title="Disconnect wallet"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {!isConnected && (
        <div className="connection-message">
          Click "Connect Wallet" to get started
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;