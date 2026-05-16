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
});
