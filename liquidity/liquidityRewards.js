class LiquidityRewards {
  constructor() {
    this.pools = new Map();
    this.userRewards = new Map();
    this.rewardRate = 0.05; // 5% APY
  }

  addLiquidityProvider(poolId, user, amount) {
    const key = `${poolId}-${user}`;
    const current = this.userRewards.get(key) || { amount: 0, lastUpdate: Date.now() };
    
    // Calculate pending rewards
    const timeElapsed = (Date.now() - current.lastUpdate) / (1000 * 60 * 60 * 24 * 365);
    const pendingRewards = current.amount * this.rewardRate * timeElapsed;
    
    this.userRewards.set(key, {
      amount: current.amount + amount,
      pendingRewards: (current.pendingRewards || 0) + pendingRewards,
      lastUpdate: Date.now()
    });
  }

  calculateRewards(poolId, user) {
    const key = `${poolId}-${user}`;
    const position = this.userRewards.get(key);
    if (!position) return 0;

    const timeElapsed = (Date.now() - position.lastUpdate) / (1000 * 60 * 60 * 24 * 365);
    return position.amount * this.rewardRate * timeElapsed + (position.pendingRewards || 0);
  }

  claimRewards(poolId, user) {
    const key = `${poolId}-${user}`;
    const rewards = this.calculateRewards(poolId, user);
    
    if (rewards > 0) {
      const position = this.userRewards.get(key);
      position.pendingRewards = 0;
      position.lastUpdate = Date.now();
      this.userRewards.set(key, position);
    }
    
    return rewards;
  }

  getPoolStats(poolId) {
    const poolRewards = Array.from(this.userRewards.entries())
      .filter(([key]) => key.startsWith(poolId))
      .reduce((total, [, position]) => total + position.amount, 0);
    
    return {
      totalLiquidity: poolRewards,
      apy: this.rewardRate * 100,
      dailyRewards: poolRewards * this.rewardRate / 365
    };
  }
}

module.exports = LiquidityRewards;