// services/session/SessionBackup.ts
import { SessionMonitor, SessionEvent } from './SessionMonitor';
import { exportSessionData, ExportOptions } from '../../utils/sessionExport';
import { generateSecureBackupId } from '../../utils/crypto';
import { encryptForStorage, decryptFromStorage, hashData } from '../../utils/encryption';
import { logger } from '../../utils/logger';

export interface BackupOptions {
  includeEvents: boolean;
  includeMetrics: boolean;
  includeHealthReport: boolean;
  compress: boolean;
  encrypt: boolean;
  encryptionPassword?: string;
  retentionDays: number;
}

export interface BackupMetadata {
  id: string;
  timestamp: number;
  size: number;
  options: BackupOptions;
  checksum: string;
  version: string;
}

export interface BackupResult {
  success: boolean;
  id: string;
  size: number;
  path?: string;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  eventsRestored: number;
  backupId: string;
  restoredAt: number;
  error?: string;
}

export class SessionBackup {
  private static instance: SessionBackup;
  private readonly BACKUP_KEY = 'renvault_session_backups';
  private readonly RESTORE_HISTORY_KEY = 'renvault_restore_history';
  private readonly MAX_BACKUPS = 10;
  private readonly MAX_RESTORE_EVENTS = 1000;
  private readonly VERSION = '1.0.0';

  private constructor() {}

  static getInstance(): SessionBackup {
    if (!SessionBackup.instance) {
      SessionBackup.instance = new SessionBackup();
    }
    return SessionBackup.instance;
  }

  /**
   * Create a backup of current session data
   */
  async createBackup(options: BackupOptions = {
    includeEvents: true,
    includeMetrics: true,
    includeHealthReport: true,
    compress: true,
    encrypt: false,
    retentionDays: 30
  }): Promise<BackupResult> {
    try {
      logger.info('Creating session data backup...');

      // Export data
      const exportOptions: ExportOptions = {
        format: 'json',
        includeEvents: options.includeEvents,
        includeMetrics: options.includeMetrics,
        includeHealthReport: options.includeHealthReport,
        anonymize: false
      };

      const exportResult = exportSessionData(exportOptions);
      let data = exportResult.data;

      // Compress if requested
      if (options.compress) {
        data = await this.compressData(data);
      }

      // Encrypt if requested (requires password)
      if (options.encrypt) {
        if (!options.encryptionPassword) {
          throw new Error('Encryption password is required when encrypt option is enabled');
        }
        data = await this.encryptData(data, options.encryptionPassword);
      }

      // Generate backup metadata
      const backupId = this.generateBackupId();
      const checksum = await this.generateChecksum(data);

      const metadata: BackupMetadata = {
        id: backupId,
        timestamp: Date.now(),
        size: data.length,
        options,
        checksum,
        version: this.VERSION
      };

      // Store backup
      const backup = {
        metadata,
        data
      };

      await this.storeBackup(backup);

      // Cleanup old backups
      await this.cleanupOldBackups();

      logger.info(`Backup created successfully: ${backupId}`);

      return {
        success: true,
        id: backupId,
        size: data.length
      };
    } catch (error) {
      logger.error('Failed to create backup:', error instanceof Error ? error : new Error(String(error)));
      return {
        success: false,
        id: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Restore session data from backup.
   * @param backupId The backup ID to restore
   * @param password Optional password for encrypted backups
   */
  async restoreBackup(backupId: string, password?: string): Promise<RestoreResult> {
    const failResult = (error: string): RestoreResult => ({
      success: false,
      eventsRestored: 0,
      backupId,
      restoredAt: Date.now(),
      error,
    });

    try {
      if (!backupId || typeof backupId !== 'string' || backupId.trim().length === 0) {
        return failResult('backupId must be a non-empty string');
      }

      const backup = await this.getBackup(backupId);
      if (!backup) return failResult('Backup not found');

      // Version compatibility check
      this.assertVersionCompatible(backup.metadata.version);

      let data = backup.data;

      // Verify checksum
      const checksum = await this.generateChecksum(data);
      if (checksum !== backup.metadata.checksum) {
        return failResult('Backup data integrity check failed — checksum mismatch');
      }

      // Decrypt if needed
      if (backup.metadata.options.encrypt) {
        if (!password) return failResult('Password is required to restore encrypted backup');
        data = await this.decryptData(data, password);
      }

      // Decompress if needed
      if (backup.metadata.options.compress) {
        data = await this.decompressData(data);
      }

      // Parse and validate structure
      const sessionData: unknown = JSON.parse(data);
      this.validateRestoredStructure(sessionData);

      // Restore events into SessionMonitor
      const monitor = SessionMonitor.getInstance();
      const rawEvents: unknown[] = Array.isArray(sessionData.events) ? sessionData.events : [];
      const validEvents = this.filterValidEvents(rawEvents);
      const capped = validEvents.slice(-this.MAX_RESTORE_EVENTS);

      monitor.clearAllEvents();
      monitor.importEvents(capped);

      // Record the restoration as a new session event
      monitor.recordEvent({
        type: 'restored',
        metadata: {
          backupId,
          eventsRestored: capped.length,
          backupTimestamp: backup.metadata.timestamp,
        },
      });

      const result: RestoreResult = {
        success: true,
        eventsRestored: capped.length,
        backupId,
        restoredAt: Date.now(),
      };

      logger.info(`Restore complete: ${capped.length} events restored from backup ${backupId}`);
      this.storeRestoreRecord(result);
      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error during restoration';
      logger.error(`Restore failed for backup ${backupId}: ${msg}`);
      const result = failResult(msg);
      this.storeRestoreRecord(result);
      return result;
    }
  }

  /**
   * List all available backups
   */
  async listBackups(): Promise<BackupMetadata[]> {
    try {
      const backups = await this.getAllBackups();
      return backups.map(backup => backup.metadata).sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      logger.error('Failed to list backups:', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  /**
   * Delete a specific backup
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backups = await this.getAllBackups();
      const filteredBackups = backups.filter(backup => backup.metadata.id !== backupId);

      if (filteredBackups.length === backups.length) {
        return false; // Backup not found
      }

      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(filteredBackups));
      logger.info(`Backup deleted: ${backupId}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete backup:', error instanceof Error ? error : new Error(String(error)));
      return false;
    }
  }

  /**
   * Verify the integrity of a stored backup without restoring it.
   * Returns true when the checksum matches, false otherwise.
   */
  async verifyBackupIntegrity(backupId: string): Promise<boolean> {
    try {
      const backup = await this.getBackup(backupId);
      if (!backup) return false;
      const checksum = await this.generateChecksum(backup.data);
      return checksum === backup.metadata.checksum;
    } catch {
      return false;
    }
  }

  /**
   * Return the history of all restore operations (most recent first)
   */
  getRestorationHistory(): RestoreResult[] {
    try {
      const raw = localStorage.getItem(this.RESTORE_HISTORY_KEY);
      const history: RestoreResult[] = raw ? JSON.parse(raw) : [];
      return history.slice().reverse();
    } catch {
      return [];
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    totalBackups: number;
    totalSize: number;
    oldestBackup: number | null;
    newestBackup: number | null;
  }> {
    try {
      const backups = await this.getAllBackups();

      if (backups.length === 0) {
        return {
          totalBackups: 0,
          totalSize: 0,
          oldestBackup: null,
          newestBackup: null
        };
      }

      const timestamps = backups.map(b => b.metadata.timestamp);
      const sizes = backups.map(b => b.metadata.size);

      return {
        totalBackups: backups.length,
        totalSize: sizes.reduce((a, b) => a + b, 0),
        oldestBackup: Math.min(...timestamps),
        newestBackup: Math.max(...timestamps)
      };
    } catch (error) {
      logger.error('Failed to get backup stats:', error instanceof Error ? error : new Error(String(error)));
      return {
        totalBackups: 0,
        totalSize: 0,
        oldestBackup: null,
        newestBackup: null
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Type guards and validators
  // ---------------------------------------------------------------------------

  private validateRestoredStructure(data: unknown): asserts data is {
    events?: unknown[];
    metrics?: unknown;
    healthReport?: unknown;
  } {
    if (!data || typeof data !== 'object') {
      throw new Error('Backup data is not a valid object');
    }
    const d = data as Record<string, unknown>;
    if (d.events !== undefined && !Array.isArray(d.events)) {
      throw new Error('Backup "events" field must be an array');
    }
  }

  private isValidSessionEvent(e: unknown): e is SessionEvent {
    if (!e || typeof e !== 'object') return false;
    const ev = e as Record<string, unknown>;
    const validTypes = ['created', 'restored', 'expired', 'extended', 'cleared', 'reconnected', 'failed'];
    return typeof ev.type === 'string'
      && validTypes.includes(ev.type)
      && typeof ev.timestamp === 'number'
      && Number.isFinite(ev.timestamp)
      && ev.timestamp > 0;
  }

  private assertVersionCompatible(backupVersion: string): void {
    const [bMajor] = backupVersion.split('.').map(Number);
    const [cMajor] = this.VERSION.split('.').map(Number);
    if (bMajor !== cMajor) {
      throw new Error(
        `Backup version ${backupVersion} is incompatible with current version ${this.VERSION}`
      );
    }
  }

  private filterValidEvents(raw: unknown[]): SessionEvent[] {
    return raw.filter((e): e is SessionEvent => this.isValidSessionEvent(e));
  }

  // Private helper methods

  private storeRestoreRecord(result: RestoreResult): void {
    try {
      const raw = localStorage.getItem(this.RESTORE_HISTORY_KEY);
      const history: RestoreResult[] = raw ? JSON.parse(raw) : [];
      history.push(result);
      // Keep the last 50 restore records
      if (history.length > 50) history.splice(0, history.length - 50);
      localStorage.setItem(this.RESTORE_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Non-fatal — best-effort record keeping
    }
  }

  private async storeBackup(backup: { metadata: BackupMetadata; data: string }): Promise<void> {
    const backups = await this.getAllBackups();
    backups.push(backup);

    // Keep only the most recent backups
    if (backups.length > this.MAX_BACKUPS) {
      backups.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);
      backups.splice(this.MAX_BACKUPS);
    }

    localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backups));
  }

  private async getBackup(backupId: string): Promise<{ metadata: BackupMetadata; data: string } | null> {
    const backups = await this.getAllBackups();
    return backups.find(backup => backup.metadata.id === backupId) || null;
  }

  private async getAllBackups(): Promise<{ metadata: BackupMetadata; data: string }[]> {
    try {
      const stored = localStorage.getItem(this.BACKUP_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      logger.error('Failed to load backups:', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const backups = await this.getAllBackups();
      const now = Date.now();

      const validBackups = backups.filter(backup => {
        const age = now - backup.metadata.timestamp;
        const maxAge = backup.metadata.options.retentionDays * 24 * 60 * 60 * 1000;
        return age <= maxAge;
      });

      if (validBackups.length !== backups.length) {
        localStorage.setItem(this.BACKUP_KEY, JSON.stringify(validBackups));
        logger.info(`Cleaned up ${backups.length - validBackups.length} old backups`);
      }
    } catch (error) {
      logger.error('Failed to cleanup old backups:', error instanceof Error ? error : new Error(String(error)));
    }
  }

  private generateBackupId(): string {
    return generateSecureBackupId();
  }

  private async generateChecksum(data: string): Promise<string> {
    return hashData(data);
  }

  private async compressData(data: string): Promise<string> {
    // Simple compression using basic encoding
    // In a real implementation, you would use a proper compression library
    return btoa(data);
  }

  private async decompressData(data: string): Promise<string> {
    // Simple decompression
    return atob(data);
  }

  private async encryptData(data: string, password: string): Promise<string> {
    // Use AES-GCM encryption with PBKDF2 key derivation
    return encryptForStorage(data, password);
  }

  private async decryptData(data: string, password: string): Promise<string> {
    // Use AES-GCM decryption with PBKDF2 key derivation
    return decryptFromStorage(data, password);
  }
}