/**
 * TwoFactorMigration unit tests
 */

import { TwoFactorMigration } from '../TwoFactorMigration';
import { TwoFactorSecureStorage, STORAGE_KEYS } from '../TwoFactorSecureStorage';

const store: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  key: (index: number) => Object.keys(store)[index] ?? null,
  get length() { return Object.keys(store).length; },
};

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

const WALLET_ADDRESS = 'SP1MIGRATION0000000000000000000000000000';

beforeEach(() => {
  localStorageMock.clear();
});

describe('TwoFactorMigration', () => {
  describe('needsMigration', () => {
    it('returns false when no legacy data is present', () => {
      expect(TwoFactorMigration.needsMigration()).toBe(false);
    });

    it('returns true when legacy secret is present', () => {
      localStorage.setItem(STORAGE_KEYS.legacySecret, 'SECRET');
      expect(TwoFactorMigration.needsMigration()).toBe(true);
    });

    it('returns true when legacy backup codes are present', () => {
      localStorage.setItem(STORAGE_KEYS.legacyBackupCodes, '["A","B"]');
      expect(TwoFactorMigration.needsMigration()).toBe(true);
    });
  });

  describe('migrate', () => {
    it('reports no migration when nothing to migrate', async () => {
      const result = await TwoFactorMigration.migrate(WALLET_ADDRESS);
      expect(result.secretMigrated).toBe(false);
      expect(result.backupCodesMigrated).toBe(false);
    });

    it('migrates legacy secret and reports it', async () => {
      localStorage.setItem(STORAGE_KEYS.legacySecret, 'TOTP_SECRET');
      const result = await TwoFactorMigration.migrate(WALLET_ADDRESS);
      expect(result.secretMigrated).toBe(true);
      // Legacy key should be cleared
      expect(localStorage.getItem(STORAGE_KEYS.legacySecret)).toBeNull();
      // Encrypted key should now exist
      expect(localStorage.getItem(STORAGE_KEYS.encryptedSecret)).not.toBeNull();
    });

    it('migrates legacy backup codes and reports it', async () => {
      localStorage.setItem(STORAGE_KEYS.legacyBackupCodes, JSON.stringify(['X1', 'X2']));
      const result = await TwoFactorMigration.migrate(WALLET_ADDRESS);
      expect(result.backupCodesMigrated).toBe(true);
      expect(localStorage.getItem(STORAGE_KEYS.legacyBackupCodes)).toBeNull();
      // Verify the migrated codes are readable
      const codes = await TwoFactorSecureStorage.loadBackupCodes(WALLET_ADDRESS);
      expect(codes).toEqual(['X1', 'X2']);
    });

    it('is idempotent — second call reports no migration', async () => {
      localStorage.setItem(STORAGE_KEYS.legacySecret, 'S');
      await TwoFactorMigration.migrate(WALLET_ADDRESS);
      const second = await TwoFactorMigration.migrate(WALLET_ADDRESS);
      expect(second.secretMigrated).toBe(false);
    });
  });
});
