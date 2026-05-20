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

  /**
   * Render a plain-text table for terminal / log output.
   * @param {string} [staker]
   */
  toPrettyTable(staker) {
    const entries = staker
      ? this.history.getByStaker(staker)
      : this.history.getHistory();

    if (entries.length === 0) return '(no reward history)';

    const rows = entries.map(e => ({
      Epoch: String(e.epoch).padStart(6),
      Staker: e.staker.slice(0, 12) + '…',
      Amount: String(e.amount).padStart(12),
      Type: e.type.padEnd(12),
      Date: new Date(e.timestamp).toISOString().slice(0, 10),
    }));
    const cols = Object.keys(rows[0]);
    const header = cols.join(' | ');
    const divider = cols.map(c => '-'.repeat(c.length + 2)).join('-+-');
    const body = rows.map(r => cols.map(c => r[c]).join(' | '));
    return [header, divider, ...body].join('\n');
  }

  /**
   * Filter entries for export by date range and optional type.
   * @param {number} startMs
   * @param {number} [endMs]
   * @param {'distribution'|'claim'|'bonus'} [type]
   */
  filterForExport(startMs, endMs = Date.now(), type) {
    let entries = this.history.getByDateRange(startMs, endMs);
    if (type) entries = entries.filter(e => e.type === type);
    return entries;
  }

  /**
   * Count unique stakers present in a filtered export.
   * @param {number} startMs
   * @param {number} [endMs]
   */
  countUniqueStakersInRange(startMs, endMs = Date.now()) {
    const entries = this.filterForExport(startMs, endMs);
    return new Set(entries.map(e => e.staker)).size;
  }
}

module.exports = { RewardsExporter };
