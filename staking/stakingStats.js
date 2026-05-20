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

  /** Combine live staking stats with cumulative rewards data. */
  getFullReport() {
    const global = this.sm.getGlobalStats();
    return {
      ...global,
      totalRewardsDistributed: this.history.getTotalDistributed(),
      uniqueRewardedStakers: this.history.getUniqueStakers().length,
      rewardEventCount: this.history.getHistory().length,
      currentTVL: this.getCurrentTVL(),
      tvlGrowthRate: this.getTVLGrowthRate(),
      snapshotCount: this.tvlSnapshots.length,
      reportGeneratedAt: Date.now(),
    };
  }

  /**
   * Staker count over time from TVL snapshots.
   * @returns {Array<{timestamp:number,stakers:number}>}
   */
  getActiveStakersOverTime() {
    return this.getHistoricalTVL().map(s => ({
      timestamp: s.timestamp,
      stakers: s.stakers,
    }));
  }

  /** Clear all stored snapshots. */
  clearSnapshots() {
    this.tvlSnapshots = [];
  }

  /**
   * Compare TVL between two time windows.
   * @param {number} windowAStart
   * @param {number} windowAEnd
   * @param {number} windowBStart
   * @param {number} windowBEnd
   * @returns {{windowA:number, windowB:number, delta:number, percentChange:number|null}}
   */
  comparePeriods(windowAStart, windowAEnd, windowBStart, windowBEnd) {
    function avgTVLInWindow(snaps, start, end) {
      const inWindow = snaps.filter(s => s.timestamp >= start && s.timestamp <= end);
      if (inWindow.length === 0) return 0;
      return inWindow.reduce((s, x) => s + x.tvl, 0) / inWindow.length;
    }
    const snaps = this.getHistoricalTVL();
    const avgA = avgTVLInWindow(snaps, windowAStart, windowAEnd);
    const avgB = avgTVLInWindow(snaps, windowBStart, windowBEnd);
    const delta = avgB - avgA;
    return {
      windowA: avgA,
      windowB: avgB,
      delta,
      percentChange: avgA !== 0 ? (delta / avgA) : null,
    };
  }
}

module.exports = { StakingStats };
