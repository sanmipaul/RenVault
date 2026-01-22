// components/session/SessionMaintenance.tsx
import React, { useState, useEffect } from 'react';
import { SessionCleanup, CleanupResult } from '../../utils/sessionCleanup';
import './SessionMaintenance.css';

interface SessionMaintenanceProps {
  onMaintenanceComplete?: (result: CleanupResult) => void;
  onMaintenanceError?: (error: string) => void;
}

export const SessionMaintenance: React.FC<SessionMaintenanceProps> = ({
  onMaintenanceComplete,
  onMaintenanceError
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<CleanupResult | null>(null);
  const [stats, setStats] = useState<{
    totalSessions: number;
    expiredSessions: number;
    corruptedSessions: number;
    inactiveSessions: number;
    monitoringRecords: number;
    backupSize: number;
  } | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const sessionCleanup = SessionCleanup.getInstance();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoadingStats(true);
    try {
      const cleanupStats = await sessionCleanup.getCleanupStats();
      setStats(cleanupStats);
    } catch (error) {
      console.error('Failed to load cleanup stats:', error);
      onMaintenanceError?.('Failed to load maintenance statistics');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleCleanup = async () => {
    setIsRunning(true);
    try {
      const result = await sessionCleanup.cleanupSessions({
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        removeExpired: true,
        removeCorrupted: true,
        removeInactive: true,
        inactiveThreshold: 7 * 24 * 60 * 60 * 1000, // 7 days
        dryRun: false
      });

      setLastResult(result);
      await loadStats();
      onMaintenanceComplete?.(result);

      if (result.errors.length > 0) {
        console.warn('Cleanup completed with errors:', result.errors);
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
      onMaintenanceError?.('Session cleanup failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleComprehensiveCleanup = async () => {
    setIsRunning(true);
    try {
      const result = await sessionCleanup.comprehensiveCleanup();
      setLastResult(result.sessions); // Use sessions result for display
      await loadStats();
      onMaintenanceComplete?.(result.sessions);

      console.log('Comprehensive cleanup completed:', result);
    } catch (error) {
      console.error('Comprehensive cleanup failed:', error);
      onMaintenanceError?.('Comprehensive cleanup failed');
    } finally {
      setIsRunning(false);
    }
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="session-maintenance">
      <div className="maintenance-header">
        <h3>Session Maintenance</h3>
        <p>Clean up expired, corrupted, and inactive sessions to optimize storage and performance</p>
      </div>

      <div className="maintenance-stats">
        <h4>Current Statistics</h4>
        {isLoadingStats ? (
          <div className="loading-stats">Loading statistics...</div>
        ) : stats ? (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{formatNumber(stats.totalSessions)}</div>
              <div className="stat-label">Total Sessions</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-number">{formatNumber(stats.expiredSessions)}</div>
              <div className="stat-label">Expired Sessions</div>
            </div>
            <div className="stat-card error">
              <div className="stat-number">{formatNumber(stats.corruptedSessions)}</div>
              <div className="stat-label">Corrupted Sessions</div>
            </div>
            <div className="stat-card info">
              <div className="stat-number">{formatNumber(stats.inactiveSessions)}</div>
              <div className="stat-label">Inactive Sessions</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{formatNumber(stats.monitoringRecords)}</div>
              <div className="stat-label">Monitoring Records</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{formatSize(stats.backupSize)}</div>
              <div className="stat-label">Backup Size</div>
            </div>
          </div>
        ) : (
          <div className="no-stats">Unable to load statistics</div>
        )}
      </div>

      <div className="maintenance-actions">
        <button
          className="btn-primary"
          onClick={handleCleanup}
          disabled={isRunning}
        >
          {isRunning ? 'Running Cleanup...' : 'Clean Up Sessions'}
        </button>
        <button
          className="btn-secondary"
          onClick={handleComprehensiveCleanup}
          disabled={isRunning}
        >
          {isRunning ? 'Running Cleanup...' : 'Comprehensive Cleanup'}
        </button>
      </div>

      {lastResult && (
        <div className="maintenance-results">
          <h4>Last Cleanup Results</h4>
          <div className="results-grid">
            <div className="result-item">
              <span className="result-label">Total Processed</span>
              <span className="result-value">{formatNumber(lastResult.totalProcessed)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Sessions Removed</span>
              <span className="result-value">{formatNumber(lastResult.sessionsRemoved)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Expired Removed</span>
              <span className="result-value">{formatNumber(lastResult.expiredRemoved)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Corrupted Removed</span>
              <span className="result-value">{formatNumber(lastResult.corruptedRemoved)}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Inactive Removed</span>
              <span className="result-value">{formatNumber(lastResult.inactiveRemoved)}</span>
            </div>
          </div>

          {lastResult.errors.length > 0 && (
            <div className="cleanup-errors">
              <h5>Errors Encountered:</h5>
              <ul>
                {lastResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="maintenance-info">
        <div className="info-section">
          <h5>Cleanup Policies</h5>
          <ul>
            <li><strong>Expired Sessions:</strong> Sessions older than 30 days</li>
            <li><strong>Corrupted Sessions:</strong> Sessions with invalid data</li>
            <li><strong>Inactive Sessions:</strong> Sessions with no activity for 7 days</li>
            <li><strong>Monitoring Data:</strong> Records older than 90 days</li>
            <li><strong>Backup Data:</strong> Backups older than 60 days</li>
          </ul>
        </div>

        <div className="info-section">
          <h5>Recommendations</h5>
          <ul>
            <li>Run cleanup regularly to maintain optimal performance</li>
            <li>Create backups before running comprehensive cleanup</li>
            <li>Monitor cleanup results for any persistent issues</li>
            <li>Consider adjusting retention policies based on usage patterns</li>
          </ul>
        </div>
      </div>
    </div>
  );
};