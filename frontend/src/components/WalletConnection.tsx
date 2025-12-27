import React from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { WalletError, WalletErrorCode, getFriendlyErrorMessage } from '../utils/wallet-errors';
import { logger } from '../utils/logger';

/**
 * WalletConnection - Updated to use AppKit hooks
 * 
 * This component now leverages AppKit's built-in modal system
 * instead of custom QR code generation and session proposal modals.
 * The connection flow is simplified and provides a better UX.
 */
interface WalletConnectionProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  onError?: (error: WalletError) => void;
  buttonStyle?: React.CSSProperties;
  buttonTextStyle?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  showDisconnectButton?: boolean;
  autoConnect?: boolean;
}

const WalletConnection: React.FC<WalletConnectionProps> = ({
  onConnect,
  onDisconnect,
  onError,
  buttonStyle,
  buttonTextStyle,
  containerStyle,
  showDisconnectButton = true,
  autoConnect = true,
}) => {
  const { open } = useAppKit();
  const { address, isConnected, status } = useAppKitAccount();

  const handleConnect = async () => {
    try {
      open();
    } catch (error) {
      const walletError = new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to open wallet modal',
        error
      );

      logger.error('Connection failed:', walletError);
      onError?.(walletError);
    }
  };

  const handleDisconnect = async () => {
    try {
      // AppKit handles disconnection internally
      // This might need to be implemented based on AppKit's API
      onDisconnect?.();
    } catch (error) {
      const walletError = new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to disconnect wallet',
        error
      );

      logger.error('Disconnection failed:', walletError);
      onError?.(walletError);
    }
  };

  const handleRetry = () => {
    // Reset any error state if needed
  };

  const renderButton = () => {
    if (isConnected && address) {
      if (!showDisconnectButton) return null;

      const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

      return (
        <button
          style={{ ...styles.disconnectButton, ...buttonStyle }}
          onClick={handleDisconnect}
        >
          <span style={{ ...styles.buttonText, ...buttonTextStyle }}>
            Disconnect: {shortAddress}
          </span>
        </button>
      );
    }

    return (
      <button
        style={{ ...styles.connectButton, ...buttonStyle }}
        onClick={handleConnect}
        disabled={status === 'connecting'}
      >
        {status === 'connecting' ? (
          <span>Loading...</span>
        ) : (
          <span style={{ ...styles.buttonText, ...buttonTextStyle }}>
            Connect Wallet
          </span>
        )}
      </button>
    );
  };

  return (
    <div style={{ ...styles.container, ...containerStyle }}>
      {renderButton()}
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#4a80f5',
    padding: '12px 24px',
    borderRadius: 8,
    border: 'none',
    minWidth: 180,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  disconnectButton: {
    backgroundColor: '#f54a4a',
    padding: '12px 24px',
    borderRadius: 8,
    border: 'none',
    minWidth: 180,
    alignItems: 'center',
    cursor: 'pointer',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    padding: 8,
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  retryButtonText: {
    color: '#1976d2',
    fontWeight: '500',
  },
};

export default WalletConnection;
