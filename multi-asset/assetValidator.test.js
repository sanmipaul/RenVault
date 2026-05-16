'use strict';

const { AssetValidator } = require('./assetValidator');

describe('AssetValidator', () => {
  // ─── validateAmount ───────────────────────────────────────────────────────

  describe('validateAmount', () => {
    it('returns true for valid positive integers', () => {
      expect(AssetValidator.validateAmount(100)).toBe(true);
    });

    it('returns true for valid positive decimals', () => {
      expect(AssetValidator.validateAmount(0.5)).toBe(true);
    });

    it('returns false for undefined', () => {
      expect(AssetValidator.validateAmount(undefined)).toBe(false);
    });

    it('returns false for null', () => {
      expect(AssetValidator.validateAmount(null)).toBe(false);
    });

    it('returns false for zero', () => {
      expect(AssetValidator.validateAmount(0)).toBe(false);
    });

    it('returns false for negative numbers', () => {
      expect(AssetValidator.validateAmount(-1)).toBe(false);
    });

    it('returns false for NaN', () => {
      expect(AssetValidator.validateAmount(NaN)).toBe(false);
    });

    it('returns false for Infinity', () => {
      expect(AssetValidator.validateAmount(Infinity)).toBe(false);
    });

    it('returns false for booleans', () => {
      expect(AssetValidator.validateAmount(true)).toBe(false);
      expect(AssetValidator.validateAmount(false)).toBe(false);
    });

    it('returns false for amounts exceeding MAX_SAFE_INTEGER', () => {
      expect(AssetValidator.validateAmount(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    });

    it('returns true for numeric strings that represent valid amounts', () => {
      expect(AssetValidator.validateAmount('50')).toBe(true);
    });
  });

  // ─── validateAssetContract ────────────────────────────────────────────────

  describe('validateAssetContract', () => {
    it('returns true for a valid mainnet SIP-010 contract', () => {
      expect(AssetValidator.validateAssetContract('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.sbtc-token')).toBe(true);
    });

    it('returns true for a valid testnet SIP-010 contract', () => {
      expect(AssetValidator.validateAssetContract('ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.test-token')).toBe(true);
    });

    it('returns false for empty string', () => {
      expect(AssetValidator.validateAssetContract('')).toBe(false);
    });

    it('returns false for null', () => {
      expect(AssetValidator.validateAssetContract(null)).toBe(false);
    });

    it('returns false for contract without dot separator', () => {
      expect(AssetValidator.validateAssetContract('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9')).toBe(false);
    });

    it('returns false for contract with uppercase token name', () => {
      expect(AssetValidator.validateAssetContract('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.SBTC')).toBe(false);
    });

    it('returns false for contract with wrong address prefix', () => {
      expect(AssetValidator.validateAssetContract('0x1234567890abcdef.some-token')).toBe(false);
    });
  });

  // ─── formatAmount ─────────────────────────────────────────────────────────

  describe('formatAmount', () => {
    it('formats a whole number with 6 decimals correctly', () => {
      expect(AssetValidator.formatAmount(1, 6)).toBe('1000000');
    });

    it('formats fractional amount with 8 decimals (sBTC style)', () => {
      expect(AssetValidator.formatAmount(0.001, 8)).toBe('100000');
    });

    it('returns "0" for invalid amount', () => {
      expect(AssetValidator.formatAmount(-5, 6)).toBe('0');
    });

    it('returns "0" for null amount', () => {
      expect(AssetValidator.formatAmount(null, 6)).toBe('0');
    });

    it('throws for decimals out of range', () => {
      expect(() => AssetValidator.formatAmount(1, 19)).toThrow('decimals must be an integer between 0 and 18');
    });

    it('throws for negative decimals', () => {
      expect(() => AssetValidator.formatAmount(1, -1)).toThrow('decimals must be an integer between 0 and 18');
    });

    it('formats correctly with 0 decimals', () => {
      expect(AssetValidator.formatAmount(42, 0)).toBe('42');
    });
  });

  // ─── parseAmount ──────────────────────────────────────────────────────────

  describe('parseAmount', () => {
    it('converts micro-units back to standard with 6 decimals', () => {
      expect(AssetValidator.parseAmount(1000000, 6)).toBe(1);
    });

    it('converts micro-units back to standard with 8 decimals', () => {
      expect(AssetValidator.parseAmount(100000000, 8)).toBe(1);
    });

    it('returns 0 for falsy amount', () => {
      expect(AssetValidator.parseAmount(0, 6)).toBe(0);
      expect(AssetValidator.parseAmount(null, 6)).toBe(0);
    });
  });

  // ─── validateDeposit ──────────────────────────────────────────────────────

  describe('validateDeposit', () => {
    it('returns true for valid deposit above minimum', () => {
      expect(AssetValidator.validateDeposit('STX', 100, 10)).toBe(true);
    });

    it('returns true for deposit equal to minimum', () => {
      expect(AssetValidator.validateDeposit('STX', 10, 10)).toBe(true);
    });

    it('throws for invalid amount', () => {
      expect(() => AssetValidator.validateDeposit('STX', -1, 0)).toThrow('Invalid deposit amount');
    });

    it('throws for null amount', () => {
      expect(() => AssetValidator.validateDeposit('STX', null, 0)).toThrow('Invalid deposit amount');
    });

    it('throws for amount below minimum', () => {
      expect(() => AssetValidator.validateDeposit('STX', 5, 10)).toThrow('Deposit amount below minimum of 10');
    });

    it('throws for invalid minDeposit (negative)', () => {
      expect(() => AssetValidator.validateDeposit('STX', 100, -1)).toThrow('minDeposit must be a non-negative finite number');
    });

    it('throws for minDeposit of Infinity', () => {
      expect(() => AssetValidator.validateDeposit('STX', 100, Infinity)).toThrow('minDeposit must be a non-negative finite number');
    });

    it('returns true with default minDeposit of 0', () => {
      expect(AssetValidator.validateDeposit('STX', 1)).toBe(true);
    });
  });

  // ─── validateWithdrawal ───────────────────────────────────────────────────

  describe('validateWithdrawal', () => {
    it('returns true when amount is within balance', () => {
      expect(AssetValidator.validateWithdrawal('STX', 50, 100)).toBe(true);
    });

    it('returns true when amount equals balance exactly', () => {
      expect(AssetValidator.validateWithdrawal('STX', 100, 100)).toBe(true);
    });

    it('throws for invalid withdrawal amount', () => {
      expect(() => AssetValidator.validateWithdrawal('STX', 0, 100)).toThrow('Invalid withdrawal amount');
    });

    it('throws for negative amount', () => {
      expect(() => AssetValidator.validateWithdrawal('STX', -10, 100)).toThrow('Invalid withdrawal amount');
    });

    it('throws when amount exceeds balance', () => {
      expect(() => AssetValidator.validateWithdrawal('STX', 200, 100)).toThrow('Insufficient balance');
    });

    it('throws for negative balance', () => {
      expect(() => AssetValidator.validateWithdrawal('STX', 10, -5)).toThrow('balance must be a non-negative finite number');
    });

    it('throws for Infinity balance', () => {
      expect(() => AssetValidator.validateWithdrawal('STX', 10, Infinity)).toThrow('balance must be a non-negative finite number');
    });

    it('throws for zero balance', () => {
      expect(() => AssetValidator.validateWithdrawal('STX', 10, 0)).toThrow('Insufficient balance');
    });
  });
});
