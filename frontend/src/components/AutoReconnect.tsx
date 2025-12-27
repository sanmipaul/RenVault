// components/AutoReconnect.tsx
import React, { useEffect, useState } from 'react';
import { useSession } from '../hooks/useSession';
import { useWalletContext } from '../context/WalletProvider';
import { WalletProviderType } from '../types/wallet';
import './AutoReconnect.css';

interface AutoReconnectProps {
  onReconnectSuccess?: (providerType: WalletProviderType) => void;
  onReconnectFailure?: (error: string) => void;
  className?: string;
}

export const AutoReconnect: React.FC<AutoReconnectProps> = ({
  onReconnectSuccess,
  onReconnectFailure,
  className = ''
}) => {
  const { hasSession, currentSession, isRestoring } = useSession();
  const { connect, setSelectedProvider, isConnected } = useWalletContext();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectError, setReconnectError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt auto-reconnection when session is available but wallet is not connected
    const attemptAutoReconnect = async () => {
      if (hasSession && currentSession && !isConnected && !isRestoring && !isReconnecting) {
        try {
          setIsReconnecting(true);
          setReconnectError(null);

          console.log('Attempting auto-reconnection for provider:', currentSession.providerType);

          // Set the provider from session
          setSelectedProvider(currentSession.providerType);

          // Attempt to connect
          await connect();

          console.log('Auto-reconnection successful');
          onReconnectSuccess?.(currentSession.providerType);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Auto-reconnection failed';
          console.error('Auto-reconnection failed:', errorMessage);
          setReconnectError(errorMessage);
          onReconnectFailure?.(errorMessage);
        } finally {
          setIsReconnecting(false);
        }
      }
    };

    // Only attempt reconnection if we have a session and are not already connected
    if (hasSession && !isConnected && !isReconnecting) {
      // Add a small delay to ensure the wallet provider is ready
      const timer = setTimeout(attemptAutoReconnect, 1000);
      return () => clearTimeout(timer);
    }
  }, [hasSession, currentSession, isConnected, isRestoring, isReconnecting, connect, setSelectedProvider, onReconnectSuccess, onReconnectFailure]);

  // Don't render anything if no session or already connected
  if (!hasSession || isConnected || isRestoring) {
    return null;
  }

  if (isReconnecting) {
    return (
      <div className={`auto-reconnect reconnecting ${className}`}>
        <div className="reconnect-indicator">
          <div className="reconnect-spinner"></div>
          <span>Reconnecting to {currentSession?.providerType}...</span>
        </div>
      </div>
    );
  }

  if (reconnectError) {
    return (
      <div className={`auto-reconnect error ${className}`}>
        <div className="reconnect-indicator error">
          <span className="error-icon">❌</span>
          <span>Reconnection failed: {reconnectError}</span>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="retry-reconnect-btn"
        >
          Retry
        </button>
      </div>
    );
  }

  return null;
};