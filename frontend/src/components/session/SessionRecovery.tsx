// components/session/SessionRecovery.tsx
import React, { useState, useEffect } from 'react';
import { SessionBackup, BackupMetadata, BackupResult } from '../../services/session/SessionBackup';
import './SessionRecovery.css';

interface SessionRecoveryProps {
  onRecoveryComplete?: () => void;
  onRecoveryError?: (error: string) => void;
}

export const SessionRecovery: React.FC<SessionRecoveryProps> = ({
  onRecoveryComplete,
  onRecoveryError
}) => {
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [backupStats, setBackupStats] = useState<{
    totalBackups: number;
    totalSize: number;
    oldestBackup: number | null;
    newestBackup: number | null;
  } | null>(null);

  const sessionBackup = SessionBackup.getInstance();

  useEffect(() => {
    loadBackups();
    loadBackupStats();
  }, []);

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const backupList = await sessionBackup.listBackups();
      setBackups(backupList);
    } catch (error) {
      console.error('Failed to load backups:', error);
      onRecoveryError?.('Failed to load backup list');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBackupStats = async () => {
    try {
      const stats = await sessionBackup.getBackupStats();
      setBackupStats(stats);
    } catch (error) {
      console.error('Failed to load backup stats:', error);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    try {
      const result: BackupResult = await sessionBackup.createBackup({
        includeEvents: true,
        includeMetrics: true,
        includeHealthReport: true,
        compress: true,
        encrypt: false,
        retentionDays: 30
      });

      if (result.success) {
        await loadBackups();
        await loadBackupStats();
        console.log('Backup created successfully');
      } else {
        onRecoveryError?.(result.error || 'Failed to create backup');
      }
    } catch (error) {
      console.error('Backup creation failed:', error);
      onRecoveryError?.('Backup creation failed');
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!backupId) return;

    setIsRestoring(true);
    try {
      const success = await sessionBackup.restoreBackup(backupId);
      if (success) {
        onRecoveryComplete?.();
        console.log('Backup restored successfully');
      } else {
        onRecoveryError?.('Failed to restore backup');
      }
    } catch (error) {
      console.error('Backup restoration failed:', error);
      onRecoveryError?.('Backup restoration failed');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!backupId) return;

    try {
      const success = await sessionBackup.deleteBackup(backupId);
      if (success) {
        await loadBackups();
        await loadBackupStats();
        console.log('Backup deleted successfully');
      } else {
        onRecoveryError?.('Failed to delete backup');
      }
    } catch (error) {
      console.error('Backup deletion failed:', error);
      onRecoveryError?.('Backup deletion failed');
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="session-recovery">
      <div className="recovery-header">
        <h3>Session Backup & Recovery</h3>
        <p>Manage your session data backups for recovery and migration</p>
      </div>

      <div className="recovery-stats">
        {backupStats && (
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Backups</span>
              <span className="stat-value">{backupStats.totalBackups}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Size</span>
              <span className="stat-value">{formatSize(backupStats.totalSize)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Oldest Backup</span>
              <span className="stat-value">
                {backupStats.oldestBackup ? formatDate(backupStats.oldestBackup) : 'None'}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Newest Backup</span>
              <span className="stat-value">
                {backupStats.newestBackup ? formatDate(backupStats.newestBackup) : 'None'}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="recovery-actions">
        <button
          className="btn-primary"
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
        >
          {isCreatingBackup ? 'Creating Backup...' : 'Create New Backup'}
        </button>
      </div>

      <div className="backup-list">
        <h4>Available Backups</h4>
        {isLoading ? (
          <div className="loading">Loading backups...</div>
        ) : backups.length === 0 ? (
          <div className="no-backups">No backups available</div>
        ) : (
          <div className="backup-items">
            {backups.map((backup) => (
              <div key={backup.id} className="backup-item">
                <div className="backup-info">
                  <div className="backup-id">{backup.id}</div>
                  <div className="backup-details">
                    <span>Created: {formatDate(backup.timestamp)}</span>
                    <span>Size: {formatSize(backup.size)}</span>
                    <span>Version: {backup.version}</span>
                  </div>
                  <div className="backup-options">
                    {backup.options.compress && <span className="option-tag">Compressed</span>}
                    {backup.options.encrypt && <span className="option-tag">Encrypted</span>}
                    <span className="option-tag">Retention: {backup.options.retentionDays}d</span>
                  </div>
                </div>
                <div className="backup-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => handleRestoreBackup(backup.id)}
                    disabled={isRestoring}
                  >
                    {isRestoring && selectedBackup === backup.id ? 'Restoring...' : 'Restore'}
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => handleDeleteBackup(backup.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};