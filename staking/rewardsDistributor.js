// Rewards Distributor
class RewardsDistributor {
  constructor(stakingManager) {
    this.stakingManager = stakingManager;
    this.distributionHistory = [];
    this.isRunning = false;
    this.distributionInterval = 86400000; // 24 hours
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('Rewards distributor started');
    
    this.intervalId = setInterval(() => {
      this.distributeRewards();
    }, this.distributionInterval);
  }

  stop() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    clearInterval(this.intervalId);
    console.log('Rewards distributor stopped');
  }

  async distributeRewards() {
    const stakers = Array.from(this.stakingManager.stakes.keys());
    const distribution = {
      timestamp: Date.now(),
      totalDistributed: 0,
      recipients: 0,
      details: []
    };

    for (const staker of stakers) {
      try {
        const pendingRewards = this.stakingManager.calculateRewards(staker);
        
        if (pendingRewards > 0) {
          const result = this.stakingManager.claimRewards(staker);
          distribution.totalDistributed += result.claimed;
          distribution.recipients += 1;
          distribution.details.push({
            staker,
            amount: result.claimed,
            success: true
          });
        }
      } catch (error) {
        distribution.details.push({
          staker,
          amount: 0,
          success: false,
          error: error.message
        });
      }
    }

    this.distributionHistory.push(distribution);
    
    if (distribution.recipients > 0) {
      console.log(`Distributed ${distribution.totalDistributed} rewards to ${distribution.recipients} stakers`);
    }

    return distribution;
  }

  getDistributionHistory(limit = 50) {
    return this.distributionHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  getDistributionStats() {
    const totalDistributions = this.distributionHistory.length;
    const totalDistributed = this.distributionHistory.reduce((sum, d) => sum + d.totalDistributed, 0);
    const totalRecipients = this.distributionHistory.reduce((sum, d) => sum + d.recipients, 0);
    const averageDistribution = totalDistributions > 0 ? totalDistributed / totalDistributions : 0;

    return {
      totalDistributions,
      totalDistributed,
      totalRecipients,
      averageDistribution,
      lastDistribution: this.distributionHistory.length > 0 
        ? this.distributionHistory[this.distributionHistory.length - 1].timestamp
        : null
    };
  }

  scheduleDistribution(delay = 0) {
    setTimeout(() => {
      this.distributeRewards();
    }, delay);
  }

  setDistributionInterval(milliseconds) {
    this.distributionInterval = milliseconds;
    
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  getNextDistribution() {
    if (!this.isRunning) return null;
    
    const lastDistribution = this.distributionHistory.length > 0
      ? this.distributionHistory[this.distributionHistory.length - 1].timestamp
      : Date.now();
    
    return lastDistribution + this.distributionInterval;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      distributionInterval: this.distributionInterval,
      nextDistribution: this.getNextDistribution(),
      totalDistributions: this.distributionHistory.length,
      stats: this.getDistributionStats()
    };
  }
}

module.exports = { RewardsDistributor };