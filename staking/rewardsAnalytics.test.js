'use strict';

const { RewardsHistory } = require('./rewardsHistory');
const { RewardsAnalytics } = require('./rewardsAnalytics');

function makeAnalytics() {
  const rh = new RewardsHistory();
  return { rh, ra: new RewardsAnalytics(rh) };
}

describe('RewardsAnalytics', () => {

  describe('constructor', () => {
    it('throws when not given a RewardsHistory', () => {
      expect(() => new RewardsAnalytics(null)).toThrow('RewardsHistory instance');
    });

    it('throws when given a plain object missing getHistory', () => {
      expect(() => new RewardsAnalytics({})).toThrow('RewardsHistory instance');
    });
  });

  // ─── calculateAPY ─────────────────────────────────────────────────────────

  describe('calculateAPY', () => {
    it('returns 0 when staker has no history', () => {
      const { ra } = makeAnalytics();
      expect(ra.calculateAPY('SP_NOBODY', 1_000_000)).toBe(0);
    });

    it('throws for non-positive principal', () => {
      const { ra } = makeAnalytics();
      expect(() => ra.calculateAPY('SP1', 0)).toThrow('principal must be a positive finite number');
    });

    it('returns a positive APY when rewards exist', () => {
      const { rh, ra } = makeAnalytics();
      // Simulate 10% of principal awarded 1 year ago
      const entry = rh.addEntry('SP1', 100_000);
      // Back-date the entry timestamp to 1 year ago
      entry.timestamp = Date.now() - 365.25 * 24 * 60 * 60 * 1000;
      const apy = ra.calculateAPY('SP1', 1_000_000);
      expect(apy).toBeCloseTo(0.1, 1);
    });
  });

  // ─── getRewardTrend ───────────────────────────────────────────────────────

  describe('getRewardTrend', () => {
    it('returns "insufficient_data" for fewer than 2 entries', () => {
      const { rh, ra } = makeAnalytics();
      rh.addEntry('SP1', 100);
      expect(ra.getRewardTrend('SP1')).toBe('insufficient_data');
    });

    it('returns "increasing" when recent rewards are significantly higher', () => {
      const { rh, ra } = makeAnalytics();
      // 5 low entries then 5 high entries (getByStaker returns newest first)
      for (let i = 0; i < 5; i++) rh.addEntry('SP1', 1000); // recent (will be first)
      for (let i = 0; i < 5; i++) rh.addEntry('SP1', 10);   // older
      expect(ra.getRewardTrend('SP1', 5)).toBe('increasing');
    });

    it('returns "decreasing" when recent rewards are significantly lower', () => {
      const { rh, ra } = makeAnalytics();
      for (let i = 0; i < 5; i++) rh.addEntry('SP1', 10);   // recent (first)
      for (let i = 0; i < 5; i++) rh.addEntry('SP1', 1000); // older
      expect(ra.getRewardTrend('SP1', 5)).toBe('decreasing');
    });

    it('returns "stable" when amounts are equal', () => {
      const { rh, ra } = makeAnalytics();
      for (let i = 0; i < 10; i++) rh.addEntry('SP1', 100);
      expect(ra.getRewardTrend('SP1', 5)).toBe('stable');
    });
  });

  // ─── getDistributionFrequency ─────────────────────────────────────────────

  describe('getDistributionFrequency', () => {
    it('returns null for fewer than 2 entries', () => {
      const { rh, ra } = makeAnalytics();
      rh.addEntry('SP1', 100);
      expect(ra.getDistributionFrequency('SP1')).toBeNull();
    });

    it('returns the average gap between events', () => {
      const { rh, ra } = makeAnalytics();
      const e1 = rh.addEntry('SP1', 100);
      const e2 = rh.addEntry('SP1', 100);
      e1.timestamp = 1000;
      e2.timestamp = 3000;
      expect(ra.getDistributionFrequency('SP1')).toBe(2000);
    });
  });

  // ─── getStakerMetrics ─────────────────────────────────────────────────────

  describe('getStakerMetrics', () => {
    it('returns zeroed metrics for unknown staker', () => {
      const { ra } = makeAnalytics();
      const m = ra.getStakerMetrics('NOBODY');
      expect(m.total).toBe(0);
      expect(m.count).toBe(0);
    });

    it('computes total, count, and average', () => {
      const { rh, ra } = makeAnalytics();
      rh.addEntry('SP1', 200);
      rh.addEntry('SP1', 400);
      const m = ra.getStakerMetrics('SP1');
      expect(m.total).toBe(600);
      expect(m.count).toBe(2);
      expect(m.average).toBe(300);
    });
  });

  // ─── getProtocolMetrics ───────────────────────────────────────────────────

  describe('getProtocolMetrics', () => {
    it('returns zeros for empty history', () => {
      const { ra } = makeAnalytics();
      const p = ra.getProtocolMetrics();
      expect(p.totalDistributed).toBe(0);
      expect(p.uniqueStakers).toBe(0);
    });

    it('aggregates across all stakers', () => {
      const { rh, ra } = makeAnalytics();
      rh.addEntry('SP1', 100);
      rh.addEntry('SP2', 200);
      const p = ra.getProtocolMetrics();
      expect(p.totalDistributed).toBe(300);
      expect(p.uniqueStakers).toBe(2);
    });
  });

  // ─── getTimeSeries ────────────────────────────────────────────────────────

  describe('getTimeSeries', () => {
    it('throws for invalid bucketMs', () => {
      const { ra } = makeAnalytics();
      expect(() => ra.getTimeSeries(0)).toThrow('bucketMs must be a positive number');
    });

    it('buckets events correctly', () => {
      const { rh, ra } = makeAnalytics();
      const e1 = rh.addEntry('SP1', 100);
      const e2 = rh.addEntry('SP1', 200);
      e1.timestamp = 1000;
      e2.timestamp = 1500;
      const series = ra.getTimeSeries(2000);
      expect(series.length).toBe(1);
      expect(series[0].total).toBe(300);
    });
  });

  // ─── getPeakReward ────────────────────────────────────────────────────────

  describe('getPeakReward', () => {
    it('returns null for empty history', () => {
      const { ra } = makeAnalytics();
      expect(ra.getPeakReward()).toBeNull();
    });

    it('returns the entry with the highest amount', () => {
      const { rh, ra } = makeAnalytics();
      rh.addEntry('SP1', 100);
      rh.addEntry('SP2', 9999);
      rh.addEntry('SP3', 50);
      const peak = ra.getPeakReward();
      expect(peak.amount).toBe(9999);
      expect(peak.staker).toBe('SP2');
    });
  });
});
