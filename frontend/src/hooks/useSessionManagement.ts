/**
 * React Hooks for WalletKit Session Management Integration
 * Provides easy integration of advanced session management in React components
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  WalletKitSessionIntegration,
  WalletKitSession,
} from '../services/session/walletkit-session-integration';
import { AutomaticReconnectionService, ReconnectionStatus } from '../services/session/automatic-reconnection';
import { RefactoredSessionManager } from '../services/session/SessionManagerRefactored';
import { SessionManagementUtils, SessionUtils } from '../utils/session-utils';

/**
 * Hook for accessing active sessions
 */
export function useWalletSessions() {
  const [sessions, setSessions] = useState<WalletKitSession[]>([]);
  const sessionIntegration = WalletKitSessionIntegration.getInstance();

  useEffect(() => {
    // Initial load
    setSessions(sessionIntegration.getActiveSessions());

    // Setup listeners
    const updateSessions = () => {
      setSessions(sessionIntegration.getActiveSessions());
    };

    sessionIntegration.on('session_created', updateSessions);
    sessionIntegration.on('session_updated', updateSessions);
    sessionIntegration.on('session_deleted', updateSessions);
    sessionIntegration.on('session_expired', updateSessions);

    return () => {
      // Cleanup listeners
    };
  }, [sessionIntegration]);

  return sessions;
}

/**
 * Hook for accessing primary/active session
 */
export function useCurrentSession() {
  const [session, setSession] = useState<WalletKitSession | undefined>(
    WalletKitSessionIntegration.getInstance().getPrimarySession()
  );
  const sessionIntegration = WalletKitSessionIntegration.getInstance();

  useEffect(() => {
    const updateSession = () => {
      setSession(sessionIntegration.getPrimarySession());
    };

    sessionIntegration.on('session_created', updateSession);
    sessionIntegration.on('session_deleted', updateSession);
    sessionIntegration.on('session_expired', updateSession);

    return () => {
      // Cleanup
    };
  }, [sessionIntegration]);

  return session;
}

/**
 * Hook for reconnection status
 */
export function useSessionReconnection() {
  const [status, setStatus] = useState<ReconnectionStatus>(
    AutomaticReconnectionService.getInstance().getStatus()
  );
  const reconnectionService = AutomaticReconnectionService.getInstance();

  useEffect(() => {
    const updateStatus = (newStatus: ReconnectionStatus) => {
      setStatus(newStatus);
    };

    reconnectionService.on('reconnecting', updateStatus);
    reconnectionService.on('reconnected', updateStatus);
    reconnectionService.on('failed', updateStatus);

    return () => {
      // Cleanup
    };
  }, [reconnectionService]);

  const isOnline = reconnectionService.isOnlineNow();

  return {
    status,
    isReconnecting: status.isReconnecting,
    attemptCount: status.attemptCount,
    lastError: status.lastError,
    isOnline,
  };
}

/**
 * Hook for session storage statistics
 */
export function useSessionStorage() {
  const [stats, setStats] = useState(() => {
    const sessionManager = RefactoredSessionManager.getInstance();
    return sessionManager.getStorageStats();
  });

  useEffect(() => {
    // Update stats periodically
    const interval = setInterval(() => {
      const sessionManager = RefactoredSessionManager.getInstance();
      setStats(sessionManager.getStorageStats());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    ...stats,
    usagePercent: Math.round(stats.usagePercent),
    formatted: SessionUtils.formatBytes(stats.totalSize),
  };
}

/**
 * Hook for session health check
 */
export function useSessionHealthCheck() {
  const [health, setHealth] = useState(() => SessionManagementUtils.checkSessionHealth());

  useEffect(() => {
    const updateHealth = () => {
      setHealth(SessionManagementUtils.checkSessionHealth());
    };

    // Check on mount and when sessions change
    const sessionIntegration = WalletKitSessionIntegration.getInstance();
    sessionIntegration.on('session_created', updateHealth);
    sessionIntegration.on('session_deleted', updateHealth);
    sessionIntegration.on('session_expired', updateHealth);

    // Check periodically
    const interval = setInterval(updateHealth, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return health;
}

/**
 * Hook for session extension
 */
export function useExtendSession() {
  const sessionIntegration = WalletKitSessionIntegration.getInstance();
  const [extending, setExtending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extendSession = useCallback(
    async (topic: string) => {
      setExtending(topic);
      setError(null);

      try {
        const success = await sessionIntegration.extendSession(topic);
        if (!success) {
          setError('Failed to extend session');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setExtending(null);
      }
    },
    [sessionIntegration]
  );

  return { extendSession, extending, error };
}

/**
 * Hook for session disconnection
 */
export function useDisconnectSession() {
  const sessionIntegration = WalletKitSessionIntegration.getInstance();
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const disconnectSession = useCallback(
    async (topic: string) => {
      setDisconnecting(topic);
      setError(null);

      try {
        await sessionIntegration.disconnectSession(topic);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setDisconnecting(null);
      }
    },
    [sessionIntegration]
  );

  return { disconnectSession, disconnecting, error };
}

/**
 * Hook for manual reconnection
 */
export function useSessionReconnect() {
  const sessionManager = RefactoredSessionManager.getInstance();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reconnect = useCallback(async () => {
    setConnecting(true);
    setError(null);

    try {
      await sessionManager.reconnect();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setConnecting(false);
    }
  }, [sessionManager]);

  return { reconnect, connecting, error };
}

/**
 * Hook for session export/import
 */
export function useSessionBackup() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportSessions = useCallback(async () => {
    setExporting(true);
    setError(null);

    try {
      return await SessionManagementUtils.exportSessionsForBackup();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setExporting(false);
    }
  }, []);

  const importSessions = useCallback(async (backupData: string) => {
    setImporting(true);
    setError(null);

    try {
      return await SessionManagementUtils.importSessionsFromBackup(backupData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setImporting(false);
    }
  }, []);

  const clearAllSessions = useCallback(async () => {
    setExporting(true);
    setError(null);

    try {
      return await SessionManagementUtils.clearAllSessions();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      return false;
    } finally {
      setExporting(false);
    }
  }, []);

  return {
    exportSessions,
    importSessions,
    clearAllSessions,
    exporting,
    importing,
    error,
  };
}

/**
 * Combined comprehensive session management hook
 */
export function useSessionManagement() {
  const sessions = useWalletSessions();
  const currentSession = useCurrentSession();
  const reconnection = useSessionReconnection();
  const storage = useSessionStorage();
  const health = useSessionHealthCheck();
  const { extendSession, extending, error: extendError } = useExtendSession();
  const { disconnectSession, disconnecting, error: disconnectError } = useDisconnectSession();
  const { reconnect, connecting, error: reconnectError } = useSessionReconnect();
  const backup = useSessionBackup();

  return {
    // Session data
    sessions,
    currentSession,
    sessionCount: sessions.length,
    
    // Reconnection
    reconnection,
    
    // Storage
    storage,
    
    // Health
    health,
    isHealthy: health.healthy,
    
    // Actions
    extendSession,
    disconnectSession,
    reconnect,
    ...backup,
    
    // Loading states
    extending,
    disconnecting,
    connecting,
    isLoading: extending !== null || disconnecting !== null || connecting,
    
    // Errors
    extendError,
    disconnectError,
    reconnectError,
    
    // Computed properties
    hasActiveSessions: sessions.length > 0,
    hasHealthIssues: health.issues.length > 0,
    storageUsageHigh: storage.usagePercent > 75,
  };
}

/**
 * Hook for session event tracking and logging
 */
export function useSessionEvents() {
  const [events, setEvents] = useState<number>(0);
  const sessionIntegration = WalletKitSessionIntegration.getInstance();

  useEffect(() => {
    const incrementEvent = () => {
      setEvents((prev) => prev + 1);
    };

    sessionIntegration.on('session_created', incrementEvent);
    sessionIntegration.on('session_updated', incrementEvent);
    sessionIntegration.on('session_deleted', incrementEvent);
    sessionIntegration.on('session_expired', incrementEvent);
    sessionIntegration.on('session_error', incrementEvent);

    return () => {
      // Cleanup
    };
  }, [sessionIntegration]);

  return events;
}
