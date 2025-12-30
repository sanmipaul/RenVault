/**
 * Admin Session Dashboard
 * Central management interface for all sessions (admin only)
 */

import React, { useState, useEffect } from 'react';
import { SmartSessionConfig, SessionAnomalyAlert } from '../types/smartsessions';
import { smartSessionService } from '../services/session/smart-session.service';
import { sessionActivityLogger } from '../services/session/session-activity-logger';

interface AdminSessionDashboardProps {
  isAdmin?: boolean;
}

const AdminSessionDashboard: React.FC<AdminSessionDashboardProps> = ({ isAdmin = false }) => {
  const [allSessions, setAllSessions] = useState<SmartSessionConfig[]>([]);
  const [anomalies, setAnomalies] = useState<SessionAnomalyAlert[]>([]);
  const [selectedSession, setSelectedSession] = useState<SmartSessionConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    const refreshData = () => {
      setLoading(true);
      try {
        const sessions = smartSessionService.getAllSessions();
        setAllSessions(sessions);

        // Detect anomalies for all sessions
        const allAnomalies: SessionAnomalyAlert[] = [];
        for (const session of sessions) {
          const sessionAnomalies = sessionActivityLogger.detectAnomalies(session);
          allAnomalies.push(...sessionAnomalies);
        }
        setAnomalies(allAnomalies);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    refreshData();
    const interval = setInterval(refreshData, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin) {
    return <div className="admin-only">Admin access required</div>;
  }

  const getSessionStats = () => ({
    total: allSessions.length,
    active: allSessions.filter((s) => s.status === 'active').length,
    anomalies: anomalies.length,
    highSeverity: anomalies.filter((a) => a.severity === 'high').length,
  });

  const stats = getSessionStats();

  return (
    <div className="admin-session-dashboard">
      <h2>Smart Sessions Admin Dashboard</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Sessions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active}</div>
          <div className="stat-label">Active Sessions</div>
        </div>
        <div className="stat-card alert">
          <div className="stat-value">{stats.anomalies}</div>
          <div className="stat-label">Anomalies Detected</div>
        </div>
        <div className="stat-card critical">
          <div className="stat-value">{stats.highSeverity}</div>
          <div className="stat-label">High Severity</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="sessions-section">
          <h3>All Sessions</h3>
          {loading && <div className="loading">Loading...</div>}
          <div className="sessions-table">
            <table>
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Wallet</th>
                  <th>Status</th>
                  <th>Expires In</th>
                  <th>Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allSessions.map((session) => (
                  <tr key={session.id} onClick={() => setSelectedSession(session)}>
                    <td>{session.id.substring(0, 16)}...</td>
                    <td>{session.walletAddress.substring(0, 16)}...</td>
                    <td>
                      <span className={`status status-${session.status}`}>{session.status}</span>
                    </td>
                    <td>
                      {new Date(session.expiresAt - Date.now()).toLocaleTimeString()}
                    </td>
                    <td>{(BigInt(session.spendingLimit.amount) / BigInt(1000000)).toString()} STX</td>
                    <td>
                      <button
                        className="btn-small"
                        onClick={(e) => {
                          e.stopPropagation();
                          smartSessionService.revokeSession(session.id);
                          setAllSessions((prev) => prev.filter((s) => s.id !== session.id));
                        }}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedSession && (
          <div className="details-section">
            <h3>Session Details</h3>
            <div className="session-details">
              <p>
                <strong>ID:</strong> {selectedSession.id}
              </p>
              <p>
                <strong>Wallet:</strong> {selectedSession.walletAddress}
              </p>
              <p>
                <strong>Status:</strong> {selectedSession.status}
              </p>
              <p>
                <strong>Created:</strong> {new Date(selectedSession.createdAt).toLocaleString()}
              </p>
              <p>
                <strong>Expires:</strong> {new Date(selectedSession.expiresAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div className="anomalies-section">
          <h3>Detected Anomalies</h3>
          {anomalies.length === 0 ? (
            <div className="no-anomalies">No anomalies detected</div>
          ) : (
            <div className="anomalies-list">
              {anomalies.map((anomaly, idx) => (
                <div key={idx} className={`anomaly-card severity-${anomaly.severity}`}>
                  <div className="anomaly-header">
                    <strong>{anomaly.type}</strong>
                    <span className={`severity severity-${anomaly.severity}`}>{anomaly.severity}</span>
                  </div>
                  <p>{anomaly.description}</p>
                  <p className="timestamp">{new Date(anomaly.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSessionDashboard;
