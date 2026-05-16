'use strict';

const { AssetRegistry, supportedAssets } = require('./assetRegistry');

describe('AssetRegistry', () => {
  let registry;

  beforeEach(() => {
    registry = new AssetRegistry();
  });

  // ─── getAsset ─────────────────────────────────────────────────────────────

  describe('getAsset', () => {
    it('returns the correct asset config for STX', () => {
      const asset = registry.getAsset('STX');
      expect(asset).toBeDefined();
      expect(asset.symbol).toBe('STX');
      expect(asset.type).toBe('native');
      expect(asset.decimals).toBe(6);
    });

    it('returns the correct config for a SIP-010 token (sBTC)', () => {
      const asset = registry.getAsset('sBTC');
      expect(asset).toBeDefined();
      expect(asset.type).toBe('sip010');
      expect(asset.contract).toBeDefined();
    });

    it('returns undefined for unknown symbols', () => {
      expect(registry.getAsset('FAKE')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(registry.getAsset('')).toBeUndefined();
    });
  });

  // ─── getAllAssets ──────────────────────────────────────────────────────────

  describe('getAllAssets', () => {
    it('returns an array of all supported assets', () => {
      const assets = registry.getAllAssets();
      expect(Array.isArray(assets)).toBe(true);
      expect(assets.length).toBe(Object.keys(supportedAssets).length);
    });

    it('includes STX in the returned list', () => {
      const assets = registry.getAllAssets();
      const stx = assets.find(a => a.symbol === 'STX');
      expect(stx).toBeDefined();
    });
  });

  // ─── isSupported ──────────────────────────────────────────────────────────

  describe('isSupported', () => {
    it('returns true for supported symbols', () => {
      expect(registry.isSupported('STX')).toBe(true);
      expect(registry.isSupported('sBTC')).toBe(true);
      expect(registry.isSupported('USDA')).toBe(true);
    });

    it('returns false for unsupported symbols', () => {
      expect(registry.isSupported('DOGE')).toBe(false);
      expect(registry.isSupported('')).toBe(false);
    });
  });

  // ─── getContract ──────────────────────────────────────────────────────────

  describe('getContract', () => {
    it('returns contract address for SIP-010 tokens', () => {
      expect(registry.getContract('sBTC')).toBe('SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.sbtc-token');
    });

    it('returns undefined for native assets (no contract)', () => {
      expect(registry.getContract('STX')).toBeUndefined();
    });

    it('returns undefined for unknown symbols', () => {
      expect(registry.getContract('UNKNOWN')).toBeUndefined();
    });
  });

  // ─── getType ──────────────────────────────────────────────────────────────

  describe('getType', () => {
    it('returns "native" for STX', () => {
      expect(registry.getType('STX')).toBe('native');
    });

    it('returns "sip010" for token assets', () => {
      expect(registry.getType('ALEX')).toBe('sip010');
    });

    it('returns undefined for unknown symbols', () => {
      expect(registry.getType('XYZ')).toBeUndefined();
    });
  });

  // ─── getDecimals ──────────────────────────────────────────────────────────

  describe('getDecimals', () => {
    it('returns 6 for STX', () => {
      expect(registry.getDecimals('STX')).toBe(6);
    });

    it('returns 8 for sBTC', () => {
      expect(registry.getDecimals('sBTC')).toBe(8);
    });

    it('returns 6 as default for unknown symbol', () => {
      expect(registry.getDecimals('UNKNOWN')).toBe(6);
    });
  });

  // ─── getAssetOrThrow ──────────────────────────────────────────────────────

  describe('getAssetOrThrow', () => {
    it('returns asset for supported symbol', () => {
      const asset = registry.getAssetOrThrow('STX');
      expect(asset.symbol).toBe('STX');
    });

    it('throws for unknown symbol', () => {
      expect(() => registry.getAssetOrThrow('FAKE')).toThrow('Asset "FAKE" is not supported by the registry');
    });

    it('throws for empty string', () => {
      expect(() => registry.getAssetOrThrow('')).toThrow();
    });
  });

  // ─── addAsset ─────────────────────────────────────────────────────────────

  describe('addAsset', () => {
    const validSip010Config = {
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 6,
      type: 'sip010',
      contract: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.test-token'
    };

    it('adds a valid SIP-010 asset', () => {
      registry.addAsset('TEST', validSip010Config);
      expect(registry.isSupported('TEST')).toBe(true);
    });

    it('adds a valid native asset', () => {
      registry.addAsset('NTVX', { name: 'Native X', symbol: 'NTVX', decimals: 6, type: 'native' });
      expect(registry.getType('NTVX')).toBe('native');
    });

    it('throws for invalid symbol (lowercase)', () => {
      expect(() => registry.addAsset('bad', validSip010Config)).toThrow('Invalid asset symbol');
    });

    it('throws for null config', () => {
      expect(() => registry.addAsset('TST', null)).toThrow('Asset config must be a non-null object');
    });

    it('throws for unsupported type', () => {
      expect(() => registry.addAsset('TST', { ...validSip010Config, type: 'erc20' })).toThrow('Asset type must be "native" or "sip010"');
    });

    it('throws for SIP-010 with invalid contract address', () => {
      expect(() => registry.addAsset('TST', { ...validSip010Config, contract: 'invalid-contract' })).toThrow('Invalid contract address');
    });

    it('throws for decimals out of range', () => {
      expect(() => registry.addAsset('TST', { ...validSip010Config, decimals: 19 })).toThrow('Asset decimals must be an integer between 0 and 18');
    });

    it('throws for non-integer decimals', () => {
      expect(() => registry.addAsset('TST', { ...validSip010Config, decimals: 6.5 })).toThrow('Asset decimals must be an integer between 0 and 18');
    });
  });
});
