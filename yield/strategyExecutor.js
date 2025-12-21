// Strategy Executor
const { YieldOptimizer } = require('./yieldOptimizer');

class StrategyExecutor {
  constructor() {
    this.optimizer = new YieldOptimizer();
    this.activeStrategies = new Map();
    this.executionQueue = [];
  }

  async executeStrategy(userAddress, strategyType, amount) {
    const strategy = {
      id: this.generateId(),
      userAddress,
      strategyType,
      amount,
      status: 'pending',
      timestamp: Date.now()
    };

    this.executionQueue.push(strategy);
    return await this.processStrategy(strategy);
  }

  async processStrategy(strategy) {
    try {
      switch (strategy.strategyType) {
        case 'staking':
          return await this.executeStaking(strategy);
        case 'liquidity':
          return await this.executeLiquidity(strategy);
        case 'lending':
          return await this.executeLending(strategy);
        default:
          throw new Error('Unknown strategy type');
      }
    } catch (error) {
      strategy.status = 'failed';
      strategy.error = error.message;
      return strategy;
    }
  }

  async executeStaking(strategy) {
    // Simulate staking execution
    strategy.status = 'executed';
    strategy.expectedApy = 5.0;
    strategy.executedAt = Date.now();
    
    this.activeStrategies.set(strategy.id, strategy);
    return strategy;
  }

  async executeLiquidity(strategy) {
    // Simulate liquidity provision
    strategy.status = 'executed';
    strategy.expectedApy = 8.0;
    strategy.executedAt = Date.now();
    
    this.activeStrategies.set(strategy.id, strategy);
    return strategy;
  }

  async executeLending(strategy) {
    // Simulate lending execution
    strategy.status = 'executed';
    strategy.expectedApy = 3.0;
    strategy.executedAt = Date.now();
    
    this.activeStrategies.set(strategy.id, strategy);
    return strategy;
  }

  async rebalanceUser(userAddress) {
    const userStrategies = Array.from(this.activeStrategies.values())
      .filter(s => s.userAddress === userAddress);
    
    const totalAmount = userStrategies.reduce((sum, s) => sum + s.amount, 0);
    const currentAllocation = this.calculateCurrentAllocation(userStrategies);
    
    const rebalance = this.optimizer.rebalancePortfolio(userAddress, {
      total: totalAmount,
      riskTolerance: 'medium',
      ...currentAllocation
    });

    if (rebalance.rebalanceNeeded) {
      return await this.executeRebalance(userAddress, rebalance.newAllocation, totalAmount);
    }

    return { rebalanceNeeded: false };
  }

  calculateCurrentAllocation(strategies) {
    const total = strategies.reduce((sum, s) => sum + s.amount, 0);
    const byType = strategies.reduce((acc, s) => {
      acc[s.strategyType] = (acc[s.strategyType] || 0) + s.amount;
      return acc;
    }, {});

    return {
      staking: Math.round((byType.staking || 0) / total * 100),
      liquidity: Math.round((byType.liquidity || 0) / total * 100),
      lending: Math.round((byType.lending || 0) / total * 100)
    };
  }

  async executeRebalance(userAddress, newAllocation, totalAmount) {
    // Simulate rebalancing
    return {
      rebalanced: true,
      newAllocation,
      totalAmount,
      timestamp: Date.now()
    };
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }

  getActiveStrategies(userAddress) {
    return Array.from(this.activeStrategies.values())
      .filter(s => s.userAddress === userAddress);
  }
}

module.exports = { StrategyExecutor };