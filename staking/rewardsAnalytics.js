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
}

module.exports = { RewardsAnalytics };
