class LiquidityMining {
  constructor() {
    this.programs = new Map();
    this.userStakes = new Map();
  }

  createProgram(poolId, rewardToken, rewardRate, duration) {
    if (!poolId || typeof poolId !== 'string') throw new Error('poolId is required');
    if (!rewardToken || typeof rewardToken !== 'string') throw new Error('rewardToken is required');
    if (typeof rewardRate !== 'number' || rewardRate <= 0) throw new Error('rewardRate must be a positive number');
    if (typeof duration !== 'number' || duration <= 0) throw new Error('duration must be a positive number');
    this.programs.set(poolId, {
      rewardToken,
      rewardRate,
      startTime: Date.now(),
      endTime: Date.now() + duration,
      totalStaked: 0
    });
  }

  stake(poolId, user, amount) {
    if (!poolId || typeof poolId !== 'string') throw new Error('poolId is required');
    if (!user || typeof user !== 'string') throw new Error('user is required');
    if (typeof amount !== 'number' || amount <= 0) throw new Error('amount must be a positive number');
    const key = `${poolId}-${user}`;
    const current = this.userStakes.get(key) || { amount: 0, rewardDebt: 0, lastUpdate: Date.now() };
    
    const pending = this.calculatePending(poolId, user);
    
    this.userStakes.set(key, {
      amount: current.amount + amount,
      rewardDebt: current.rewardDebt + pending,
      lastUpdate: Date.now()
    });

    const program = this.programs.get(poolId);
    if (program) {
      program.totalStaked += amount;
    }
  }

  calculatePending(poolId, user) {
    const key = `${poolId}-${user}`;
    const stake = this.userStakes.get(key);
    const program = this.programs.get(poolId);
    
    if (!stake || !program || program.totalStaked === 0) return 0;

    const timeElapsed = Math.min(Date.now(), program.endTime) - stake.lastUpdate;
    const userShare = stake.amount / program.totalStaked;
    const rewards = (timeElapsed / 1000) * program.rewardRate * userShare;
    
    return rewards;
  }

  harvest(poolId, user) {
    const pending = this.calculatePending(poolId, user);
    const key = `${poolId}-${user}`;
    const stake = this.userStakes.get(key);
    
    if (stake) {
      stake.rewardDebt = 0;
      stake.lastUpdate = Date.now();
      this.userStakes.set(key, stake);
    }
    
    return pending;
  }

  getProgramInfo(poolId) {
    return this.programs.get(poolId);
  }
}

module.exports = LiquidityMining;
