'use strict';

const { StakingManager } = require('./stakingManager');
const { RewardsHistory } = require('./rewardsHistory');
const { StakingStats } = require('./stakingStats');

function makeStats() {
  const sm = new StakingManager();
  const rh = new RewardsHistory();
  return { sm, rh, ss: new StakingStats(sm, rh) };
}

describe('StakingStats', () => {

  // ─── constructor ──────────────────────────────────────────────────────────

  describe('constructor', () => {
    it('throws when stakingManager is missing', () => {
      const rh = new RewardsHistory();
      expect(() => new StakingStats(null, rh)).toThrow('StakingManager instance');
    });

    it('throws when rewardsHistory is missing', () => {
      const sm = new StakingManager();
      expect(() => new StakingStats(sm, null)).toThrow('RewardsHistory instance');
    });

    it('constructs successfully with valid dependencies', () => {
      const { ss } = makeStats();
      expect(ss).toBeDefined();
    });
  });

  // ─── recordSnapshot / getCurrentTVL ──────────────────────────────────────

  describe('recordSnapshot', () => {
    it('stores a snapshot with tvl and stakers', () => {
      const { sm, ss } = makeStats();
      sm.stake('SP1', 5_000_000);
      const snap = ss.recordSnapshot();
      expect(snap.tvl).toBe(5_000_000);
      expect(snap.stakers).toBe(1);
    });

    it('attaches a timestamp to each snapshot', () => {
      const { ss } = makeStats();
      const before = Date.now();
      const snap = ss.recordSnapshot();
      expect(snap.timestamp).toBeGreaterThanOrEqual(before);
    });
  });

  describe('getCurrentTVL', () => {
    it('returns live TVL when no snapshots exist', () => {
      const { sm, ss } = makeStats();
      sm.stake('SP1', 2_000_000);
      expect(ss.getCurrentTVL()).toBe(2_000_000);
    });

    it('returns the latest snapshot TVL when snapshots exist', () => {
      const { sm, ss } = makeStats();
      sm.stake('SP1', 1_000_000);
      ss.recordSnapshot();
      sm.stake('SP2', 4_000_000);
      // snapshot was before SP2 staked
      expect(ss.getCurrentTVL()).toBe(1_000_000);
    });
  });

  // ─── getHistoricalTVL ────────────────────────────────────────────────────

  describe('getHistoricalTVL', () => {
    it('returns snapshots in ascending time order', () => {
      const { sm, ss } = makeStats();
      sm.stake('SP1', 1_000_000);
      ss.recordSnapshot();
      sm.stake('SP2', 2_000_000);
      ss.recordSnapshot();
      const tvl = ss.getHistoricalTVL();
      expect(tvl[0].tvl).toBeLessThanOrEqual(tvl[1].tvl);
    });
  });

  // ─── getTVLGrowthRate ────────────────────────────────────────────────────

  describe('getTVLGrowthRate', () => {
    it('returns null with fewer than 2 snapshots', () => {
      const { ss } = makeStats();
      expect(ss.getTVLGrowthRate()).toBeNull();
    });

    it('returns positive rate when TVL grew', () => {
      const { sm, ss } = makeStats();
      sm.stake('SP1', 1_000_000);
      ss.recordSnapshot();
      sm.stake('SP2', 1_000_000);
      ss.recordSnapshot();
      expect(ss.getTVLGrowthRate()).toBeGreaterThan(0);
    });
  });

  // ─── getFullReport ────────────────────────────────────────────────────────

  describe('getFullReport', () => {
    it('includes all expected fields', () => {
      const { sm, rh, ss } = makeStats();
      sm.stake('SP1', 1_000_000);
      rh.addEntry('SP1', 500);
      const report = ss.getFullReport();
      expect(report).toHaveProperty('totalStaked');
      expect(report).toHaveProperty('totalRewardsDistributed');
      expect(report).toHaveProperty('uniqueRewardedStakers');
      expect(report).toHaveProperty('reportGeneratedAt');
    });

    it('reflects staked amount correctly', () => {
      const { sm, rh, ss } = makeStats();
      sm.stake('SP1', 3_000_000);
      const report = ss.getFullReport();
      expect(report.totalStaked).toBe(3_000_000);
    });
  });

  // ─── clearSnapshots ───────────────────────────────────────────────────────

  describe('clearSnapshots', () => {
    it('empties the snapshot store', () => {
      const { ss } = makeStats();
      ss.recordSnapshot();
      ss.clearSnapshots();
      expect(ss.getHistoricalTVL().length).toBe(0);
    });
  });

  // ─── comparePeriods ───────────────────────────────────────────────────────

  describe('comparePeriods', () => {
    it('returns zeros when no snapshots fall in either window', () => {
      const { ss } = makeStats();
      const now = Date.now();
      const r = ss.comparePeriods(now - 2000, now - 1000, now + 1000, now + 2000);
      expect(r.windowA).toBe(0);
      expect(r.windowB).toBe(0);
    });

    it('returns positive delta when windowB has higher TVL', () => {
      const { sm, ss } = makeStats();
      const t0 = Date.now();
      sm.stake('SP1', MIN_STAKE);
      ss.recordSnapshot();
      const t1 = Date.now();
      sm.stake('SP2', MIN_STAKE * 3);
      ss.recordSnapshot();
      const t2 = Date.now();
      const r = ss.comparePeriods(t0 - 100, t1, t1, t2 + 100);
      expect(r.delta).toBeGreaterThan(0);
    });

    it('returns null percentChange when windowA avg is zero', () => {
      const { ss } = makeStats();
      const now = Date.now();
      const r = ss.comparePeriods(now - 2000, now - 1000, now + 1000, now + 2000);
      expect(r.percentChange).toBeNull();
    });
  });
});
