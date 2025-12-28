/**
 * Session Migration Utilities
 * Handles migration from old custom session storage to WalletKit session format
 */

import { SessionStorageService, WalletSession } from './SessionStorageService';
import { WalletKitSessionIntegration, WalletKitSession } from './walletkit-session-integration';
import { encryptedSessionStorage } from './encrypted-session-storage';
import { logger } from '../../utils/logger';

export interface MigrationReport {
  success: boolean;
  migratedCount: number;
  failedCount: number;
  timestamp: number;
  details: {
    oldSessionId?: string;
    newTopic?: string;
    error?: string;
  }[];
}

export class SessionMigrationService {
  private static instance: SessionMigrationService;

  private constructor() {}

  static getInstance(): SessionMigrationService {
    if (!SessionMigrationService.instance) {
      SessionMigrationService.instance = new SessionMigrationService();
    }
    return SessionMigrationService.instance;
  }

  /**
   * Check if old sessions exist that need migration
   */
  hasOldSessions(): boolean {
    try {
      const oldStorage = SessionStorageService.getInstance();
      return oldStorage.hasValidSession();
    } catch (error) {
      logger.warn('Error checking for old sessions', error);
      return false;
    }
  }

  /**
   * Migrate old custom sessions to WalletKit format
   */
  async migrateFromOldStorage(): Promise<MigrationReport> {
    const report: MigrationReport = {
      success: false,
      migratedCount: 0,
      failedCount: 0,
      timestamp: Date.now(),
      details: [],
    };

    try {
      logger.info('Starting session migration from old storage...');

      const oldStorage = SessionStorageService.getInstance();
      const oldSession = oldStorage.getStoredSession();

      if (!oldSession) {
        logger.info('No old sessions to migrate');
        report.success = true;
        return report;
      }

      // Convert old session to WalletKit format
      const walletKitSession = this.convertToWalletKitFormat(oldSession);

      // Store in new encrypted storage
      encryptedSessionStorage.storeSession(walletKitSession.topic, walletKitSession);

      report.migratedCount = 1;
      report.details.push({
        oldSessionId: oldSession.sessionId,
        newTopic: walletKitSession.topic,
      });

      logger.info('Session migration completed', {
        migratedCount: report.migratedCount,
        failedCount: report.failedCount,
      });

      // Optionally clear old session after successful migration
      await this.clearOldSessionAfterMigration();

      report.success = true;
      return report;
    } catch (error) {
      logger.error('Session migration failed', error);
      report.success = false;
      report.details.push({
        error: error instanceof Error ? error.message : 'Unknown migration error',
      });
      return report;
    }
  }

  /**
   * Convert old session format to WalletKit format
   */
  private convertToWalletKitFormat(oldSession: WalletSession): WalletKitSession {
    return {
      topic: `converted_${oldSession.sessionId}`,
      pairingTopic: oldSession.sessionId,
      peer: {
        publicKey: oldSession.publicKey,
        metadata: {
          name: 'Converted Session',
          description: 'Session migrated from old storage',
          url: typeof window !== 'undefined' ? window.location.origin : '',
          icons: [],
        },
      },
      expiry: oldSession.expiresAt,
      accounts: [oldSession.address],
      chainId: oldSession.metadata?.chainId || 'stacks:1',
      permissions: oldSession.metadata?.permissions
        ? {
            jsonrpc: {
              methods: oldSession.metadata.permissions,
            },
          }
        : undefined,
      metadata: {
        migratedFrom: 'custom_storage',
        migratedAt: Date.now(),
        originalSessionId: oldSession.sessionId,
        ...oldSession.metadata,
      },
    };
  }

  /**
   * Clear old session storage after successful migration
   */
  private async clearOldSessionAfterMigration(): Promise<void> {
    try {
      logger.info('Clearing old session storage...');
      const oldStorage = SessionStorageService.getInstance();
      oldStorage.clearSession();
      logger.info('Old session storage cleared');
    } catch (error) {
      logger.warn('Error clearing old session storage', error);
      // Don't throw, as old storage is already migrated
    }
  }

  /**
   * Run migration on app startup
   */
  async runStartupMigration(): Promise<void> {
    try {
      if (this.hasOldSessions()) {
        logger.info('Old sessions detected, starting migration...');
        const report = await this.migrateFromOldStorage();

        if (!report.success) {
          logger.warn('Migration completed with errors', report);
        }
      }
    } catch (error) {
      logger.error('Startup migration failed', error);
    }
  }

  /**
   * Validate migration compatibility
   */
  validateMigrationCompatibility(): {
    compatible: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    try {
      // Check if old storage is accessible
      const oldStorage = SessionStorageService.getInstance();
      if (!oldStorage) {
        issues.push('Old SessionStorageService not accessible');
      }

      // Check if new storage is accessible
      const newStorage = encryptedSessionStorage;
      if (!newStorage) {
        issues.push('Encrypted session storage not accessible');
      }

      // Check if WalletKit integration is available
      const walletKitSession = WalletKitSessionIntegration.getInstance();
      if (!walletKitSession) {
        issues.push('WalletKit session integration not accessible');
      }

      return {
        compatible: issues.length === 0,
        issues,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown validation error';
      return {
        compatible: false,
        issues: [errorMsg],
      };
    }
  }

  /**
   * Create backup of old session before migration
   */
  backupOldSession(): string | null {
    try {
      const oldStorage = SessionStorageService.getInstance();
      const oldSession = oldStorage.getStoredSession();

      if (!oldSession) {
        return null;
      }

      const backup = {
        timestamp: Date.now(),
        session: oldSession,
      };

      const backupString = JSON.stringify(backup);
      const storageKey = 'renvault_session_backup_' + Date.now();
      localStorage.setItem(storageKey, backupString);

      logger.info('Old session backed up', { backupKey: storageKey });
      return storageKey;
    } catch (error) {
      logger.warn('Failed to backup old session', error);
      return null;
    }
  }

  /**
   * Restore session from backup
   */
  restoreFromBackup(backupKey: string): WalletSession | null {
    try {
      const backupString = localStorage.getItem(backupKey);
      if (!backupString) {
        logger.warn('Backup not found', { backupKey });
        return null;
      }

      const backup = JSON.parse(backupString);
      return backup.session;
    } catch (error) {
      logger.error('Failed to restore from backup', { backupKey, error });
      return null;
    }
  }

  /**
   * Get list of available backups
   */
  listBackups(): Array<{ key: string; timestamp: number }> {
    const backups: Array<{ key: string; timestamp: number }> = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('renvault_session_backup_')) {
        const backupString = localStorage.getItem(key);
        if (backupString) {
          try {
            const backup = JSON.parse(backupString);
            backups.push({
              key,
              timestamp: backup.timestamp,
            });
          } catch (error) {
            logger.warn('Invalid backup format', { key });
          }
        }
      }
    }

    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Clear old backups (keep only last N)
   */
  cleanupOldBackups(keepCount: number = 3): number {
    const backups = this.listBackups();
    let deletedCount = 0;

    for (let i = keepCount; i < backups.length; i++) {
      localStorage.removeItem(backups[i].key);
      deletedCount++;
    }

    if (deletedCount > 0) {
      logger.info('Old backups cleaned up', { deletedCount });
    }

    return deletedCount;
  }

  /**
   * Get migration status
   */
  getMigrationStatus(): {
    hasMigrated: boolean;
    timestamp?: number;
  } {
    try {
      const migrationFlag = localStorage.getItem('renvault_migration_completed');
      if (migrationFlag) {
        const migrationData = JSON.parse(migrationFlag);
        return {
          hasMigrated: true,
          timestamp: migrationData.timestamp,
        };
      }
      return {
        hasMigrated: false,
      };
    } catch (error) {
      return {
        hasMigrated: false,
      };
    }
  }

  /**
   * Mark migration as completed
   */
  markMigrationCompleted(): void {
    try {
      const migrationData = {
        timestamp: Date.now(),
        version: '1.0.0',
      };
      localStorage.setItem('renvault_migration_completed', JSON.stringify(migrationData));
      logger.info('Migration marked as completed');
    } catch (error) {
      logger.warn('Failed to mark migration as completed', error);
    }
  }

  /**
   * Reset migration status (for testing)
   */
  resetMigrationStatus(): void {
    try {
      localStorage.removeItem('renvault_migration_completed');
      logger.info('Migration status reset');
    } catch (error) {
      logger.warn('Failed to reset migration status', error);
    }
  }

  /**
   * Generate migration summary report
   */
  generateMigrationSummary(): {
    oldSessionsFound: boolean;
    newSessionsCount: number;
    migrationStatus: string;
    recommendations: string[];
  } {
    const recommendations: string[] = [];

    const hasOldSessions = this.hasOldSessions();
    const newSessions = encryptedSessionStorage.retrieveAllSessions();
    const migrationStatus = this.getMigrationStatus();

    if (hasOldSessions && !migrationStatus.hasMigrated) {
      recommendations.push('Run migration from old session storage');
    }

    if (newSessions.some(s => s.metadata?.migratedFrom === 'custom_storage')) {
      recommendations.push('Verify migrated sessions are working correctly');
    }

    const compatibility = this.validateMigrationCompatibility();
    if (!compatibility.compatible) {
      recommendations.push(...compatibility.issues);
    }

    return {
      oldSessionsFound: hasOldSessions,
      newSessionsCount: newSessions.length,
      migrationStatus: migrationStatus.hasMigrated ? 'completed' : 'pending',
      recommendations,
    };
  }
}

export const sessionMigrationService = SessionMigrationService.getInstance();
