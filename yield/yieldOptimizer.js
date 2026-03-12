// Yield Optimizer
class YieldOptimizer {
  constructor() {
    this.strategies = new Map();
    this.userAllocations = new Map();
    this.rewardRates = {
      staking: 0.05,    // 5% APY
      liquidity: 0.08,  // 8% APY
      lending: 0.03     // 3% APY
    };
  }

  addStrategy(name, config) {
    if (!name || typeof name !== 'string') throw new Error('strategy name is required');
    if (!config || typeof config.apy !== 'number' || config.apy < 0) throw new Error('config.apy must be a non-negative number');
    if (typeof config.minAmount !== 'number' || config.minAmount < 0) throw new Error('config.minAmount must be a non-negative number');
    this.strategies.set(name, {
      name,
      apy: config.apy,
      risk: config.risk,
      minAmount: config.minAmount,
      active: true
    });
  }

  optimizeAllocation(userBalance, riskTolerance) {
    if (typeof userBalance !== 'number' || userBalance < 0) throw new Error('userBalance must be a non-negative number');
    if (!riskTolerance || typeof riskTolerance !== 'string') throw new Error('riskTolerance is required');
    const strategies = Array.from(this.strategies.values())
      .filter(s => s.active && userBalance >= s.minAmount)
      .sort((a, b) => b.apy - a.apy);

    if (riskTolerance === 'low') {
      return { staking: 70, liquidity: 20, lending: 10 };
    } else if (riskTolerance === 'medium') {
      return { staking: 50, liquidity: 40, lending: 10 };
    } else {
      return { staking: 30, liquidity: 60, lending: 10 };
    }
  }

  calculateExpectedYield(amount, allocation) {
    if (typeof amount !== 'number' || amount < 0) throw new Error('amount must be a non-negative number');
    if (!allocation || typeof allocation !== 'object') throw new Error('allocation is required');
    const stakingYield = (amount * allocation.staking / 100) * this.rewardRates.staking;
    const liquidityYield = (amount * allocation.liquidity / 100) * this.rewardRates.liquidity;
    const lendingYield = (amount * allocation.lending / 100) * this.rewardRates.lending;
    
    return stakingYield + liquidityYield + lendingYield;
  }

  rebalancePortfolio(userAddress, currentAllocation) {
    const optimal = this.optimizeAllocation(
      currentAllocation.total,
      currentAllocation.riskTolerance
    );
    
    return {
      rebalanceNeeded: this.needsRebalancing(currentAllocation, optimal),
      newAllocation: optimal,
      expectedImprovement: this.calculateImprovement(currentAllocation, optimal)
    };
  }

  needsRebalancing(current, optimal) {
    const threshold = 5; // 5% threshold
    return Math.abs(current.staking - optimal.staking) > threshold ||
           Math.abs(current.liquidity - optimal.liquidity) > threshold ||
           Math.abs(current.lending - optimal.lending) > threshold;
  }

  calculateImprovement(current, optimal) {
    const currentYield = this.calculateExpectedYield(100, current);
    const optimalYield = this.calculateExpectedYield(100, optimal);
    if (currentYield === 0) return '0.00';
    return ((optimalYield - currentYield) / currentYield * 100).toFixed(2);
  }
}

module.exports = { YieldOptimizer };