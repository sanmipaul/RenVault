// Referral Manager
class ReferralManager {
  constructor() {
    this.referrals = new Map(); // user -> referrer
    this.referralCounts = new Map(); // referrer -> count
    this.referralRewards = new Map(); // referrer -> total rewards
    this.userRewards = new Map(); // user -> earned rewards
    this.settings = {
      referralBonus: 50000, // 0.05 STX
      referrerCommission: 5, // 5%
      maxCommission: 20 // 20% max
    };
  }

  generateReferralCode(userAddress) {
    return userAddress.slice(-8).toUpperCase();
  }

  registerReferral(userAddress, referrerAddress) {
    if (userAddress === referrerAddress) {
      throw new Error('Cannot refer yourself');
    }

    if (this.referrals.has(userAddress)) {
      throw new Error('User already has a referrer');
    }

    this.referrals.set(userAddress, referrerAddress);
    
    // Update referrer count
    const currentCount = this.referralCounts.get(referrerAddress) || 0;
    this.referralCounts.set(referrerAddress, currentCount + 1);

    // Give bonus to new user
    this.userRewards.set(userAddress, this.settings.referralBonus);

    return {
      success: true,
      referrer: referrerAddress,
      bonus: this.settings.referralBonus,
      referralCode: this.generateReferralCode(userAddress)
    };
  }

  processReferralReward(userAddress, transactionAmount) {
    const referrer = this.referrals.get(userAddress);
    if (!referrer) return { commission: 0 };

    const commission = Math.floor((transactionAmount * this.settings.referrerCommission) / 100);
    
    const currentRewards = this.referralRewards.get(referrer) || 0;
    this.referralRewards.set(referrer, currentRewards + commission);

    return {
      commission,
      referrer,
      totalRewards: currentRewards + commission
    };
  }

  claimRewards(referrerAddress) {
    const rewards = this.referralRewards.get(referrerAddress) || 0;
    if (rewards === 0) {
      throw new Error('No rewards to claim');
    }

    this.referralRewards.delete(referrerAddress);
    
    return {
      success: true,
      amount: rewards,
      claimedAt: Date.now()
    };
  }

  getReferralStats(userAddress) {
    const referrer = this.referrals.get(userAddress);
    const referralCount = this.referralCounts.get(userAddress) || 0;
    const totalRewards = this.referralRewards.get(userAddress) || 0;
    const userBonus = this.userRewards.get(userAddress) || 0;

    return {
      referrer,
      referralCount,
      totalRewards,
      userBonus,
      referralCode: this.generateReferralCode(userAddress)
    };
  }

  getLeaderboard(limit = 10) {
    return Array.from(this.referralCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([address, count]) => ({
        address,
        referralCount: count,
        totalRewards: this.referralRewards.get(address) || 0,
        referralCode: this.generateReferralCode(address)
      }));
  }

  updateSettings(newSettings) {
    if (newSettings.referralBonus !== undefined) {
      this.settings.referralBonus = newSettings.referralBonus;
    }
    
    if (newSettings.referrerCommission !== undefined) {
      if (newSettings.referrerCommission > this.settings.maxCommission) {
        throw new Error(`Commission cannot exceed ${this.settings.maxCommission}%`);
      }
      this.settings.referrerCommission = newSettings.referrerCommission;
    }

    return this.settings;
  }

  getSettings() {
    return { ...this.settings };
  }

  validateReferralCode(code) {
    // Simple validation - check if code matches any user's last 8 characters
    for (const [userAddress] of this.referrals.entries()) {
      if (this.generateReferralCode(userAddress) === code.toUpperCase()) {
        return userAddress;
      }
    }
    return null;
  }
}

module.exports = { ReferralManager };