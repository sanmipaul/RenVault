/**
 * Unit tests for encryption utilities
 */

import {
  encryptWithPassword,
  decryptWithPassword,
  encryptForStorage,
  decryptFromStorage,
  serializeEncryptedData,
  deserializeEncryptedData,
  hashData,
  verifyHash,
  EncryptedData
} from '../utils/encryption';
import { CryptoError, CryptoErrorCode } from '../types/crypto';

describe('Encryption Utilities', () => {
  const testPassword = 'SecurePassword123!';
  const testData = 'Hello, this is sensitive data!';

  describe('encryptWithPassword', () => {
    it('should encrypt data successfully', async () => {
      const encrypted = await encryptWithPassword(testData, testPassword);

      expect(encrypted.ciphertext).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.salt).toBeDefined();
      expect(encrypted.version).toBe(1);
    });

    it('should produce different ciphertext each time', async () => {
      const encrypted1 = await encryptWithPassword(testData, testPassword);
      const encrypted2 = await encryptWithPassword(testData, testPassword);

      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.salt).not.toBe(encrypted2.salt);
    });

    it('should reject empty data', async () => {
      await expect(encryptWithPassword('', testPassword)).rejects.toThrow();
    });

    it('should reject short password', async () => {
      await expect(encryptWithPassword(testData, 'short')).rejects.toThrow();
    });
  });

  describe('decryptWithPassword', () => {
    it('should decrypt data successfully', async () => {
      const encrypted = await encryptWithPassword(testData, testPassword);
      const decrypted = await decryptWithPassword(encrypted, testPassword);

      expect(decrypted).toBe(testData);
    });

    it('should fail with wrong password', async () => {
      const encrypted = await encryptWithPassword(testData, testPassword);

      await expect(
        decryptWithPassword(encrypted, 'WrongPassword123!')
      ).rejects.toThrow();
    });

    it('should fail with corrupted ciphertext', async () => {
      const encrypted = await encryptWithPassword(testData, testPassword);
      encrypted.ciphertext = encrypted.ciphertext.slice(0, -10) + '0000000000';

      await expect(
        decryptWithPassword(encrypted, testPassword)
      ).rejects.toThrow();
    });

    it('should reject invalid encrypted data structure', async () => {
      const invalidData = { foo: 'bar' } as unknown as EncryptedData;

      await expect(
        decryptWithPassword(invalidData, testPassword)
      ).rejects.toThrow();
    });
  });

  describe('encryptForStorage and decryptFromStorage', () => {
    it('should encrypt and decrypt for storage', async () => {
      const serialized = await encryptForStorage(testData, testPassword);
      expect(typeof serialized).toBe('string');

      const decrypted = await decryptFromStorage(serialized, testPassword);
      expect(decrypted).toBe(testData);
    });

    it('should produce base64-encoded output', async () => {
      const serialized = await encryptForStorage(testData, testPassword);
      // Base64 should not throw when decoded
      expect(() => atob(serialized)).not.toThrow();
    });
  });

  describe('serializeEncryptedData and deserializeEncryptedData', () => {
    it('should serialize and deserialize encrypted data', async () => {
      const encrypted = await encryptWithPassword(testData, testPassword);
      const serialized = serializeEncryptedData(encrypted);
      const deserialized = deserializeEncryptedData(serialized);

      expect(deserialized.ciphertext).toBe(encrypted.ciphertext);
      expect(deserialized.iv).toBe(encrypted.iv);
      expect(deserialized.salt).toBe(encrypted.salt);
      expect(deserialized.version).toBe(encrypted.version);
    });

    it('should reject invalid serialized data', () => {
      expect(() => deserializeEncryptedData('invalid')).toThrow();
    });

    it('should reject incomplete encrypted data', () => {
      const incomplete = btoa(JSON.stringify({ ciphertext: 'test' }));
      expect(() => deserializeEncryptedData(incomplete)).toThrow();
    });
  });

  describe('hashData', () => {
    it('should produce consistent hash for same input', async () => {
      const hash1 = await hashData(testData);
      const hash2 = await hashData(testData);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', async () => {
      const hash1 = await hashData('data1');
      const hash2 = await hashData('data2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce 64-character hex hash (SHA-256)', async () => {
      const hash = await hashData(testData);
      expect(hash.length).toBe(64);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('verifyHash', () => {
    it('should verify correct hash', async () => {
      const hash = await hashData(testData);
      const isValid = await verifyHash(testData, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect hash', async () => {
      const hash = await hashData(testData);
      const isValid = await verifyHash('different data', hash);

      expect(isValid).toBe(false);
    });
  });

  describe('Unicode and special characters', () => {
    it('should handle Unicode characters', async () => {
      const unicodeData = '你好世界 🌍 مرحبا';
      const encrypted = await encryptWithPassword(unicodeData, testPassword);
      const decrypted = await decryptWithPassword(encrypted, testPassword);

      expect(decrypted).toBe(unicodeData);
    });

    it('should handle special characters', async () => {
      const specialData = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/\\`~';
      const encrypted = await encryptWithPassword(specialData, testPassword);
      const decrypted = await decryptWithPassword(encrypted, testPassword);

      expect(decrypted).toBe(specialData);
    });

    it('should handle newlines and tabs', async () => {
      const whitespaceData = 'line1\nline2\tindented';
      const encrypted = await encryptWithPassword(whitespaceData, testPassword);
      const decrypted = await decryptWithPassword(encrypted, testPassword);

      expect(decrypted).toBe(whitespaceData);
    });
  });

  describe('Large data handling', () => {
    it('should handle moderately large data', async () => {
      const largeData = 'x'.repeat(100000); // 100KB
      const encrypted = await encryptWithPassword(largeData, testPassword);
      const decrypted = await decryptWithPassword(encrypted, testPassword);

      expect(decrypted).toBe(largeData);
    });
  });
});
