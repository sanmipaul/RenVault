class LiquidityMining {
  constructor() {
    this.programs = new Map();
    this.userStakes = new Map();
  }

  createProgram(poolId, rewardToken, rewardRate, duration) {
    this.programs.set(poolId, {
      rewardToken,
      rewardRate,
      startTime: Date.now(),
      endTime: Date.now() + duration,
      totalStaked: 0
    });
  }

  stake(poolId, user, amount) {
    const key = `${poolId}-${user}`;
    // Capture a single timestamp so that calculatePending and lastUpdate
    // both use exactly the same moment. Two separate Date.now() calls could
    // yield different values, creating a tiny window of rewards that would
    // never be paid out or banked.
    const now = Date.now();
    const current = this.userStakes.get(key) || { amount: 0, rewardDebt: 0, lastUpdate: now };

    const pending = this.calculatePending(poolId, user);

    this.userStakes.set(key, {
      amount: current.amount + amount,
      rewardDebt: current.rewardDebt + pending,
      lastUpdate: now
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

    // Clamp to zero: if a user stakes after the program has already ended,
    // program.endTime < stake.lastUpdate and the difference would be negative,
    // producing a negative reward that silently reduces the user's payout.
    const timeElapsed = Math.max(0, Math.min(Date.now(), program.endTime) - stake.lastUpdate);
    const userShare = stake.amount / program.totalStaked;
    const rewards = (timeElapsed / 1000) * program.rewardRate * userShare;
    
    return rewards;
  }

  harvest(poolId, user) {
    const pending = this.calculatePending(poolId, user);
    const key = `${poolId}-${user}`;
    const stake = this.userStakes.get(key);

    if (stake) {
      // rewardDebt holds rewards banked during previous stake() calls.
      // It must be included in the payout before being cleared, otherwise
      // every intermediate stake operation permanently forfeits those rewards.
      const totalPayout = pending + stake.rewardDebt;
      stake.rewardDebt = 0;
      stake.lastUpdate = Date.now();
      this.userStakes.set(key, stake);
      return totalPayout;
    }

    return pending;
  }

  getProgramInfo(poolId) {
    return this.programs.get(poolId);
  }
}

module.exports = LiquidityMining;
