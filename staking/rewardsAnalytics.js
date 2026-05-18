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
}

module.exports = { RewardsAnalytics };
