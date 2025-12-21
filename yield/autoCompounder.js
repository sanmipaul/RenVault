// Auto-Compounder for Yield Reinvestment
class AutoCompounder {
  constructor() {
    this.compoundingSchedule = new Map();
    this.compoundFrequency = 86400000; // 24 hours
  }

  enableAutoCompound(userAddress, strategyId) {
    this.compoundingSchedule.set(userAddress, {
      strategyId,
      enabled: true,
      lastCompound: Date.now(),
      totalCompounded: 0
    });
    
    return { success: true, message: 'Auto-compounding enabled' };
  }

  disableAutoCompound(userAddress) {
    const schedule = this.compoundingSchedule.get(userAddress);
    if (schedule) {
      schedule.enabled = false;
    }
    return { success: true, message: 'Auto-compounding disabled' };
  }

  async compound(userAddress, rewards) {
    const schedule = this.compoundingSchedule.get(userAddress);
    if (!schedule || !schedule.enabled) {
      return { compounded: false, reason: 'Auto-compound not enabled' };
    }

    const timeSinceLastCompound = Date.now() - schedule.lastCompound;
    if (timeSinceLastCompound < this.compoundFrequency) {
      return { compounded: false, reason: 'Too soon to compound' };
    }

    // Simulate compounding
    const compoundAmount = this.calculateCompoundAmount(rewards);
    schedule.lastCompound = Date.now();
    schedule.totalCompounded += compoundAmount;

    return {
      compounded: true,
      amount: compoundAmount,
      totalCompounded: schedule.totalCompounded,
      nextCompound: Date.now() + this.compoundFrequency
    };
  }

  calculateCompoundAmount(rewards) {
    // Simple compound calculation
    return rewards * 1.01; // 1% bonus for compounding
  }

  getCompoundingStatus(userAddress) {
    return this.compoundingSchedule.get(userAddress) || { enabled: false };
  }

  async runCompoundingCycle() {
    const results = [];
    
    for (const [userAddress, schedule] of this.compoundingSchedule.entries()) {
      if (schedule.enabled) {
        const mockRewards = Math.random() * 1000;
        const result = await this.compound(userAddress, mockRewards);
        results.push({ userAddress, ...result });
      }
    }

    return results;
  }

  setCompoundFrequency(hours) {
    this.compoundFrequency = hours * 3600000;
  }
}

module.exports = { AutoCompounder };