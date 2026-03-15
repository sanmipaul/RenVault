/**
 * TwoFactorMigration
 *
 * One-shot migration helper that promotes any plain-text 2FA data left in
 * localStorage from the old implementation to the new AES-GCM encrypted
 * storage.  Call this once on app startup after the wallet address is known.
 *
 * The migration is idempotent — calling it multiple times is safe because
 * TwoFactorSecureStorage.loadSecret / loadBackupCodes already perform the
 * same migration internally.  This utility provides an explicit entry point
 * so that callers can log the outcome and surface errors without duplicating
 * the migration logic.
 */

import { TwoFactorSecureStorage, STORAGE_KEYS } from './TwoFactorSecureStorage';

export interface MigrationResult {
  secretMigrated: boolean;
  backupCodesMigrated: boolean;
}

export class TwoFactorMigration {
  /**
   * Migrate plain-text 2FA data to encrypted storage for the given wallet
   * address.  Returns a summary of what was migrated.
   */
  static async migrate(walletAddress: string): Promise<MigrationResult> {
    let secretMigrated = false;
    let backupCodesMigrated = false;

    // loadSecret handles migration internally; we just check whether a
    // legacy key existed before the call.
    const hadLegacySecret = localStorage.getItem(STORAGE_KEYS.legacySecret) !== null;
    if (hadLegacySecret) {
      await TwoFactorSecureStorage.loadSecret(walletAddress);
      secretMigrated = true;
    }

    const hadLegacyCodes = localStorage.getItem(STORAGE_KEYS.legacyBackupCodes) !== null;
    if (hadLegacyCodes) {
      await TwoFactorSecureStorage.loadBackupCodes(walletAddress);
      backupCodesMigrated = true;
    }

    return { secretMigrated, backupCodesMigrated };
  }

  /**
   * Returns true when there is any plain-text 2FA data that has not yet been
   * migrated to encrypted storage.
   */
  static needsMigration(): boolean {
    return (
      localStorage.getItem(STORAGE_KEYS.legacySecret) !== null ||
      localStorage.getItem(STORAGE_KEYS.legacyBackupCodes) !== null
    );
  }
}
