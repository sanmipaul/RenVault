// Rewards History — per-staker reward event log
'use strict';

class RewardsHistory {
  constructor() {
    /** @type {Array<{staker:string,amount:number,timestamp:number,epoch:number,type:string}>} */
    this.entries = [];
    this.nextEpoch = 1;
  }

  /**
   * Record a reward event for a staker.
   * @param {string} staker
   * @param {number} amount  - micro-STX awarded
   * @param {'distribution'|'claim'|'bonus'} type
   */
  addEntry(staker, amount, type = 'distribution') {
    if (!staker || typeof staker !== 'string') {
      throw new Error('addEntry: staker must be a non-empty string');
    }
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error('addEntry: amount must be a non-negative finite number');
    }
    if (!['distribution', 'claim', 'bonus'].includes(type)) {
      throw new Error(`addEntry: unknown type "${type}"`);
    }
    const entry = {
      staker,
      amount,
      timestamp: Date.now(),
      epoch: this.nextEpoch++,
      type,
    };
    this.entries.push(entry);
    return entry;
  }

  /**
   * Return all entries, newest first.
   * @param {number} [limit]
   */
  getHistory(limit) {
    const sorted = [...this.entries].sort((a, b) => b.timestamp - a.timestamp);
    return limit !== undefined ? sorted.slice(0, limit) : sorted;
  }

  /**
   * Return entries for a specific staker, newest first.
   * @param {string} staker
   * @param {number} [limit]
   */
  getByStaker(staker, limit) {
    const filtered = this.entries
      .filter(e => e.staker === staker)
      .sort((a, b) => b.timestamp - a.timestamp);
    return limit !== undefined ? filtered.slice(0, limit) : filtered;
  }
}

module.exports = { RewardsHistory };
