class BadgeSystem {
  constructor() {
    this.badges = {
      FIRST_DEPOSIT: { name: 'First Saver', description: 'Made first deposit', icon: '🏆' },
      HIGH_ROLLER: { name: 'High Roller', description: '100+ STX deposited', icon: '💎' },
      COMMITMENT_KING: { name: 'Commitment King', description: '50+ commitment points', icon: '👑' },
      EARLY_ADOPTER: { name: 'Early Adopter', description: 'Top 100 users', icon: '🚀' },
      WHALE: { name: 'Whale', description: '1000+ STX balance', icon: '🐋' }
    };
  }

  checkBadges(userData) {
    const earned = [];
    const balance = userData.balance / 1000000; // Convert to STX

    if (userData.points >= 1) {
      earned.push(this.badges.FIRST_DEPOSIT);
    }

    if (balance >= 100) {
      earned.push(this.badges.HIGH_ROLLER);
    }

    if (userData.points >= 50) {
      earned.push(this.badges.COMMITMENT_KING);
    }

    if (balance >= 1000) {
      earned.push(this.badges.WHALE);
    }

    return earned;
  }

  getBadgeProgress(userData) {
    const balance = userData.balance / 1000000;
    
    return {
      highRoller: Math.min((balance / 100) * 100, 100),
      commitmentKing: Math.min((userData.points / 50) * 100, 100),
      whale: Math.min((balance / 1000) * 100, 100)
    };
  }
}

module.exports = BadgeSystem;