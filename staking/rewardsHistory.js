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

  /**
   * Return entries within a timestamp range.
   * @param {number} startMs
   * @param {number} [endMs]
   */
  getByDateRange(startMs, endMs = Date.now()) {
    if (!Number.isFinite(startMs) || startMs < 0) {
      throw new Error('getByDateRange: startMs must be a non-negative number');
    }
    return this.entries
      .filter(e => e.timestamp >= startMs && e.timestamp <= endMs)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Return entries matching a specific event type.
   * @param {'distribution'|'claim'|'bonus'} type
   */
  getByType(type) {
    return this.entries.filter(e => e.type === type);
  }
}

module.exports = { RewardsHistory };
