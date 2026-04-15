// @ts-nocheck
// utils/sessionCleanup.ts
import { SessionStorageService } from '../services/session/SessionStorageService';
import { SessionMonitor } from '../services/session/SessionMonitor';

export interface CleanupOptions {
  maxAge: number; // in milliseconds
  removeExpired: boolean;
  removeCorrupted: boolean;
  removeInactive: boolean;
  inactiveThreshold: number; // in milliseconds
  dryRun: boolean;
}

export interface CleanupResult {
  sessionsRemoved: number;
  corruptedRemoved: number;
  expiredRemoved: number;
  inactiveRemoved: number;
  totalProcessed: number;
  errors: string[];
}

export class SessionCleanup {
  private static instance: SessionCleanup;
  private sessionStorage = SessionStorageService.getInstance();
  private sessionMonitor = SessionMonitor.getInstance();

  private constructor() {}

  static getInstance(): SessionCleanup {
    if (!SessionCleanup.instance) {
      SessionCleanup.instance = new SessionCleanup();
    }
    return SessionCleanup.instance;
  }

  /**
   * Clean up expired and corrupted sessions
   */
  async cleanupSessions(options: CleanupOptions = {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    removeExpired: true,
    removeCorrupted: true,
    removeInactive: true,
    inactiveThreshold: 7 * 24 * 60 * 60 * 1000, // 7 days
    dryRun: false
  }): Promise<CleanupResult> {
    const result: CleanupResult = {
      sessionsRemoved: 0,
      corruptedRemoved: 0,
      expiredRemoved: 0,
      inactiveRemoved: 0,
      totalProcessed: 0,
      errors: []
    };

    try {
      logger.info('Starting session cleanup...');

      // Get all stored sessions
      const allSessions = this.getAllStoredSessions();
      result.totalProcessed = allSessions.length;

      for (const sessionKey of allSessions) {
        try {
          const sessionData = this.sessionStorage.getSessionData(sessionKey);
          if (!sessionData) {
            // Session doesn't exist or is corrupted
            if (options.removeCorrupted && !options.dryRun) {
              this.removeSession(sessionKey);
            }
            result.corruptedRemoved++;
            continue;
          }

          const now = Date.now();
          const sessionAge = now - sessionData.createdAt;
          const lastActivity = sessionData.lastActivity || sessionData.createdAt;
          const inactiveTime = now - lastActivity;

          // Check for expired sessions
          if (options.removeExpired && sessionAge > options.maxAge) {
            if (!options.dryRun) {
              this.removeSession(sessionKey);
            }
            result.expiredRemoved++;
            continue;
          }

          // Check for inactive sessions
          if (options.removeInactive && inactiveTime > options.inactiveThreshold) {
            if (!options.dryRun) {
              this.removeSession(sessionKey);
            }
            result.inactiveRemoved++;
            continue;
          }

        } catch (error) {
          logger.warn(`Error processing session ${sessionKey}:`, error);
          result.errors.push(`Session ${sessionKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);

          // Remove corrupted sessions
          if (options.removeCorrupted && !options.dryRun) {
            this.removeSession(sessionKey);
            result.corruptedRemoved++;
          }
        }
      }

      result.sessionsRemoved = result.corruptedRemoved + result.expiredRemoved + result.inactiveRemoved;

      logger.info('Session cleanup completed:', result);

      // Log cleanup event
      await this.sessionMonitor.recordEvent('session_cleanup', {
        result,
        options
      });

    } catch (error) {
      logger.error('Session cleanup failed:', error);
      result.errors.push(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Clean up session monitoring data
   */
  async cleanupMonitoringData(maxAge: number = 90 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
      logger.info('Cleaning up old monitoring data...');

      const removed = await this.sessionMonitor.cleanupOldData(maxAge);
      logger.info(`Removed ${removed} old monitoring records`);

      return removed;
    } catch (error) {
      logger.error('Failed to cleanup monitoring data:', error);
      return 0;
    }
  }

  /**
   * Clean up session backups
   */
  async cleanupBackups(maxAge: number = 60 * 24 * 60 * 60 * 1000): Promise<number> {
    try {
      logger.info('Cleaning up old session backups...');

      // This would integrate with SessionBackup service
      // For now, return 0 as placeholder
      logger.info('Backup cleanup not yet implemented');
      return 0;
    } catch (error) {
      logger.error('Failed to cleanup backups:', error);
      return 0;
    }
  }

  /**
   * Perform comprehensive cleanup
   */
  async comprehensiveCleanup(): Promise<{
    sessions: CleanupResult;
    monitoring: number;
    backups: number;
  }> {
    logger.info('Performing comprehensive session cleanup...');

    const sessions = await this.cleanupSessions();
    const monitoring = await this.cleanupMonitoringData();
    const backups = await this.cleanupBackups();

    return {
      sessions,
      monitoring,
      backups
    };
  }

  /**
   * Get cleanup statistics
   */
  async getCleanupStats(): Promise<{
    totalSessions: number;
    expiredSessions: number;
    corruptedSessions: number;
    inactiveSessions: number;
    monitoringRecords: number;
    backupSize: number;
  }> {
    try {
      const allSessions = this.getAllStoredSessions();
      let expiredSessions = 0;
      let corruptedSessions = 0;
      let inactiveSessions = 0;

      const now = Date.now();
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      const inactiveThreshold = 7 * 24 * 60 * 60 * 1000; // 7 days

      for (const sessionKey of allSessions) {
        try {
          const sessionData = this.sessionStorage.getSessionData(sessionKey);
          if (!sessionData) {
            corruptedSessions++;
            continue;
          }

          const sessionAge = now - sessionData.createdAt;
          const lastActivity = sessionData.lastActivity || sessionData.createdAt;
          const inactiveTime = now - lastActivity;

          if (sessionAge > maxAge) {
            expiredSessions++;
          }

          if (inactiveTime > inactiveThreshold) {
            inactiveSessions++;
          }
        } catch (error) {
          corruptedSessions++;
        }
      }

      const monitoringRecords = await this.sessionMonitor.getRecordCount();
      const backupSize = 0; // Placeholder

      return {
        totalSessions: allSessions.length,
        expiredSessions,
        corruptedSessions,
        inactiveSessions,
        monitoringRecords,
        backupSize
      };
    } catch (error) {
      logger.error('Failed to get cleanup stats:', error);
      return {
        totalSessions: 0,
        expiredSessions: 0,
        corruptedSessions: 0,
        inactiveSessions: 0,
        monitoringRecords: 0,
        backupSize: 0
      };
    }
  }

  // Private helper methods

  private getAllStoredSessions(): string[] {
    const sessions: string[] = [];
    const sessionPrefix = 'renvault_session_';

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(sessionPrefix)) {
        sessions.push(key);
      }
    }

    return sessions;
  }

  private removeSession(sessionKey: string): void {
    try {
      localStorage.removeItem(sessionKey);
      logger.info(`Removed session: ${sessionKey}`);
    } catch (error) {
      logger.error(`Failed to remove session ${sessionKey}:`, error);
    }
  }
}