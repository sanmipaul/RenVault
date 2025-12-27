// components/SessionStatus.tsx
import React from 'react';
import { useSession } from '../hooks/useSession';
import { useWalletContext } from '../context/WalletProvider';
import './SessionStatus.css';

interface SessionStatusProps {
  className?: string;
}

export const SessionStatus: React.FC<SessionStatusProps> = ({ className = '' }) => {
  const {
    hasSession,
    currentSession,
    isRestoring,
    sessionError,
    clearSession,
    extendSession,
    getSessionStatus
  } = useSession();

  const { isConnected, connectionState } = useWalletContext();

  const sessionStatus = getSessionStatus();
  const timeRemaining = sessionStatus.timeRemaining;
  const expiresAt = sessionStatus.expiresAt;

  // Format time remaining
  const formatTimeRemaining = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Format expiration date
  const formatExpirationDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  if (isRestoring) {
    return (
      <div className={`session-status restoring ${className}`}>
        <div className="session-indicator">
          <div className="spinner"></div>
          <span>Restoring session...</span>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className={`session-status error ${className}`}>
        <div className="session-indicator error">
          <span className="error-icon">⚠️</span>
          <span>{sessionError}</span>
        </div>
        <button
          onClick={clearSession}
          className="clear-session-btn"
        >
          Clear Session
        </button>
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className={`session-status no-session ${className}`}>
        <div className="session-indicator">
          <span className="no-session-icon">🔓</span>
          <span>No active session</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`session-status active ${className}`}>
      <div className="session-info">
        <div className="session-indicator connected">
          <span className="connected-icon">🔐</span>
          <span>Session Active</span>
        </div>

        <div className="session-details">
          {currentSession && (
            <>
              <div className="session-provider">
                Provider: <strong>{currentSession.providerType}</strong>
              </div>
              <div className="session-address">
                Address: <code>{currentSession.address.slice(0, 6)}...{currentSession.address.slice(-4)}</code>
              </div>
            </>
          )}

          {timeRemaining && timeRemaining > 0 && (
            <div className="session-expiry">
              Expires in: <strong>{formatTimeRemaining(timeRemaining)}</strong>
              {expiresAt && (
                <span className="expiry-tooltip" title={`Expires: ${formatExpirationDate(expiresAt)}`}>
                  ⓘ
                </span>
              )}
            </div>
          )}

          {timeRemaining && timeRemaining < 30 * 60 * 1000 && ( // Less than 30 minutes
            <div className="session-warning">
              <span className="warning-icon">⏰</span>
              Session expiring soon
            </div>
          )}
        </div>
      </div>

      <div className="session-actions">
        <button
          onClick={extendSession}
          className="extend-session-btn"
          title="Extend session by 7 days"
        >
          Extend Session
        </button>
        <button
          onClick={clearSession}
          className="clear-session-btn"
          title="Clear session and disconnect"
        >
          Clear Session
        </button>
      </div>
    </div>
  );
};