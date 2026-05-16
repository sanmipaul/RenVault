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

  // ─── depositAsset ─────────────────────────────────────────────────────────

  describe('depositAsset', () => {
    let vm;
    beforeEach(() => { vm = new VaultManager(MOCK_API); });

    it('resolves successfully for a valid STX deposit', async () => {
      const result = await vm.depositAsset('STX', 100, VALID_SENDER_KEY);
      expect(result.success).toBe(true);
      expect(result.txId).toBe('mock-tx-id');
    });

    it('resolves successfully for a valid sBTC deposit', async () => {
      const result = await vm.depositAsset('sBTC', 0.001, VALID_SENDER_KEY);
      expect(result.success).toBe(true);
    });

    it('throws for an invalid asset symbol', async () => {
      await expect(vm.depositAsset('bad', 100, VALID_SENDER_KEY)).rejects.toThrow('Invalid asset symbol');
    });

    it('throws for an unsupported asset', async () => {
      await expect(vm.depositAsset('DOGE', 100, VALID_SENDER_KEY)).rejects.toThrow();
    });

    it('throws for an invalid sender key', async () => {
      await expect(vm.depositAsset('STX', 100, 'short-key')).rejects.toThrow('senderKey must be a valid 64-character hex private key');
    });

    it('throws for a zero deposit amount', async () => {
      await expect(vm.depositAsset('STX', 0, VALID_SENDER_KEY)).rejects.toThrow('Invalid deposit amount');
    });

    it('throws for a negative deposit amount', async () => {
      await expect(vm.depositAsset('STX', -50, VALID_SENDER_KEY)).rejects.toThrow('Invalid deposit amount');
    });
  });
});
