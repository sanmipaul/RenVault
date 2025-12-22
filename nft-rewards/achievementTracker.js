// Achievement Tracker
class AchievementTracker {
  constructor() {
    this.achievements = new Map();
    this.userProgress = new Map();
    this.setupAchievements();
  }

  setupAchievements() {
    this.achievements.set('first-deposit', {
      name: 'First Steps',
      description: 'Make your first deposit',
      requirements: { deposits: 1 },
      rarity: 'common',
      points: 10
    });

    this.achievements.set('whale', {
      name: 'Whale Status',
      description: 'Deposit over 100 STX',
      requirements: { totalAmount: 100000000 },
      rarity: 'rare',
      points: 100
    });

    this.achievements.set('diamond-hands', {
      name: 'Diamond Hands',
      description: 'Reach 100 commitment points',
      requirements: { commitment: 100 },
      rarity: 'epic',
      points: 250
    });

    this.achievements.set('early-adopter', {
      name: 'Early Adopter',
      description: 'Join in the first 1000 users',
      requirements: { userRank: 1000 },
      rarity: 'legendary',
      points: 500
    });
  }

  trackUserActivity(userAddress, activity) {
    const progress = this.getUserProgress(userAddress);
    
    switch (activity.type) {
      case 'deposit':
        progress.deposits += 1;
        progress.totalAmount += activity.amount;
        break;
      case 'commitment':
        progress.commitment = activity.points;
        break;
      case 'registration':
        progress.userRank = activity.rank;
        break;
    }

    this.userProgress.set(userAddress, progress);
    return this.checkAchievements(userAddress);
  }

  getUserProgress(userAddress) {
    return this.userProgress.get(userAddress) || {
      deposits: 0,
      totalAmount: 0,
      commitment: 0,
      userRank: 0,
      achievements: []
    };
  }

  checkAchievements(userAddress) {
    const progress = this.getUserProgress(userAddress);
    const newAchievements = [];

    for (const [id, achievement] of this.achievements.entries()) {
      if (!progress.achievements.includes(id)) {
        if (this.meetsRequirements(progress, achievement.requirements)) {
          progress.achievements.push(id);
          newAchievements.push({ id, ...achievement });
        }
      }
    }

    if (newAchievements.length > 0) {
      this.userProgress.set(userAddress, progress);
    }

    return newAchievements;
  }

  meetsRequirements(progress, requirements) {
    return Object.entries(requirements).every(([key, value]) => {
      return progress[key] >= value;
    });
  }

  getUserAchievements(userAddress) {
    const progress = this.getUserProgress(userAddress);
    return progress.achievements.map(id => ({
      id,
      ...this.achievements.get(id)
    }));
  }

  getAchievementStats() {
    const stats = {};
    for (const [id, achievement] of this.achievements.entries()) {
      const holders = Array.from(this.userProgress.values())
        .filter(p => p.achievements.includes(id)).length;
      stats[id] = { ...achievement, holders };
    }
    return stats;
  }
}

module.exports = { AchievementTracker };