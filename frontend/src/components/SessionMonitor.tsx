import React, { useState, useEffect } from 'react';
import { SmartSessionConfig, SessionStatus } from '../types/smartsessions';
import { smartSessionService } from '../services/session/smart-session.service';
import { sessionActivityLogger } from '../services/session/session-activity-logger';

interface SessionMonitorProps {
  walletAddress: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const SessionMonitor: React.FC<SessionMonitorProps> = ({
  walletAddress,
  autoRefresh = true,
  refreshInterval = 5000,
}) => {
  const [sessions, setSessions] = useState<SmartSessionConfig[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refreshSessions = () => {
      setLoading(true);
      try {
        const activeSessions = smartSessionService.getActiveSessions(walletAddress);
        setSessions(activeSessions);
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    refreshSessions();

    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(refreshSessions, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [walletAddress, autoRefresh, refreshInterval]);

  const handleRevokeSession = (sessionId: string) => {
    smartSessionService.revokeSession(sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const formatTimestamp = (ms: number): string => {
    const date = new Date(ms);
    return date.toLocaleString();
  };

  const getRemainingTime = (expiresAt: number): string => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return 'Expired';
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div className="session-monitor">
      <h3>Active Sessions</h3>
      
      {loading && <div className="loading">Loading sessions...</div>}

      {!loading && sessions.length === 0 && (
        <div className="no-sessions">No active sessions</div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="sessions-list">
          {sessions.map((session) => {
            const activityLogs = sessionActivityLogger.getSessionLogs(session.id);
            const successCount = activityLogs.filter((log) => log.status === 'success').length;

            return (
              <div key={session.id} className="session-card">
                <div className="session-header">
                  <h4>Session {session.id.substring(0, 16)}...</h4>
                  <span className={`status status-${session.status}`}>{session.status}</span>
                </div>

                <div className="session-details">
                  <div className="detail-row">
                    <label>Created:</label>
                    <span>{formatTimestamp(session.createdAt)}</span>
                  </div>

                  <div className="detail-row">
                    <label>Expires:</label>
                    <span>{formatTimestamp(session.expiresAt)}</span>
                  </div>

                  <div className="detail-row">
                    <label>Time Remaining:</label>
                    <span>{getRemainingTime(session.expiresAt)}</span>
                  </div>

                  <div className="detail-row">
                    <label>Spending Limit:</label>
                    <span>{(BigInt(session.spendingLimit.amount) / BigInt(1000000)).toString()} STX</span>
                  </div>

                  <div className="detail-row">
                    <label>Transactions Today:</label>
                    <span>{sessionActivityLogger.countTransactionsInPeriod(session.id, 24 * 60 * 60 * 1000)}</span>
                  </div>

                  <div className="detail-row">
                    <label>Total Successful:</label>
                    <span>{successCount}</span>
                  </div>

                  <div className="detail-row">
                    <label>Allowed Operations:</label>
                    <span>{session.constraints.operationWhitelist.join(', ')}</span>
                  </div>
                </div>

                <button
                  className="revoke-button"
                  onClick={() => handleRevokeSession(session.id)}
                  disabled={session.status !== SessionStatus.ACTIVE}
                >
                  Revoke Session
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionMonitor;
