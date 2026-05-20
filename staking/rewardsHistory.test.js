'use strict';

const { RewardsHistory } = require('./rewardsHistory');

describe('RewardsHistory', () => {
  let rh;
  beforeEach(() => { rh = new RewardsHistory(); });

  // ─── addEntry ─────────────────────────────────────────────────────────────

  describe('addEntry', () => {
    it('stores an entry and returns it', () => {
      const e = rh.addEntry('SP1STAKER', 500, 'distribution');
      expect(e.staker).toBe('SP1STAKER');
      expect(e.amount).toBe(500);
      expect(e.type).toBe('distribution');
    });

    it('assigns sequential epoch numbers', () => {
      const a = rh.addEntry('SP1', 100);
      const b = rh.addEntry('SP1', 200);
      expect(b.epoch).toBe(a.epoch + 1);
    });

    it('throws for empty staker string', () => {
      expect(() => rh.addEntry('', 100)).toThrow('staker must be a non-empty string');
    });

    it('throws for null staker', () => {
      expect(() => rh.addEntry(null, 100)).toThrow();
    });

    it('throws for negative amount', () => {
      expect(() => rh.addEntry('SP1', -1)).toThrow('amount must be a non-negative finite number');
    });

    it('allows zero amount', () => {
      expect(() => rh.addEntry('SP1', 0)).not.toThrow();
    });

    it('throws for unknown type', () => {
      expect(() => rh.addEntry('SP1', 100, 'airdrop')).toThrow('unknown type');
    });

    it('defaults type to "distribution"', () => {
      const e = rh.addEntry('SP1', 100);
      expect(e.type).toBe('distribution');
    });

    it('attaches a timestamp', () => {
      const before = Date.now();
      const e = rh.addEntry('SP1', 100);
      expect(e.timestamp).toBeGreaterThanOrEqual(before);
    });
  });
});
