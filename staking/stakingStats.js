// Staking Stats — snapshot and historical TVL tracking
'use strict';

class StakingStats {
  /**
   * @param {import('./stakingManager').StakingManager} stakingManager
   * @param {import('./rewardsHistory').RewardsHistory} rewardsHistory
   */
  constructor(stakingManager, rewardsHistory) {
    if (!stakingManager || typeof stakingManager.getGlobalStats !== 'function') {
      throw new Error('StakingStats requires a StakingManager instance');
    }
    if (!rewardsHistory || typeof rewardsHistory.getTotalDistributed !== 'function') {
      throw new Error('StakingStats requires a RewardsHistory instance');
    }
    this.sm = stakingManager;
    this.history = rewardsHistory;
    /** @type {Array<{timestamp:number,tvl:number,stakers:number}>} */
    this.tvlSnapshots = [];
  }
}

module.exports = { StakingStats };
