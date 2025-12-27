// hooks/useSession.ts
import { useState, useEffect, useCallback } from 'react';
import { WalletSession } from '../services/session/SessionStorageService';
import { SessionManager } from '../services/session/SessionManager';
import { WalletProviderType } from '../types/wallet';

export interface UseSessionReturn {
  // Session state
  hasSession: boolean;
  currentSession: WalletSession | null;
  isRestoring: boolean;
  sessionError: string | null;

  // Session actions
  storeSession: (sessionData: Omit<WalletSession, 'expiresAt' | 'sessionId'>) => void;
  clearSession: () => void;
  updateSessionMetadata: (metadata: Partial<WalletSession['metadata']>) => void;
  extendSession: () => void;

  // Session info
  getSessionStatus: () => {
    hasSession: boolean;
    expiresAt?: number;
    timeRemaining?: number;
    reconnectAttempts: number;
    maxReconnectAttempts: number;
  };

  // Session events
  onSessionRestored: (callback: (session: WalletSession) => Promise<void>) => void;
  onSessionExpired: (callback: () => void) => void;

  // Additional utilities
  validateSessionIntegrity: () => boolean;
  clearAllWalletData: () => void;
}

export const useSession = (): UseSessionReturn => {
  const [hasSession, setHasSession] = useState(false);
  const [currentSession, setCurrentSession] = useState<WalletSession | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const sessionManager = SessionManager.getInstance();

  // Initialize session manager callbacks
  useEffect(() => {
    sessionManager.initialize(
      async (session) => {
        setCurrentSession(session);
        setHasSession(true);
        setSessionError(null);
        console.log('Session restored in hook:', session.providerType);
      },
      () => {
        // Session expired
        setCurrentSession(null);
        setHasSession(false);
        setSessionError('Session expired');
        console.log('Session expired in hook');
      }
    );
  }, []);

  // Attempt session restoration on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        setIsRestoring(true);
        setSessionError(null);

        const restored = await sessionManager.attemptSessionRestore();

        if (restored) {
          const session = sessionManager.getCurrentSession();
          setCurrentSession(session);
          setHasSession(true);
        } else {
          setCurrentSession(null);
          setHasSession(false);
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        setSessionError('Failed to restore session');
        setCurrentSession(null);
        setHasSession(false);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, []);

  // Store new session
  const storeSession = useCallback((sessionData: Omit<WalletSession, 'expiresAt' | 'sessionId'>) => {
    try {
      sessionManager.storeSession(sessionData);
      const session = sessionManager.getCurrentSession();
      setCurrentSession(session);
      setHasSession(true);
      setSessionError(null);
    } catch (error) {
      console.error('Failed to store session:', error);
      setSessionError('Failed to store session');
    }
  }, []);

  // Clear session
  const clearSession = useCallback(() => {
    sessionManager.clearSession();
    setCurrentSession(null);
    setHasSession(false);
    setSessionError(null);
  }, []);

  // Update session metadata
  const updateSessionMetadata = useCallback((metadata: Partial<WalletSession['metadata']>) => {
    sessionManager.updateSessionMetadata(metadata);
    const session = sessionManager.getCurrentSession();
    setCurrentSession(session);
  }, []);

  // Extend session
  const extendSession = useCallback(() => {
    sessionManager.extendSession();
    const session = sessionManager.getCurrentSession();
    setCurrentSession(session);
  }, []);

  // Get session status
  const getSessionStatus = useCallback(() => {
    return sessionManager.getSessionStatus();
  }, []);

  // Set session restored callback
  const onSessionRestored = useCallback((callback: (session: WalletSession) => Promise<void>) => {
    sessionManager.initialize(callback, sessionManager['onSessionExpired']);
  }, []);

  // Set session expired callback
  const onSessionExpired = useCallback((callback: () => void) => {
    sessionManager.initialize(sessionManager['onSessionRestored'], callback);
  }, []);

  // Validate session integrity
  const validateSessionIntegrity = useCallback(() => {
    return sessionManager['sessionStorage'].validateSessionIntegrity();
  }, []);

  // Clear all wallet data
  const clearAllWalletData = useCallback(() => {
    sessionManager['sessionStorage'].clearAllWalletData();
    setCurrentSession(null);
    setHasSession(false);
    setSessionError(null);
  }, []);

  return {
    hasSession,
    currentSession,
    isRestoring,
    sessionError,
    storeSession,
    clearSession,
    updateSessionMetadata,
    extendSession,
    getSessionStatus,
    onSessionRestored,
    onSessionExpired,
    validateSessionIntegrity,
    clearAllWalletData
  };
};