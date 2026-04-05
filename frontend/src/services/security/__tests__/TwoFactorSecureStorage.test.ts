/**
 * TwoFactorSecureStorage unit tests
 *
 * These tests exercise the public API of TwoFactorSecureStorage in a
 * jsdom environment where Web Crypto is available (provided by Jest's
 * testEnvironment: 'jsdom' + the crypto polyfill below).
 */

import { TwoFactorSecureStorage, STORAGE_KEYS } from '../TwoFactorSecureStorage';

// Minimal localStorage mock
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

// Web Crypto is available in jsdom >= 16 via globalThis.crypto — no polyfill needed.

const WALLET_ADDRESS = 'SP1TEST000000000000000000000000000000000';

beforeEach(() => {
  localStorageMock.clear();
});

describe('TwoFactorSecureStorage', () => {
  describe('hasSecret', () => {
    it('returns false when no secret is stored', () => {
      expect(TwoFactorSecureStorage.hasSecret()).toBe(false);
    });

    it('returns true when encrypted secret is present', async () => {
      await TwoFactorSecureStorage.saveSecret('TOTP_SECRET', WALLET_ADDRESS);
      expect(TwoFactorSecureStorage.hasSecret()).toBe(true);
    });

    it('returns true when only legacy plain-text secret is present', () => {
      localStorage.setItem(STORAGE_KEYS.legacySecret, 'LEGACY_SECRET');
      expect(TwoFactorSecureStorage.hasSecret()).toBe(true);
    });
  });

  describe('saveSecret / loadSecret', () => {
    it('round-trips the TOTP secret through encryption', async () => {
      await TwoFactorSecureStorage.saveSecret('MY_SECRET', WALLET_ADDRESS);
      const loaded = await TwoFactorSecureStorage.loadSecret(WALLET_ADDRESS);
      expect(loaded).toBe('MY_SECRET');
    });

    it('returns null when nothing is stored', async () => {
      const result = await TwoFactorSecureStorage.loadSecret(WALLET_ADDRESS);
      expect(result).toBeNull();
    });

    it('returns null when decryption fails (wrong wallet address)', async () => {
      await TwoFactorSecureStorage.saveSecret('MY_SECRET', WALLET_ADDRESS);
      const result = await TwoFactorSecureStorage.loadSecret('SP_WRONG_ADDRESS');
      expect(result).toBeNull();
    });

    it('migrates legacy plain-text secret to encrypted storage', async () => {
      localStorage.setItem(STORAGE_KEYS.legacySecret, 'LEGACY_SECRET');
      const loaded = await TwoFactorSecureStorage.loadSecret(WALLET_ADDRESS);
      expect(loaded).toBe('LEGACY_SECRET');
      // Legacy key should be removed after migration
      expect(localStorage.getItem(STORAGE_KEYS.legacySecret)).toBeNull();
      // Encrypted key should now be present
      expect(localStorage.getItem(STORAGE_KEYS.encryptedSecret)).not.toBeNull();
    });
  });

  describe('saveBackupCodes / loadBackupCodes', () => {
    const codes = ['CODE-1', 'CODE-2', 'CODE-3'];

    it('round-trips backup codes through encryption', async () => {
      await TwoFactorSecureStorage.saveBackupCodes(codes, WALLET_ADDRESS);
      const loaded = await TwoFactorSecureStorage.loadBackupCodes(WALLET_ADDRESS);
      expect(loaded).toEqual(codes);
    });

    it('returns empty array when nothing is stored', async () => {
      const result = await TwoFactorSecureStorage.loadBackupCodes(WALLET_ADDRESS);
      expect(result).toEqual([]);
    });

    it('migrates legacy plain-text backup codes', async () => {
      localStorage.setItem(STORAGE_KEYS.legacyBackupCodes, JSON.stringify(codes));
      const loaded = await TwoFactorSecureStorage.loadBackupCodes(WALLET_ADDRESS);
      expect(loaded).toEqual(codes);
      expect(localStorage.getItem(STORAGE_KEYS.legacyBackupCodes)).toBeNull();
    });
  });

  describe('verifyAndConsumeBackupCode', () => {
    const codes = ['AAA-111', 'BBB-222', 'CCC-333'];

    it('returns true and removes the used code', async () => {
      await TwoFactorSecureStorage.saveBackupCodes(codes, WALLET_ADDRESS);
      const result = await TwoFactorSecureStorage.verifyAndConsumeBackupCode('BBB-222', WALLET_ADDRESS);
      expect(result).toBe(true);
      const remaining = await TwoFactorSecureStorage.loadBackupCodes(WALLET_ADDRESS);
      expect(remaining).toEqual(['AAA-111', 'CCC-333']);
    });

    it('returns false for an unknown code', async () => {
      await TwoFactorSecureStorage.saveBackupCodes(codes, WALLET_ADDRESS);
      const result = await TwoFactorSecureStorage.verifyAndConsumeBackupCode('INVALID', WALLET_ADDRESS);
      expect(result).toBe(false);
    });

    it('does not allow the same code twice', async () => {
      await TwoFactorSecureStorage.saveBackupCodes(codes, WALLET_ADDRESS);
      await TwoFactorSecureStorage.verifyAndConsumeBackupCode('AAA-111', WALLET_ADDRESS);
      const second = await TwoFactorSecureStorage.verifyAndConsumeBackupCode('AAA-111', WALLET_ADDRESS);
      expect(second).toBe(false);
    });
  });

  describe('clearAll', () => {
    it('removes all 2FA-related keys from localStorage', async () => {
      await TwoFactorSecureStorage.saveSecret('S', WALLET_ADDRESS);
      await TwoFactorSecureStorage.saveBackupCodes(['X'], WALLET_ADDRESS);
      localStorage.setItem(STORAGE_KEYS.legacySecret, 'old');
      localStorage.setItem(STORAGE_KEYS.legacyBackupCodes, '["old"]');

      TwoFactorSecureStorage.clearAll();

      expect(localStorage.getItem(STORAGE_KEYS.encryptedSecret)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.encryptedBackupCodes)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.legacySecret)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.legacyBackupCodes)).toBeNull();
    });

    it('sets hasSecret to false after clearing', async () => {
      await TwoFactorSecureStorage.saveSecret('S', WALLET_ADDRESS);
      TwoFactorSecureStorage.clearAll();
      expect(TwoFactorSecureStorage.hasSecret()).toBe(false);
    });
  });

  describe('device salt', () => {
    it('generates and persists a device salt', async () => {
      await TwoFactorSecureStorage.saveSecret('S', WALLET_ADDRESS);
      const salt = localStorage.getItem(STORAGE_KEYS.deviceSalt);
      expect(salt).not.toBeNull();
      expect(salt).toHaveLength(64); // 32 bytes as hex
    });

    it('reuses the same salt across calls', async () => {
      await TwoFactorSecureStorage.saveSecret('S1', WALLET_ADDRESS);
      const salt1 = localStorage.getItem(STORAGE_KEYS.deviceSalt);
      await TwoFactorSecureStorage.saveSecret('S2', WALLET_ADDRESS);
      const salt2 = localStorage.getItem(STORAGE_KEYS.deviceSalt);
      expect(salt1).toBe(salt2);
    });
  });
});
