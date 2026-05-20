// Rewards Exporter — serialises RewardsHistory to various formats
'use strict';

class RewardsExporter {
  /**
   * @param {import('./rewardsHistory').RewardsHistory} history
   */
  constructor(history) {
    if (!history || typeof history.getHistory !== 'function') {
      throw new Error('RewardsExporter requires a RewardsHistory instance');
    }
    this.history = history;
  }
}

module.exports = { RewardsExporter };
