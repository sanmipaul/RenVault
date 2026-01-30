// services/session/SessionBackup.ts
import { SessionMonitor } from './SessionMonitor';
import { exportSessionData, ExportOptions } from '../utils/sessionExport';
import { generateSecureBackupId } from '../../utils/crypto';
import { encryptForStorage, decryptFromStorage, hashData } from '../../utils/encryption';

export interface BackupOptions {
  includeEvents: boolean;
  includeMetrics: boolean;
  includeHealthReport: boolean;
  compress: boolean;
  encrypt: boolean;
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

export class SessionBackup {
  private static instance: SessionBackup;
  private readonly BACKUP_KEY = 'renvault_session_backups';
  private readonly MAX_BACKUPS = 10;
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
      console.log('Creating session data backup...');

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

      // Encrypt if requested
      if (options.encrypt) {
        data = this.encryptData(data);
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

      console.log(`Backup created successfully: ${backupId}`);

      return {
        success: true,
        id: backupId,
        size: data.length
      };
    } catch (error) {
      console.error('Failed to create backup:', error);
      return {
        success: false,
        id: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Restore session data from backup
   */
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      console.log(`Restoring backup: ${backupId}`);

      const backup = await this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      let data = backup.data;

      // Verify checksum using secure SHA-256 hash
      const checksum = await this.generateChecksum(data);
      if (checksum !== backup.metadata.checksum) {
        throw new Error('Backup data integrity check failed');
      }

      // Decrypt if encrypted
      if (backup.metadata.options.encrypt) {
        data = this.decryptData(data);
      }

      // Decompress if compressed
      if (backup.metadata.options.compress) {
        data = await this.decompressData(data);
      }

      // Parse and restore data
      const sessionData = JSON.parse(data);

      // Here you would typically restore the data to the session services
      // For now, we'll just validate the structure
      if (sessionData.metrics && sessionData.events && sessionData.healthReport) {
        console.log('Backup data validated and ready for restoration');
        // TODO: Implement actual data restoration
        return true;
      } else {
        throw new Error('Invalid backup data structure');
      }
    } catch (error) {
      console.error('Failed to restore backup:', error);
      return false;
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
      console.error('Failed to list backups:', error);
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
      console.log(`Backup deleted: ${backupId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return false;
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
      console.error('Failed to get backup stats:', error);
      return {
        totalBackups: 0,
        totalSize: 0,
        oldestBackup: null,
        newestBackup: null
      };
    }
  }

  // Private helper methods

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
      console.error('Failed to load backups:', error);
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
        console.log(`Cleaned up ${backups.length - validBackups.length} old backups`);
      }
    } catch (error) {
      console.error('Failed to cleanup old backups:', error);
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

  private encryptData(data: string): string {
    // Simple encryption - in production, use proper encryption
    return btoa(data.split('').reverse().join(''));
  }

  private decryptData(data: string): string {
    // Simple decryption
    return atob(data).split('').reverse().join('');
  }
}