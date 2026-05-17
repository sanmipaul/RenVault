// Rewards History — per-staker reward event log
'use strict';

class RewardsHistory {
  constructor() {
    /** @type {Array<{staker:string,amount:number,timestamp:number,epoch:number,type:string}>} */
    this.entries = [];
    this.nextEpoch = 1;
  }
}

module.exports = { RewardsHistory };
