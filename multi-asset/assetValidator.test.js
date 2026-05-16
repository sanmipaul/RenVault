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
});
