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

  /**
   * Export entries as a CSV string.
   * @param {string} [staker]  optional filter
   */
  toCSV(staker) {
    const entries = staker
      ? this.history.getByStaker(staker)
      : this.history.getHistory();

    const header = 'epoch,staker,amount,type,timestamp,date';
    const rows = entries.map(e => {
      const date = new Date(e.timestamp).toISOString();
      return `${e.epoch},${e.staker},${e.amount},${e.type},${e.timestamp},${date}`;
    });
    return [header, ...rows].join('\n');
  }

  /**
   * Export entries as a JSON string.
   * @param {string} [staker]
   * @param {boolean} [pretty=false]
   */
  toJSON(staker, pretty = false) {
    const entries = staker
      ? this.history.getByStaker(staker)
      : this.history.getHistory();
    return pretty
      ? JSON.stringify(entries, null, 2)
      : JSON.stringify(entries);
  }
}

module.exports = { RewardsExporter };
