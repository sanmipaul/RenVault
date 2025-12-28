/**
 * SessionContext Provider
 * React Context for providing session management to the component tree
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { RefactoredSessionManager } from '../services/session/SessionManagerRefactored';
import { WalletKitSessionIntegration } from '../services/session/walletkit-session-integration';
import { AutomaticReconnectionService } from '../services/session/automatic-reconnection';
import { AppKitService } from '../services/walletkit-service';
import { initializeSessionManagement, cleanupSessionManagement } from '../utils/session-initialization';
import { logger } from '../utils/logger';

interface SessionContextType {
  sessionManager: RefactoredSessionManager;
  sessionIntegration: WalletKitSessionIntegration;
  reconnectionService: AutomaticReconnectionService;
  isInitialized: boolean;
  isInitializing: boolean;
  activeSessions: any[];
  currentSession: any | null;
  isReconnecting: boolean;
  lastError: Error | null;
  refreshSessions: () => Promise<void>;
  extendSession: (sessionTopic: string) => Promise<void>;
  disconnectSession: (sessionTopic: string) => Promise<void>;
  reconnect: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

interface SessionProviderProps {
  children: ReactNode;
  appKitService: AppKitService;
  onSessionRestored?: (session: any) => Promise<void>;
  onSessionExpired?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Session Provider Component
 * Wrap your app with this provider to enable session management
 */
export function SessionProvider({
  children,
  appKitService,
  onSessionRestored,
  onSessionExpired,
  onError,
}: SessionProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);

  const sessionManager = RefactoredSessionManager.getInstance();
  const sessionIntegration = WalletKitSessionIntegration.getInstance();
  const reconnectionService = AutomaticReconnectionService.getInstance();

  // Initialize session management
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setIsInitializing(true);
        logger.info('Session provider: Initializing session management');

        const result = await initializeSessionManagement({
          appKitService,
          onSessionRestored,
          onSessionExpired,
          enableAutoReconnect: true,
          enableMigration: true,
          enableMonitoring: true,
        });

        if (!isMounted) return;

        if (result.success) {
          setIsInitialized(true);
          await updateSessionState();
          logger.info('Session provider: Initialization successful');
        } else {
          const error = result.error || new Error('Initialization failed');
          setLastError(error);
          onError?.(error);
          logger.error('Session provider: Initialization failed', error);
        }
      } catch (error) {
        if (!isMounted) return;

        const err = error instanceof Error ? error : new Error('Initialization error');
        setLastError(err);
        onError?.(err);
        logger.error('Session provider: Initialization error', err);
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [appKitService, onSessionRestored, onSessionExpired, onError]);

  // Setup session listeners
  useEffect(() => {
    if (!isInitialized) return;

    const handleSessionCreated = () => updateSessionState();
    const handleSessionUpdated = () => updateSessionState();
    const handleSessionDeleted = () => updateSessionState();
    const handleReconnecting = () => {
      setIsReconnecting(true);
      setLastError(null);
    };
    const handleReconnected = () => {
      setIsReconnecting(false);
      updateSessionState();
    };
    const handleReconnectionFailed = (error: any) => {
      setLastError(error instanceof Error ? error : new Error('Reconnection failed'));
    };

    // Subscribe to events
    sessionIntegration.on('session_created', handleSessionCreated);
    sessionIntegration.on('session_updated', handleSessionUpdated);
    sessionIntegration.on('session_deleted', handleSessionDeleted);
    reconnectionService.on('reconnecting', handleReconnecting);
    reconnectionService.on('reconnected', handleReconnected);
    reconnectionService.on('failed', handleReconnectionFailed);

    return () => {
      // Unsubscribe from events
      sessionIntegration.off('session_created', handleSessionCreated);
      sessionIntegration.off('session_updated', handleSessionUpdated);
      sessionIntegration.off('session_deleted', handleSessionDeleted);
      reconnectionService.off('reconnecting', handleReconnecting);
      reconnectionService.off('reconnected', handleReconnected);
      reconnectionService.off('failed', handleReconnectionFailed);
    };
  }, [isInitialized]);

  // Update session state
  const updateSessionState = async () => {
    try {
      const sessions = sessionIntegration.getActiveSessions();
      setActiveSessions(sessions);

      const primary = sessionIntegration.getPrimarySession?.();
      setCurrentSession(primary || null);
    } catch (error) {
      logger.warn('Error updating session state', error);
    }
  };

  // Refresh sessions
  const refreshSessions = async () => {
    try {
      setLastError(null);
      await updateSessionState();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to refresh sessions');
      setLastError(err);
      onError?.(err);
      logger.error('Error refreshing sessions', err);
    }
  };

  // Extend session
  const extendSession = async (sessionTopic: string) => {
    try {
      setLastError(null);
      await sessionManager.extendSession(sessionTopic);
      await updateSessionState();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to extend session');
      setLastError(err);
      onError?.(err);
      logger.error('Error extending session', err);
    }
  };

  // Disconnect session
  const disconnectSession = async (sessionTopic: string) => {
    try {
      setLastError(null);
      await sessionManager.disconnectSession(sessionTopic);
      await updateSessionState();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to disconnect session');
      setLastError(err);
      onError?.(err);
      logger.error('Error disconnecting session', err);
    }
  };

  // Reconnect
  const reconnect = async () => {
    try {
      setLastError(null);
      await sessionManager.reconnect();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to reconnect');
      setLastError(err);
      onError?.(err);
      logger.error('Error during reconnection', err);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupSessionManagement();
    };
  }, []);

  const value: SessionContextType = {
    sessionManager,
    sessionIntegration,
    reconnectionService,
    isInitialized,
    isInitializing,
    activeSessions,
    currentSession,
    isReconnecting,
    lastError,
    refreshSessions,
    extendSession,
    disconnectSession,
    reconnect,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/**
 * useSessionContext Hook
 * Access session management from anywhere in the component tree
 */
export function useSessionContext(): SessionContextType {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }

  return context;
}

/**
 * Convenience hooks for common session operations
 */

export function useSessionInitialization() {
  const { isInitialized, isInitializing, lastError } = useSessionContext();

  return {
    isInitialized,
    isInitializing,
    isReady: isInitialized && !isInitializing,
    hasError: lastError !== null,
    error: lastError,
  };
}

export function useActiveSessions() {
  const { activeSessions, refreshSessions, isInitialized } = useSessionContext();

  useEffect(() => {
    if (isInitialized) {
      refreshSessions();

      // Refresh periodically
      const interval = setInterval(refreshSessions, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [isInitialized, refreshSessions]);

  return {
    sessions: activeSessions,
    count: activeSessions.length,
    refresh: refreshSessions,
  };
}

export function useCurrentSession() {
  const { currentSession, activeSessions } = useSessionContext();

  return {
    session: currentSession,
    isConnected: currentSession !== null,
    isMultiple: activeSessions.length > 1,
  };
}

export function useSessionError() {
  const { lastError, reconnect } = useSessionContext();

  return {
    error: lastError,
    hasError: lastError !== null,
    clear: () => {
      // Error will be cleared on next successful operation
    },
    retry: reconnect,
  };
}

export function useSessionOperations() {
  const { extendSession, disconnectSession, reconnect } = useSessionContext();

  return {
    extendSession,
    disconnectSession,
    reconnect,
  };
}

export function useReconnectionStatus() {
  const { isReconnecting, lastError } = useSessionContext();

  return {
    isReconnecting,
    error: lastError,
    isFailed: lastError !== null,
  };
}
