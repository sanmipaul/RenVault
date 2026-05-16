'use strict';

const { VaultManager } = require('./vaultManager');

const VALID_SENDER_KEY = 'a'.repeat(64);
const VALID_STX_ADDRESS = 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9';
const MOCK_API = { network: 'testnet' };

describe('VaultManager', () => {

  // ─── constructor ──────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('creates an instance with a valid stacksApi', () => {
      const vm = new VaultManager(MOCK_API);
      expect(vm).toBeDefined();
    });

    it('throws when stacksApi is null', () => {
      expect(() => new VaultManager(null)).toThrow('VaultManager requires a valid stacksApi instance');
    });

    it('throws when stacksApi is undefined', () => {
      expect(() => new VaultManager()).toThrow('VaultManager requires a valid stacksApi instance');
    });
  });
});
