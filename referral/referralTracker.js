// Referral Tracker
class ReferralTracker {
  constructor() {
    this.events = [];
    this.metrics = {
      totalReferrals: 0,
      totalRewards: 0,
      conversionRate: 0,
      topReferrers: []
    };
  }

  trackReferralRegistration(userAddress, referrerAddress) {
    const event = {
      type: 'REFERRAL_REGISTRATION',
      userAddress,
      referrerAddress,
      timestamp: Date.now(),
      bonus: 50000
    };

    this.events.push(event);
    this.updateMetrics();

    return event;
  }

  trackReferralReward(referrerAddress, commission, transactionAmount) {
    const event = {
      type: 'REFERRAL_REWARD',
      referrerAddress,
      commission,
      transactionAmount,
      timestamp: Date.now()
    };

    this.events.push(event);
    this.updateMetrics();

    return event;
  }

  trackRewardClaim(referrerAddress, amount) {
    const event = {
      type: 'REWARD_CLAIM',
      referrerAddress,
      amount,
      timestamp: Date.now()
    };

    this.events.push(event);
    this.updateMetrics();

    return event;
  }

  updateMetrics() {
    const registrations = this.events.filter(e => e.type === 'REFERRAL_REGISTRATION');
    const rewards = this.events.filter(e => e.type === 'REFERRAL_REWARD');
    const claims = this.events.filter(e => e.type === 'REWARD_CLAIM');

    this.metrics.totalReferrals = registrations.length;
    this.metrics.totalRewards = rewards.reduce((sum, r) => sum + r.commission, 0);
    this.metrics.totalClaimed = claims.reduce((sum, c) => sum + c.amount, 0);

    // Calculate conversion rate (users who made transactions after referral)
    const activeUsers = new Set(rewards.map(r => r.referrerAddress));
    this.metrics.conversionRate = registrations.length > 0 
      ? (activeUsers.size / registrations.length * 100).toFixed(1)
      : 0;

    // Update top referrers
    this.updateTopReferrers();
  }

  updateTopReferrers() {
    const referrerStats = new Map();

    this.events.forEach(event => {
      if (event.type === 'REFERRAL_REGISTRATION') {
        const stats = referrerStats.get(event.referrerAddress) || { count: 0, rewards: 0 };
        stats.count += 1;
        referrerStats.set(event.referrerAddress, stats);
      } else if (event.type === 'REFERRAL_REWARD') {
        const stats = referrerStats.get(event.referrerAddress) || { count: 0, rewards: 0 };
        stats.rewards += event.commission;
        referrerStats.set(event.referrerAddress, stats);
      }
    });

    this.metrics.topReferrers = Array.from(referrerStats.entries())
      .map(([address, stats]) => ({ address, ...stats }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  getMetrics() {
    return { ...this.metrics };
  }

  getEventHistory(limit = 100) {
    return this.events
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getReferrerAnalytics(referrerAddress) {
    const referrerEvents = this.events.filter(e => 
      e.referrerAddress === referrerAddress || e.userAddress === referrerAddress
    );

    const registrations = referrerEvents.filter(e => e.type === 'REFERRAL_REGISTRATION');
    const rewards = referrerEvents.filter(e => e.type === 'REFERRAL_REWARD');
    const claims = referrerEvents.filter(e => e.type === 'REWARD_CLAIM');

    return {
      totalReferrals: registrations.length,
      totalRewards: rewards.reduce((sum, r) => sum + r.commission, 0),
      totalClaimed: claims.reduce((sum, c) => sum + c.amount, 0),
      averageReward: rewards.length > 0 
        ? rewards.reduce((sum, r) => sum + r.commission, 0) / rewards.length 
        : 0,
      lastActivity: referrerEvents.length > 0 
        ? Math.max(...referrerEvents.map(e => e.timestamp))
        : null
    };
  }

  getTimeSeriesData(period = 'daily') {
    const groupedData = new Map();
    
    this.events.forEach(event => {
      const date = new Date(event.timestamp);
      let key;
      
      if (period === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'hourly') {
        key = date.toISOString().split(':')[0];
      }

      if (!groupedData.has(key)) {
        groupedData.set(key, { registrations: 0, rewards: 0, claims: 0 });
      }

      const data = groupedData.get(key);
      if (event.type === 'REFERRAL_REGISTRATION') data.registrations++;
      if (event.type === 'REFERRAL_REWARD') data.rewards += event.commission;
      if (event.type === 'REWARD_CLAIM') data.claims += event.amount;
    });

    return Object.fromEntries(groupedData);
  }
}

module.exports = { ReferralTracker };