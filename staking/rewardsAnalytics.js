// Rewards Analytics — derives metrics from RewardsHistory
'use strict';

const SECONDS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

class RewardsAnalytics {
  /**
   * @param {import('./rewardsHistory').RewardsHistory} history
   */
  constructor(history) {
    if (!history || typeof history.getHistory !== 'function') {
      throw new Error('RewardsAnalytics requires a RewardsHistory instance');
    }
    this.history = history;
  }

  /**
   * Estimate annualised percentage yield for a staker.
   * APY = (totalRewards / principalEstimate) * (SECONDS_PER_YEAR / observationWindow)
   *
   * @param {string} staker
   * @param {number} principal  - staked amount in micro-STX
   * @returns {number} APY as a decimal (e.g. 0.12 = 12 %)
   */
  calculateAPY(staker, principal) {
    if (!Number.isFinite(principal) || principal <= 0) {
      throw new Error('calculateAPY: principal must be a positive finite number');
    }
    const entries = this.history.getByStaker(staker);
    if (entries.length === 0) return 0;

    const totalRewards = entries.reduce((s, e) => s + e.amount, 0);
    const oldest = entries[entries.length - 1].timestamp;
    const window = Date.now() - oldest;
    if (window <= 0) return 0;

    return (totalRewards / principal) * (SECONDS_PER_YEAR / window);
  }

  /**
   * Determine reward trend for a staker over the last N entries.
   * @param {string} staker
   * @param {number} [window=5]
   * @returns {'increasing'|'decreasing'|'stable'|'insufficient_data'}
   */
  getRewardTrend(staker, window = 5) {
    const entries = this.history.getByStaker(staker, window * 2);
    if (entries.length < 2) return 'insufficient_data';

    const recent = entries.slice(0, window).reduce((s, e) => s + e.amount, 0);
    const prior = entries.slice(window).reduce((s, e) => s + e.amount, 0);
    const priorCount = entries.length - window;
    if (priorCount <= 0) return 'insufficient_data';

    const recentAvg = recent / Math.min(window, entries.length);
    const priorAvg = prior / priorCount;
    const delta = recentAvg - priorAvg;
    const threshold = priorAvg * 0.02; // 2% change threshold

    if (delta > threshold) return 'increasing';
    if (delta < -threshold) return 'decreasing';
    return 'stable';
  }

  /**
   * Calculate average time between reward events for a staker (ms).
   * @param {string} staker
   */
  getDistributionFrequency(staker) {
    const entries = this.history.getByStaker(staker);
    if (entries.length < 2) return null;
    const timestamps = entries.map(e => e.timestamp).sort((a, b) => a - b);
    let totalGap = 0;
    for (let i = 1; i < timestamps.length; i++) {
      totalGap += timestamps[i] - timestamps[i - 1];
    }
    return totalGap / (timestamps.length - 1);
  }

  /**
   * Per-staker summary: total, count, average, first/last event timestamps.
   * @param {string} staker
   */
  getStakerMetrics(staker) {
    const entries = this.history.getByStaker(staker);
    if (entries.length === 0) {
      return { staker, total: 0, count: 0, average: 0, firstAt: null, lastAt: null };
    }
    const timestamps = entries.map(e => e.timestamp);
    const total = entries.reduce((s, e) => s + e.amount, 0);
    return {
      staker,
      total,
      count: entries.length,
      average: total / entries.length,
      firstAt: Math.min(...timestamps),
      lastAt: Math.max(...timestamps),
    };
  }

  /**
   * Protocol-wide summary across all stakers and all history.
   */
  getProtocolMetrics() {
    const all = this.history.getHistory();
    const uniqueStakers = this.history.getUniqueStakers().length;
    const total = this.history.getTotalDistributed();
    const count = all.length;
    return {
      totalDistributed: total,
      distributionCount: count,
      uniqueStakers,
      averagePerEvent: count > 0 ? total / count : 0,
      averagePerStaker: uniqueStakers > 0 ? total / uniqueStakers : 0,
    };
  }

  /**
   * Bucket rewards into time slots and return totals per bucket.
   * @param {number} bucketMs  - bucket width in ms (e.g. 86400000 for daily)
   * @param {string} [staker]  - optional: scope to one staker
   * @returns {Array<{bucketStart:number,total:number,count:number}>}
   */
  getTimeSeries(bucketMs, staker) {
    if (!Number.isFinite(bucketMs) || bucketMs <= 0) {
      throw new Error('getTimeSeries: bucketMs must be a positive number');
    }
    const entries = staker
      ? this.history.getByStaker(staker)
      : this.history.getHistory();

    const buckets = new Map();
    for (const e of entries) {
      const key = Math.floor(e.timestamp / bucketMs) * bucketMs;
      const b = buckets.get(key) || { bucketStart: key, total: 0, count: 0 };
      b.total += e.amount;
      b.count += 1;
      buckets.set(key, b);
    }
    return [...buckets.values()].sort((a, b) => a.bucketStart - b.bucketStart);
  }

  /**
   * Return the highest single reward event recorded globally or for one staker.
   * @param {string} [staker]
   */
  getPeakReward(staker) {
    const entries = staker
      ? this.history.getByStaker(staker)
      : this.history.getHistory();
    if (entries.length === 0) return null;
    return entries.reduce((max, e) => (e.amount > max.amount ? e : max), entries[0]);
  }
}

module.exports = { RewardsAnalytics };
