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
}

module.exports = { RewardsHistory };
