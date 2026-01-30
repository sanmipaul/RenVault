/**
 * Unit tests for cryptographic utilities
 */

import {
  generateSecureId,
  generateSecureUUID,
  getRandomBytes,
  generateSecureHex,
  bytesToHex,
  hexToBytes,
  stringToBytes,
  bytesToString,
  generateSecureTransactionId,
  generateSecureBackupId
} from '../utils/crypto';

describe('Crypto Utilities', () => {
  describe('generateSecureId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateSecureId();
      const id2 = generateSecureId();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with prefix', () => {
      const id = generateSecureId('test');
      expect(id.startsWith('test_')).toBe(true);
    });

    it('should generate IDs with specified length', () => {
      const id = generateSecureId('', 8);
      expect(id.length).toBe(16); // 8 bytes = 16 hex chars
    });
  });

  describe('generateSecureUUID', () => {
    it('should generate valid UUID v4 format', () => {
      const uuid = generateSecureUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateSecureUUID();
      const uuid2 = generateSecureUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('getRandomBytes', () => {
    it('should generate bytes of correct length', () => {
      const bytes = getRandomBytes(16);
      expect(bytes.length).toBe(16);
    });

    it('should generate Uint8Array', () => {
      const bytes = getRandomBytes(8);
      expect(bytes).toBeInstanceOf(Uint8Array);
    });

    it('should generate different values each time', () => {
      const bytes1 = getRandomBytes(16);
      const bytes2 = getRandomBytes(16);
      expect(bytesToHex(bytes1)).not.toBe(bytesToHex(bytes2));
    });
  });

  describe('generateSecureHex', () => {
    it('should generate hex string of correct length', () => {
      const hex = generateSecureHex(32);
      expect(hex.length).toBe(32);
    });

    it('should generate valid hex characters only', () => {
      const hex = generateSecureHex(64);
      expect(hex).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe('bytesToHex and hexToBytes', () => {
    it('should convert bytes to hex and back', () => {
      const original = new Uint8Array([0, 1, 255, 128, 64]);
      const hex = bytesToHex(original);
      const converted = hexToBytes(hex);
      expect(Array.from(converted)).toEqual(Array.from(original));
    });

    it('should handle empty array', () => {
      const empty = new Uint8Array(0);
      const hex = bytesToHex(empty);
      expect(hex).toBe('');
    });
  });

  describe('stringToBytes and bytesToString', () => {
    it('should convert string to bytes and back', () => {
      const original = 'Hello, World! 🌍';
      const bytes = stringToBytes(original);
      const converted = bytesToString(bytes);
      expect(converted).toBe(original);
    });

    it('should handle empty string', () => {
      const bytes = stringToBytes('');
      expect(bytes.length).toBe(0);
    });
  });

  describe('generateSecureTransactionId', () => {
    it('should generate valid transaction ID format', () => {
      const txId = generateSecureTransactionId();
      expect(txId.startsWith('0x')).toBe(true);
      expect(txId.length).toBe(66); // 0x + 64 hex chars
    });

    it('should generate unique transaction IDs', () => {
      const txId1 = generateSecureTransactionId();
      const txId2 = generateSecureTransactionId();
      expect(txId1).not.toBe(txId2);
    });
  });

  describe('generateSecureBackupId', () => {
    it('should generate valid backup ID format', () => {
      const backupId = generateSecureBackupId();
      expect(backupId.startsWith('backup_')).toBe(true);
    });

    it('should generate unique backup IDs', () => {
      const id1 = generateSecureBackupId();
      const id2 = generateSecureBackupId();
      expect(id1).not.toBe(id2);
    });
  });
});

describe('Randomness Quality', () => {
  it('should have good distribution in random bytes', () => {
    const samples = 1000;
    const byteCount = 16;
    const frequencies = new Array(256).fill(0);

    for (let i = 0; i < samples; i++) {
      const bytes = getRandomBytes(byteCount);
      bytes.forEach(byte => frequencies[byte]++);
    }

    // Check that no single byte value dominates
    const totalBytes = samples * byteCount;
    const expectedFrequency = totalBytes / 256;
    const tolerance = expectedFrequency * 0.5; // Allow 50% deviation

    const outliers = frequencies.filter(
      freq => Math.abs(freq - expectedFrequency) > tolerance
    );

    // Should have very few outliers with good randomness
    expect(outliers.length).toBeLessThan(30);
  });
});
