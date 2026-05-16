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
});
