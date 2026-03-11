class LiquidityRewards {
  constructor() {
    this.pools = new Map();
    this.userRewards = new Map();
    this.rewardRate = 0.05; // 5% APY
  }

  addLiquidityProvider(poolId, user, amount) {
    if (!poolId || typeof poolId !== 'string') throw new TypeError('poolId must be a non-empty string');
    if (!user || typeof user !== 'string') throw new TypeError('user must be a non-empty string');
    if (typeof amount !== 'number' || amount <= 0) throw new TypeError('amount must be a positive number');
    const key = `${poolId}-${user}`;
    // Capture a single timestamp so that timeElapsed and the stored lastUpdate
    // are derived from the same instant. Two separate Date.now() calls could
    // yield different values, creating a tiny window of rewards that would
    // be neither banked into pendingRewards nor included in the next window.
    const now = Date.now();
    const current = this.userRewards.get(key) || { amount: 0, lastUpdate: now };

    // Calculate pending rewards
    const timeElapsed = (now - current.lastUpdate) / (1000 * 60 * 60 * 24 * 365);
    const pendingRewards = current.amount * this.rewardRate * timeElapsed;

    this.userRewards.set(key, {
      amount: current.amount + amount,
      pendingRewards: (current.pendingRewards || 0) + pendingRewards,
      lastUpdate: now
    });
  }

  calculateRewards(poolId, user) {
    if (!poolId || typeof poolId !== 'string') throw new TypeError('poolId must be a non-empty string');
    if (!user || typeof user !== 'string') throw new TypeError('user must be a non-empty string');
    const key = `${poolId}-${user}`;
    const position = this.userRewards.get(key);
    if (!position) return 0;

    const timeElapsed = (Date.now() - position.lastUpdate) / (1000 * 60 * 60 * 24 * 365);
    return position.amount * this.rewardRate * timeElapsed + (position.pendingRewards || 0);
  }

  claimRewards(poolId, user) {
    const key = `${poolId}-${user}`;
    const position = this.userRewards.get(key);
    if (!position) return 0;

    const rewards = this.calculateRewards(poolId, user);

    if (rewards > 0) {
      position.pendingRewards = 0;
      position.lastUpdate = Date.now();
      this.userRewards.set(key, position);
    }

    return rewards;
  }

  getPoolStats(poolId) {
    // Use a sentinel-terminated prefix so that querying 'pool1' does not
    // accidentally include entries from 'pool10', 'pool100', etc.
    const prefix = `${poolId}-`;
    const poolRewards = Array.from(this.userRewards.entries())
      .filter(([key]) => key.startsWith(prefix))
      .reduce((total, [, position]) => total + position.amount, 0);
    
    return {
      totalLiquidity: poolRewards,
      apy: this.rewardRate * 100,
      dailyRewards: poolRewards * this.rewardRate / 365
    };
  }
}

module.exports = LiquidityRewards;