/**
 * Enhanced AutoReconnect Component
 * Displays reconnection status and handles user interactions during disconnection
 */

import React, { useEffect, useState } from 'react';
import { AutomaticReconnectionService, ReconnectionStatus } from '../services/session/automatic-reconnection';
import { WalletKitSessionIntegration } from '../services/session/walletkit-session-integration';
import { logger } from '../utils/logger';

export interface AutoReconnectProps {
  enabled?: boolean;
  autoHide?: boolean;
  hideDelay?: number;
  onReconnected?: () => void;
  onFailed?: () => void;
}

export interface AutoReconnectState {
  isVisible: boolean;
  status: ReconnectionStatus;
  isOnline: boolean;
  activeSessions: number;
}

/**
 * AutoReconnect Component
 * Shows reconnection status, progress, and retry controls
 */
export const EnhancedAutoReconnect: React.FC<AutoReconnectProps> = ({
  enabled = true,
  autoHide = true,
  hideDelay = 5000,
  onReconnected,
  onFailed,
}) => {
  const [state, setState] = useState<AutoReconnectState>({
    isVisible: false,
    status: {
      isReconnecting: false,
      lastAttempt: null,
      attemptCount: 0,
      nextRetryTime: null,
      lastError: null,
    },
    isOnline: navigator.onLine,
    activeSessions: 0,
  });

  const reconnectionService = AutomaticReconnectionService.getInstance();
  const sessionIntegration = WalletKitSessionIntegration.getInstance();
  const hideTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize component and setup listeners
   */
  useEffect(() => {
    if (!enabled) return;

    // Setup reconnection listeners
    reconnectionService.on('reconnecting', (status) => {
      setState((prev) => ({
        ...prev,
        status,
        isVisible: true,
      }));
      logger.info('AutoReconnect: reconnecting', status);
    });

    reconnectionService.on('reconnected', (status) => {
      setState((prev) => ({
        ...prev,
        status,
      }));

      onReconnected?.();
      logger.info('AutoReconnect: reconnected', status);

      if (autoHide) {
        scheduleHide(hideDelay);
      }
    });

    reconnectionService.on('failed', (status) => {
      setState((prev) => ({
        ...prev,
        status,
        isVisible: true,
      }));

      onFailed?.();
      logger.error('AutoReconnect: failed', status);
    });

    reconnectionService.on('offline', (status) => {
      setState((prev) => ({
        ...prev,
        status,
        isOnline: false,
        isVisible: true,
      }));
      logger.warn('AutoReconnect: offline', status);
    });

    reconnectionService.on('online', (status) => {
      setState((prev) => ({
        ...prev,
        status,
        isOnline: true,
      }));
      logger.info('AutoReconnect: online', status);
    });

    // Update active sessions count
    const updateSessions = () => {
      const sessions = sessionIntegration.getActiveSessions();
      setState((prev) => ({
        ...prev,
        activeSessions: sessions.length,
      }));
    };

    sessionIntegration.on('session_created', updateSessions);
    sessionIntegration.on('session_deleted', updateSessions);
    sessionIntegration.on('session_expired', updateSessions);

    // Initial session count
    updateSessions();

    // Cleanup
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, [enabled, autoHide, hideDelay, onReconnected, onFailed]);

  /**
   * Schedule hiding the component
   */
  const scheduleHide = (delay: number) => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }

    hideTimerRef.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        isVisible: false,
      }));
    }, delay);
  };

  /**
   * Handle manual reconnect
   */
  const handleManualReconnect = async () => {
    try {
      logger.info('Manual reconnect triggered');
      await reconnectionService.reconnect();
    } catch (error) {
      logger.error('Manual reconnect failed', error);
    }
  };

  /**
   * Handle close button
   */
  const handleClose = () => {
    setState((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  if (!state.isVisible) {
    return null;
  }

  const { status, isOnline, activeSessions } = state;
  const progressPercent = status.attemptCount > 0 ? (status.attemptCount / 5) * 100 : 0;

  return (
    <div className="auto-reconnect-container">
      <div className={`auto-reconnect-banner ${status.isReconnecting ? 'reconnecting' : 'disconnected'}`}>
        <div className="auto-reconnect-content">
          <div className="auto-reconnect-header">
            {status.isReconnecting ? (
              <>
                <span className="reconnect-icon spinning">⟳</span>
                <span className="reconnect-title">Reconnecting...</span>
              </>
            ) : isOnline ? (
              <>
                <span className="reconnect-icon">⚠</span>
                <span className="reconnect-title">Connection Lost</span>
              </>
            ) : (
              <>
                <span className="reconnect-icon">✕</span>
                <span className="reconnect-title">Offline</span>
              </>
            )}
          </div>

          <div className="auto-reconnect-details">
            <p className="reconnect-message">
              {status.isReconnecting
                ? `Attempt ${status.attemptCount} of 5`
                : isOnline
                  ? 'Attempting to restore your session...'
                  : 'No internet connection. Waiting for network...'}
            </p>

            {status.nextRetryTime && !status.isReconnecting && (
              <p className="reconnect-retry-time">
                Retrying in {Math.ceil((status.nextRetryTime - Date.now()) / 1000)}s
              </p>
            )}

            {status.lastError && !status.isReconnecting && (
              <p className="reconnect-error">{status.lastError}</p>
            )}

            {activeSessions > 0 && (
              <p className="reconnect-sessions">{activeSessions} session(s) to restore</p>
            )}
          </div>

          {status.isReconnecting && (
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          )}

          <div className="auto-reconnect-actions">
            {!status.isReconnecting && isOnline && (
              <button onClick={handleManualReconnect} className="reconnect-button primary">
                Reconnect Now
              </button>
            )}
            <button onClick={handleClose} className="reconnect-button secondary">
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .auto-reconnect-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          max-width: 400px;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .auto-reconnect-banner {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 16px;
          border-left: 4px solid;
        }

        .auto-reconnect-banner.reconnecting {
          border-left-color: #ff9800;
          background: #fff8f0;
        }

        .auto-reconnect-banner.disconnected {
          border-left-color: #f44336;
          background: #fff5f5;
        }

        .auto-reconnect-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .auto-reconnect-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          font-size: 14px;
        }

        .reconnect-icon {
          font-size: 18px;
          display: inline-flex;
          align-items: center;
        }

        .reconnect-icon.spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .auto-reconnect-details {
          font-size: 13px;
          line-height: 1.5;
          color: #666;
        }

        .auto-reconnect-details p {
          margin: 4px 0;
        }

        .reconnect-message {
          color: #333;
          font-weight: 500;
        }

        .reconnect-retry-time {
          color: #ff9800;
          font-size: 12px;
        }

        .reconnect-error {
          color: #d32f2f;
          font-size: 12px;
        }

        .reconnect-sessions {
          color: #1976d2;
          font-size: 12px;
        }

        .progress-bar {
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff9800, #ffb74d);
          transition: width 0.3s ease;
        }

        .auto-reconnect-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }

        .reconnect-button {
          padding: 6px 12px;
          font-size: 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .reconnect-button.primary {
          background: #1976d2;
          color: white;
        }

        .reconnect-button.primary:hover {
          background: #1565c0;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .reconnect-button.secondary {
          background: #e0e0e0;
          color: #333;
        }

        .reconnect-button.secondary:hover {
          background: #d0d0d0;
        }

        @media (max-width: 480px) {
          .auto-reconnect-container {
            max-width: calc(100% - 40px);
            right: 20px;
            left: 20px;
          }

          .auto-reconnect-actions {
            flex-direction: column;
          }

          .reconnect-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedAutoReconnect;
