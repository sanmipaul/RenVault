class RewardSystem {
  constructor() {
    this.rewards = {
      TOP_1: { name: 'Champion', multiplier: 2.0, bonus: 100 },
      TOP_3: { name: 'Elite', multiplier: 1.5, bonus: 50 },
      TOP_10: { name: 'Pro', multiplier: 1.2, bonus: 25 },
      ACTIVE: { name: 'Active', multiplier: 1.1, bonus: 10 }
    };
  }

  calculateReward(rank, points) {
    let reward = this.rewards.ACTIVE;
    
    if (rank === 1) reward = this.rewards.TOP_1;
    else if (rank <= 3) reward = this.rewards.TOP_3;
    else if (rank <= 10) reward = this.rewards.TOP_10;
    
    return {
      tier: reward.name,
      basePoints: points,
      multiplier: reward.multiplier,
      bonus: reward.bonus,
      totalPoints: Math.floor(points * reward.multiplier) + reward.bonus
    };
  }

  getSeasonRewards(leaderboard) {
    return leaderboard.map((user, index) => ({
      address: user.address,
      rank: index + 1,
      reward: this.calculateReward(index + 1, user.points)
    }));
  }
}

module.exports = RewardSystem;