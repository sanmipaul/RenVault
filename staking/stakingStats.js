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

  /** Take a TVL snapshot and store it. */
  recordSnapshot() {
    const { totalStaked, totalUsers } = this.sm.getGlobalStats();
    const snap = { timestamp: Date.now(), tvl: totalStaked, stakers: totalUsers };
    this.tvlSnapshots.push(snap);
    return snap;
  }

  /** Latest recorded TVL, or live value if no snapshots exist. */
  getCurrentTVL() {
    if (this.tvlSnapshots.length === 0) return this.sm.getGlobalStats().totalStaked;
    return this.tvlSnapshots[this.tvlSnapshots.length - 1].tvl;
  }

  /** All TVL snapshots in ascending time order. */
  getHistoricalTVL() {
    return [...this.tvlSnapshots].sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * TVL change between first and last snapshot as a decimal.
   * Returns null when fewer than two snapshots exist.
   */
  getTVLGrowthRate() {
    if (this.tvlSnapshots.length < 2) return null;
    const sorted = this.getHistoricalTVL();
    const first = sorted[0].tvl;
    if (first === 0) return null;
    return (sorted[sorted.length - 1].tvl - first) / first;
  }
}

module.exports = { StakingStats };
