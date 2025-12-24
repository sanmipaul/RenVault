// Staking Manager
class StakingManager {
  constructor() {
    this.stakes = new Map(); // user -> stake amount
    this.stakeTimestamps = new Map(); // user -> stake timestamp
    this.rewards = new Map(); // user -> accumulated rewards
    this.totalStaked = 0;
    this.rewardRate = 0.01; // 1% per epoch
    this.minStake = 1000000; // 1 STX
    this.lockPeriod = 86400000; // 24 hours in milliseconds
  }

  stake(userAddress, amount) {
    if (amount < this.minStake) {
      throw new Error(`Minimum stake is ${this.minStake / 1000000} STX`);
    }

    const currentStake = this.stakes.get(userAddress) || 0;
    const newStake = currentStake + amount;

    this.stakes.set(userAddress, newStake);
    this.stakeTimestamps.set(userAddress, Date.now());
    this.totalStaked += amount;

    return {
      success: true,
      newStake,
      totalStaked: this.totalStaked,
      lockUntil: Date.now() + this.lockPeriod
    };
  }

  unstake(userAddress, amount) {
    const currentStake = this.stakes.get(userAddress) || 0;
    const stakeTime = this.stakeTimestamps.get(userAddress) || 0;

    if (currentStake < amount) {
      throw new Error('Insufficient staked balance');
    }

    if (Date.now() - stakeTime < this.lockPeriod) {
      throw new Error('Stake is still locked');
    }

    const newStake = currentStake - amount;
    this.stakes.set(userAddress, newStake);
    this.totalStaked -= amount;

    if (newStake === 0) {
      this.stakes.delete(userAddress);
      this.stakeTimestamps.delete(userAddress);
    }

    return {
      success: true,
      unstaked: amount,
      remainingStake: newStake,
      totalStaked: this.totalStaked
    };
  }

  calculateRewards(userAddress) {
    const stake = this.stakes.get(userAddress) || 0;
    const stakeTime = this.stakeTimestamps.get(userAddress) || Date.now();

    if (stake === 0) return 0;

    const stakingDuration = Date.now() - stakeTime;
    const epochs = Math.floor(stakingDuration / this.lockPeriod);
    const rewards = (stake * this.rewardRate * epochs) / 100;

    return Math.floor(rewards);
  }

  claimRewards(userAddress) {
    const pendingRewards = this.calculateRewards(userAddress);
    
    if (pendingRewards === 0) {
      throw new Error('No rewards to claim');
    }

    const currentRewards = this.rewards.get(userAddress) || 0;
    this.rewards.set(userAddress, currentRewards + pendingRewards);
    this.stakeTimestamps.set(userAddress, Date.now()); // Reset reward calculation

    return {
      success: true,
      claimed: pendingRewards,
      totalRewards: currentRewards + pendingRewards
    };
  }

  getStakeInfo(userAddress) {
    const stake = this.stakes.get(userAddress) || 0;
    const stakeTime = this.stakeTimestamps.get(userAddress) || 0;
    const rewards = this.rewards.get(userAddress) || 0;
    const pendingRewards = this.calculateRewards(userAddress);

    return {
      stake,
      rewards,
      pendingRewards,
      stakeTime,
      lockUntil: stakeTime + this.lockPeriod,
      isLocked: Date.now() - stakeTime < this.lockPeriod
    };
  }

  getGlobalStats() {
    const totalUsers = this.stakes.size;
    const averageStake = totalUsers > 0 ? this.totalStaked / totalUsers : 0;
    const totalRewards = Array.from(this.rewards.values()).reduce((sum, r) => sum + r, 0);

    return {
      totalStaked: this.totalStaked,
      totalUsers,
      averageStake,
      totalRewards,
      rewardRate: this.rewardRate,
      minStake: this.minStake,
      lockPeriod: this.lockPeriod
    };
  }

  getTopStakers(limit = 10) {
    return Array.from(this.stakes.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([address, stake]) => ({
        address,
        stake,
        rewards: this.rewards.get(address) || 0,
        pendingRewards: this.calculateRewards(address)
      }));
  }

  updateRewardRate(newRate) {
    if (newRate < 0 || newRate > 0.2) { // Max 20%
      throw new Error('Invalid reward rate');
    }
    this.rewardRate = newRate;
    return this.rewardRate;
  }

  updateMinStake(newMinStake) {
    this.minStake = newMinStake;
    return this.minStake;
  }
}

module.exports = { StakingManager };