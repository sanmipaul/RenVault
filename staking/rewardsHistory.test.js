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

  // ─── getHistory ───────────────────────────────────────────────────────────

  describe('getHistory', () => {
    it('returns all entries when no limit given', () => {
      rh.addEntry('SP1', 100);
      rh.addEntry('SP2', 200);
      expect(rh.getHistory().length).toBe(2);
    });

    it('returns entries newest-first', () => {
      rh.addEntry('SP1', 100);
      rh.addEntry('SP2', 200);
      const h = rh.getHistory();
      expect(h[0].staker).toBe('SP2');
    });

    it('respects a limit', () => {
      for (let i = 0; i < 10; i++) rh.addEntry('SP1', i + 1);
      expect(rh.getHistory(3).length).toBe(3);
    });

    it('returns empty array when no entries', () => {
      expect(rh.getHistory()).toEqual([]);
    });
  });

  // ─── getByStaker ──────────────────────────────────────────────────────────

  describe('getByStaker', () => {
    beforeEach(() => {
      rh.addEntry('SP1', 100);
      rh.addEntry('SP2', 200);
      rh.addEntry('SP1', 150);
    });

    it('returns only entries for the requested staker', () => {
      const r = rh.getByStaker('SP1');
      expect(r.every(e => e.staker === 'SP1')).toBe(true);
    });

    it('returns correct count for SP1', () => {
      expect(rh.getByStaker('SP1').length).toBe(2);
    });

    it('returns empty for unknown staker', () => {
      expect(rh.getByStaker('UNKNOWN').length).toBe(0);
    });

    it('respects a limit', () => {
      expect(rh.getByStaker('SP1', 1).length).toBe(1);
    });
  });

  // ─── getByDateRange ───────────────────────────────────────────────────────

  describe('getByDateRange', () => {
    it('returns entries within range', () => {
      const t = Date.now();
      rh.addEntry('SP1', 100);
      const all = rh.getByDateRange(t - 1000, t + 1000);
      expect(all.length).toBeGreaterThanOrEqual(1);
    });

    it('excludes entries outside range', () => {
      rh.addEntry('SP1', 100);
      const future = Date.now() + 100000;
      expect(rh.getByDateRange(future, future + 1000).length).toBe(0);
    });

    it('throws for negative startMs', () => {
      expect(() => rh.getByDateRange(-1)).toThrow('startMs must be a non-negative number');
    });
  });

  // ─── getByType ────────────────────────────────────────────────────────────

  describe('getByType', () => {
    it('filters by type correctly', () => {
      rh.addEntry('SP1', 100, 'distribution');
      rh.addEntry('SP1', 50, 'claim');
      expect(rh.getByType('distribution').length).toBe(1);
      expect(rh.getByType('claim').length).toBe(1);
    });
  });
});
