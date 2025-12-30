/**
 * React Hook for Smart Session Management
 * Provides session operations to components
 */

import { useState, useCallback, useEffect } from 'react';
import {
  SmartSessionConfig,
  SessionStatus,
  SessionConstraints,
  SpendingLimit,
} from '../types/smartsessions';
import { smartSessionService } from '../services/session/smart-session.service';
import { sessionPermissionManager } from '../services/session/session-permission-manager';
import { smartSessionAnalytics } from '../services/smart-session-analytics';

interface UseSmartSessionReturn {
  activeSessions: SmartSessionConfig[];
  selectedSession: SmartSessionConfig | null;
  loading: boolean;
  error: string | null;
  createSession: (
    duration: number,
    spendingLimit: SpendingLimit,
    constraints: SessionConstraints
  ) => Promise<void>;
  revokeSession: (sessionId: string) => void;
  selectSession: (sessionId: string | null) => void;
  refreshSessions: () => void;
}

export const useSmartSession = (walletAddress?: string): UseSmartSessionReturn => {
  const [activeSessions, setActiveSessions] = useState<SmartSessionConfig[]>([]);
  const [selectedSession, setSelectedSession] = useState<SmartSessionConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSessions = useCallback(() => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const sessions = smartSessionService.getActiveSessions(walletAddress);
      setActiveSessions(sessions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  const createSession = useCallback(
    async (duration: number, spendingLimit: SpendingLimit, constraints: SessionConstraints) => {
      if (!walletAddress) {
        setError('Wallet address not available');
        return;
      }

      setLoading(true);
      try {
        const session = smartSessionService.createSession({
          duration,
          spendingLimit,
          constraints,
          walletAddress,
        });

        smartSessionAnalytics.trackSessionCreated(session);
        refreshSessions();
        setError(null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to create session';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [walletAddress, refreshSessions]
  );

  const revokeSession = useCallback((sessionId: string) => {
    try {
      smartSessionService.revokeSession(sessionId);
      smartSessionAnalytics.trackSessionRevoked(sessionId);
      setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke session');
    }
  }, []);

  const selectSession = useCallback((sessionId: string | null) => {
    if (sessionId) {
      const session = smartSessionService.getSession(sessionId);
      setSelectedSession(session);
    } else {
      setSelectedSession(null);
    }
  }, []);

  useEffect(() => {
    refreshSessions();
    const interval = setInterval(refreshSessions, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, [refreshSessions]);

  return {
    activeSessions,
    selectedSession,
    loading,
    error,
    createSession,
    revokeSession,
    selectSession,
    refreshSessions,
  };
};

export default useSmartSession;
