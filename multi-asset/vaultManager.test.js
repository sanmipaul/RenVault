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

  // ─── withdrawAsset ────────────────────────────────────────────────────────

  describe('withdrawAsset', () => {
    let vm;
    beforeEach(() => { vm = new VaultManager(MOCK_API); });

    it('resolves successfully for a valid STX withdrawal', async () => {
      const result = await vm.withdrawAsset('STX', 50, VALID_SENDER_KEY);
      expect(result.success).toBe(true);
    });

    it('throws for an invalid symbol', async () => {
      await expect(vm.withdrawAsset('bad!', 50, VALID_SENDER_KEY)).rejects.toThrow('Invalid asset symbol');
    });

    it('throws for an invalid sender key', async () => {
      await expect(vm.withdrawAsset('STX', 50, '')).rejects.toThrow('senderKey must be a valid 64-character hex private key');
    });

    it('throws for a zero withdrawal amount', async () => {
      await expect(vm.withdrawAsset('STX', 0, VALID_SENDER_KEY)).rejects.toThrow('Withdrawal amount must be a positive finite number');
    });

    it('throws for a negative withdrawal amount', async () => {
      await expect(vm.withdrawAsset('STX', -1, VALID_SENDER_KEY)).rejects.toThrow('Withdrawal amount must be a positive finite number');
    });

    it('throws for an unsupported asset', async () => {
      await expect(vm.withdrawAsset('FAKE', 10, VALID_SENDER_KEY)).rejects.toThrow();
    });
  });

  // ─── getBalance ───────────────────────────────────────────────────────────

  describe('getBalance', () => {
    let vm;
    beforeEach(() => { vm = new VaultManager(MOCK_API); });

    it('resolves for valid user and STX asset', async () => {
      const result = await vm.getBalance(VALID_STX_ADDRESS, 'STX');
      expect(result).toBeDefined();
    });

    it('throws for invalid Stacks address', async () => {
      await expect(vm.getBalance('0xbadaddress', 'STX')).rejects.toThrow('Invalid Stacks address');
    });

    it('throws for invalid asset symbol', async () => {
      await expect(vm.getBalance(VALID_STX_ADDRESS, 'bad')).rejects.toThrow('Invalid asset symbol');
    });

    it('throws for unsupported asset', async () => {
      await expect(vm.getBalance(VALID_STX_ADDRESS, 'FAKE')).rejects.toThrow();
    });
  });

  // ─── callContract ─────────────────────────────────────────────────────────

  describe('callContract', () => {
    let vm;
    beforeEach(() => { vm = new VaultManager(MOCK_API); });

    it('resolves with success and txId for valid inputs', async () => {
      const result = await vm.callContract('deposit-stx', [100]);
      expect(result.success).toBe(true);
      expect(typeof result.txId).toBe('string');
    });

    it('throws for empty functionName', async () => {
      await expect(vm.callContract('', [100])).rejects.toThrow('callContract requires a non-empty functionName string');
    });

    it('throws when args is not an array', async () => {
      await expect(vm.callContract('deposit-stx', 100)).rejects.toThrow('callContract requires args to be an array');
    });
  });
});
