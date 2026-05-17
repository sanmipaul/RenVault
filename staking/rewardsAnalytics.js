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
}

module.exports = { RewardsAnalytics };
