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

  // ─── aggregation ──────────────────────────────────────────────────────────

  describe('getTotalDistributed', () => {
    it('sums all amounts', () => {
      rh.addEntry('SP1', 100);
      rh.addEntry('SP2', 250);
      expect(rh.getTotalDistributed()).toBe(350);
    });

    it('returns 0 with no entries', () => {
      expect(rh.getTotalDistributed()).toBe(0);
    });
  });

  describe('getTotalForStaker', () => {
    it('returns sum for a single staker', () => {
      rh.addEntry('SP1', 100);
      rh.addEntry('SP1', 200);
      rh.addEntry('SP2', 999);
      expect(rh.getTotalForStaker('SP1')).toBe(300);
    });

    it('returns 0 for unknown staker', () => {
      rh.addEntry('SP1', 100);
      expect(rh.getTotalForStaker('NOBODY')).toBe(0);
    });
  });

  describe('getAverageReward', () => {
    it('computes mean correctly', () => {
      rh.addEntry('SP1', 100);
      rh.addEntry('SP2', 200);
      expect(rh.getAverageReward()).toBe(150);
    });

    it('returns 0 with no entries', () => {
      expect(rh.getAverageReward()).toBe(0);
    });
  });

  // ─── getTopEarners ────────────────────────────────────────────────────────

  describe('getTopEarners', () => {
    beforeEach(() => {
      rh.addEntry('SP1', 500);
      rh.addEntry('SP2', 1000);
      rh.addEntry('SP3', 250);
      rh.addEntry('SP1', 300);
    });

    it('returns earners sorted by total descending', () => {
      const top = rh.getTopEarners(3);
      expect(top[0].staker).toBe('SP2');
      expect(top[1].staker).toBe('SP1');
    });

    it('respects the limit', () => {
      expect(rh.getTopEarners(2).length).toBe(2);
    });
  });

  // ─── getUniqueStakers / clear ─────────────────────────────────────────────

  describe('getUniqueStakers', () => {
    it('returns each staker only once', () => {
      rh.addEntry('SP1', 100);
      rh.addEntry('SP1', 200);
      rh.addEntry('SP2', 100);
      expect(rh.getUniqueStakers().length).toBe(2);
    });
  });

  describe('clear', () => {
    it('empties entries and resets epoch', () => {
      rh.addEntry('SP1', 100);
      rh.clear();
      expect(rh.getHistory().length).toBe(0);
      const next = rh.addEntry('SP1', 50);
      expect(next.epoch).toBe(1);
    });
  });

  // ─── merge ────────────────────────────────────────────────────────────────

  describe('merge', () => {
    it('combines entries from two instances without duplicating epochs', () => {
      const { RewardsHistory: RH } = require('./rewardsHistory');
      const other = new RH();
      rh.addEntry('SP1', 100);
      other.addEntry('SP2', 200);
      rh.merge(other);
      expect(rh.size).toBe(2);
    });

    it('does not re-add entries with duplicate epochs', () => {
      const { RewardsHistory: RH } = require('./rewardsHistory');
      const other = new RH();
      const e = rh.addEntry('SP1', 100);
      // Manually inject same epoch into other
      other.entries.push({ ...e });
      rh.merge(other);
      expect(rh.size).toBe(1);
    });

    it('throws when argument is not a RewardsHistory', () => {
      expect(() => rh.merge(null)).toThrow('merge: argument must be a RewardsHistory instance');
    });
  });

  // ─── size getter ─────────────────────────────────────────────────────────

  describe('size', () => {
    it('returns 0 for empty history', () => {
      expect(rh.size).toBe(0);
    });

    it('increments with each addEntry', () => {
      rh.addEntry('SP1', 100);
      rh.addEntry('SP2', 200);
      expect(rh.size).toBe(2);
    });
  });
});
