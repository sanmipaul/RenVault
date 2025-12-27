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
    return 'Connected via AppKit';
  };

  const getStatusClass = () => {
    if (!isConnected) return 'disconnected';
    return 'connected';
  };

  return (
    <div className={`connection-status ${getStatusClass()}`}>
      <div className="status-indicator">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
      </div>

      {!isConnected && (
        <div className="connection-message">
          Use the AppKit button above to connect your wallet
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;