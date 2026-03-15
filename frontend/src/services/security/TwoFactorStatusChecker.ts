/**
 * TwoFactorStatusChecker
 *
 * Provides a quick, non-destructive health check for 2FA storage state.
 * Useful for debugging and onboarding flows where the UI needs to know
 * whether 2FA is fully set up (secret + backup codes) or only partially.
 */

import { TwoFactorSecureStorage, STORAGE_KEYS } from './TwoFactorSecureStorage';

export interface TwoFactorStorageStatus {
  /** True when an encrypted or legacy secret is present in localStorage. */
  hasEncryptedSecret: boolean;
  /** True when encrypted or legacy backup codes are present. */
  hasEncryptedBackupCodes: boolean;
  /** True when legacy plain-text secret is still present (pre-migration). */
  hasLegacySecret: boolean;
  /** True when legacy plain-text backup codes are still present (pre-migration). */
  hasLegacyBackupCodes: boolean;
  /** True when the plain-text enabled flag is set. */
  isMarkedEnabled: boolean;
  /** True when decryptable secret AND backup codes are present for the wallet. */
  isFullyConfigured: boolean;
}

export class TwoFactorStatusChecker {
  /**
   * Synchronous snapshot of 2FA storage state.  Does NOT attempt decryption.
   */
  static getStorageStatus(): Omit<TwoFactorStorageStatus, 'isFullyConfigured'> {
    return {
      hasEncryptedSecret: localStorage.getItem(STORAGE_KEYS.encryptedSecret) !== null,
      hasEncryptedBackupCodes: localStorage.getItem(STORAGE_KEYS.encryptedBackupCodes) !== null,
      hasLegacySecret: localStorage.getItem(STORAGE_KEYS.legacySecret) !== null,
      hasLegacyBackupCodes: localStorage.getItem(STORAGE_KEYS.legacyBackupCodes) !== null,
      isMarkedEnabled: localStorage.getItem('tfa-enabled') === 'true',
    };
  }

  /**
   * Async full check that also verifies decryption succeeds for the given
   * wallet address.  Returns the full status including isFullyConfigured.
   */
  static async getFullStatus(walletAddress: string): Promise<TwoFactorStorageStatus> {
    const sync = this.getStorageStatus();
    let isFullyConfigured = false;

    try {
      const secret = await TwoFactorSecureStorage.loadSecret(walletAddress);
      const codes = await TwoFactorSecureStorage.loadBackupCodes(walletAddress);
      isFullyConfigured = secret !== null && codes.length > 0;
    } catch {
      isFullyConfigured = false;
    }

    return { ...sync, isFullyConfigured };
  }
}
