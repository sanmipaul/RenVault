// components/SessionDashboard.tsx
import React, { useState, useEffect } from 'react';
import { SessionMonitor, SessionMetrics, SessionEvent } from '../services/session/SessionMonitor';
import { getSessionSecurityRecommendations } from '../utils/sessionValidation';
import './SessionDashboard.css';

interface SessionDashboardProps {
  isAdmin?: boolean;
  className?: string;
}

export const SessionDashboard: React.FC<SessionDashboardProps> = ({
  isAdmin = false,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<SessionMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<SessionEvent[]>([]);
  const [healthReport, setHealthReport] = useState<any>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<number>(7); // days

  const sessionMonitor = SessionMonitor.getInstance();

  useEffect(() => {
    const updateData = () => {
      setMetrics(sessionMonitor.getMetrics());
      setRecentEvents(sessionMonitor.getRecentEvents(20));
      setHealthReport(sessionMonitor.getHealthReport());
    };

    updateData();

    // Update every 30 seconds
    const interval = setInterval(updateData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms: number): string => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventIcon = (type: SessionEvent['type']): string => {
    switch (type) {
      case 'created': return '🆕';
      case 'restored': return '🔄';
      case 'expired': return '⏰';
      case 'extended': return '⏳';
      case 'cleared': return '🗑️';
      case 'reconnected': return '🔗';
      case 'failed': return '❌';
      default: return '📝';
    }
  };

  const getHealthStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return '#28a745';
      case 'warning': return '#ffc107';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (!isAdmin) {
    return (
      <div className={`session-dashboard access-denied ${className}`}>
        <div className="access-message">
          <span className="lock-icon">🔒</span>
          <p>Administrator access required</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className={`session-dashboard loading ${className}`}>
        <div className="loading-spinner"></div>
        <p>Loading session data...</p>
      </div>
    );
  }

  return (
    <div className={`session-dashboard ${className}`}>
      <div className="dashboard-header">
        <h2>Session Analytics Dashboard</h2>
        <div className="timeframe-selector">
          <label>Timeframe:</label>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(Number(e.target.value))}
          >
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Health Status */}
      <div className="health-status-card">
        <h3>System Health</h3>
        <div
          className="health-indicator"
          style={{ backgroundColor: getHealthStatusColor(healthReport?.status || 'unknown') }}
        >
          {healthReport?.status?.toUpperCase() || 'UNKNOWN'}
        </div>
        {healthReport?.issues?.length > 0 && (
          <div className="health-issues">
            <h4>Issues:</h4>
            <ul>
              {healthReport.issues.map((issue: string, index: number) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}
        {healthReport?.recommendations?.length > 0 && (
          <div className="health-recommendations">
            <h4>Recommendations:</h4>
            <ul>
              {healthReport.recommendations.map((rec: string, index: number) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-value">{metrics.totalSessions}</div>
          <div className="metric-label">Total Sessions</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.activeSessions}</div>
          <div className="metric-label">Active Sessions</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.expiredSessions}</div>
          <div className="metric-label">Expired Sessions</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{formatDuration(metrics.averageSessionDuration)}</div>
          <div className="metric-label">Avg Session Duration</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{metrics.successfulReconnections}</div>
          <div className="metric-label">Successful Reconnects</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">
            {metrics.reconnectionAttempts > 0
              ? `${((metrics.successfulReconnections / metrics.reconnectionAttempts) * 100).toFixed(1)}%`
              : '0%'
            }
          </div>
          <div className="metric-label">Reconnect Success Rate</div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="events-section">
        <h3>Recent Session Events</h3>
        <div className="events-list">
          {recentEvents.length === 0 ? (
            <p className="no-events">No recent events</p>
          ) : (
            recentEvents.slice().reverse().map((event, index) => (
              <div key={index} className="event-item">
                <div className="event-icon">{getEventIcon(event.type)}</div>
                <div className="event-details">
                  <div className="event-type">{event.type}</div>
                  <div className="event-meta">
                    {event.sessionId && <span>Session: {event.sessionId.slice(-8)}</span>}
                    {event.providerType && <span>Provider: {event.providerType}</span>}
                    <span>{formatTimestamp(event.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Security Recommendations */}
      <div className="security-section">
        <h3>Security Recommendations</h3>
        <div className="recommendations-list">
          {getSessionSecurityRecommendations({
            providerType: 'unknown',
            address: 'unknown',
            publicKey: 'unknown',
            connectedAt: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
            sessionId: 'sample'
          }).map((rec, index) => (
            <div key={index} className="recommendation-item">
              <span className="rec-icon">💡</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};