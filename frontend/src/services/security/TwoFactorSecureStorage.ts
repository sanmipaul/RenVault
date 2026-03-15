/**
 * TwoFactorSecureStorage
 *
 * Replaces plain-text localStorage writes for 2FA secrets and backup codes
 * with AES-GCM encrypted storage. The encryption key is derived via PBKDF2
 * from three components that are never stored together:
 *   1. A constant app-level identifier (compiled into the bundle)
 *   2. The user's wallet address (known only when the wallet is connected)
 *   3. A per-device random salt (stored in localStorage, separate key)
 *
 * An attacker with only the localStorage dump cannot decrypt the ciphertext
 * without also knowing the wallet address, providing a meaningful additional
 * security layer compared to plain-text storage.
 */

import { encryptForStorage, decryptFromStorage } from '../../utils/encryption';

const DEVICE_SALT_KEY = 'renvault_2fa_device_salt';
const SECRET_STORAGE_KEY = 'renvault_2fa_secret_enc';
const BACKUP_CODES_STORAGE_KEY = 'renvault_2fa_backup_enc';

// Legacy keys written by the old plain-text implementation
const LEGACY_SECRET_KEY = 'tfa-secret';
const LEGACY_BACKUP_KEY = 'tfa-backup-codes';

/**
 * Exported storage key constants — useful for testing and diagnostics.
 * Never write sensitive data directly to these keys; always go through
 * the TwoFactorSecureStorage methods.
 */
export const STORAGE_KEYS = {
  deviceSalt: DEVICE_SALT_KEY,
  encryptedSecret: SECRET_STORAGE_KEY,
  encryptedBackupCodes: BACKUP_CODES_STORAGE_KEY,
  legacySecret: LEGACY_SECRET_KEY,
  legacyBackupCodes: LEGACY_BACKUP_KEY,
} as const;

// App-specific key material – changing this invalidates all stored secrets
const APP_KEY_MATERIAL = 'renvault-2fa-v1';

export class TwoFactorSecureStorage {
  /**
   * Return (or create) a random per-device salt stored in localStorage.
   * The salt itself is not secret, but it ensures ciphertexts are unique
   * across devices and prevents cross-device replay.
   */
  private static getOrCreateDeviceSalt(): string {
    let salt = localStorage.getItem(DEVICE_SALT_KEY);
    if (!salt) {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      salt = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      localStorage.setItem(DEVICE_SALT_KEY, salt);
    }
    return salt;
  }

  /**
   * Derive the PBKDF2 password string from the wallet address and device salt.
   * This is NOT the encryption key itself – it is the password that PBKDF2
   * will stretch into the AES-GCM key inside encryptForStorage.
   */
  private static derivePassword(walletAddress: string): string {
    const deviceSalt = this.getOrCreateDeviceSalt();
    return `${APP_KEY_MATERIAL}:${walletAddress}:${deviceSalt}`;
  }

  /**
   * Encrypt and persist the TOTP secret.
   * Clears any legacy plain-text value after migration.
   */
  static async saveSecret(secret: string, walletAddress: string): Promise<void> {
    const password = this.derivePassword(walletAddress);
    const encrypted = await encryptForStorage(secret, password);
    localStorage.setItem(SECRET_STORAGE_KEY, encrypted);
    // Remove legacy plain-text entry
    localStorage.removeItem(LEGACY_SECRET_KEY);
  }

  /**
   * Decrypt and return the TOTP secret.
   * Automatically migrates plain-text legacy values to encrypted storage.
   * Returns null when no secret is stored.
   */
  static async loadSecret(walletAddress: string): Promise<string | null> {
    const encrypted = localStorage.getItem(SECRET_STORAGE_KEY);
    if (encrypted) {
      try {
        const password = this.derivePassword(walletAddress);
        return await decryptFromStorage(encrypted, password);
      } catch {
        // Decryption failure (e.g. address mismatch) – treat as no secret
        return null;
      }
    }

    // Migration path: old code stored the secret in plain text
    const legacy = localStorage.getItem(LEGACY_SECRET_KEY);
    if (legacy) {
      await this.saveSecret(legacy, walletAddress);
      return legacy;
    }

    return null;
  }

  /**
   * Encrypt and persist the backup codes array.
   * Clears any legacy plain-text value after migration.
   */
  static async saveBackupCodes(
    codes: string[],
    walletAddress: string
  ): Promise<void> {
    const password = this.derivePassword(walletAddress);
    const encrypted = await encryptForStorage(JSON.stringify(codes), password);
    localStorage.setItem(BACKUP_CODES_STORAGE_KEY, encrypted);
    // Remove legacy plain-text entry
    localStorage.removeItem(LEGACY_BACKUP_KEY);
  }

  /**
   * Decrypt and return the backup codes array.
   * Automatically migrates plain-text legacy values to encrypted storage.
   * Returns an empty array when no codes are stored.
   */
  static async loadBackupCodes(walletAddress: string): Promise<string[]> {
    const encrypted = localStorage.getItem(BACKUP_CODES_STORAGE_KEY);
    if (encrypted) {
      try {
        const password = this.derivePassword(walletAddress);
        const decrypted = await decryptFromStorage(encrypted, password);
        return JSON.parse(decrypted) as string[];
      } catch {
        return [];
      }
    }

    // Migration path: old code stored backup codes in plain text
    const legacy = localStorage.getItem(LEGACY_BACKUP_KEY);
    if (legacy) {
      try {
        const codes: string[] = JSON.parse(legacy);
        await this.saveBackupCodes(codes, walletAddress);
        return codes;
      } catch {
        return [];
      }
    }

    return [];
  }

  /**
   * Verify a backup code and, if valid, consume it so it cannot be reused.
   * Returns true when the code matched; false otherwise.
   */
  static async verifyAndConsumeBackupCode(
    code: string,
    walletAddress: string
  ): Promise<boolean> {
    const storedCodes = await this.loadBackupCodes(walletAddress);
    if (!storedCodes.includes(code)) return false;
    const remaining = storedCodes.filter(c => c !== code);
    await this.saveBackupCodes(remaining, walletAddress);
    return true;
  }

  /**
   * Check whether a 2FA secret is currently stored (encrypted or legacy).
   */
  static hasSecret(): boolean {
    return (
      localStorage.getItem(SECRET_STORAGE_KEY) !== null ||
      localStorage.getItem(LEGACY_SECRET_KEY) !== null
    );
  }

  /**
   * Remove all 2FA-related data from storage (encrypted and legacy).
   * Call this when 2FA is disabled or the wallet is disconnected.
   */
  static clearAll(): void {
    localStorage.removeItem(SECRET_STORAGE_KEY);
    localStorage.removeItem(BACKUP_CODES_STORAGE_KEY);
    // Also remove legacy keys in case they were never migrated
    localStorage.removeItem(LEGACY_SECRET_KEY);
    localStorage.removeItem(LEGACY_BACKUP_KEY);
  }
}
