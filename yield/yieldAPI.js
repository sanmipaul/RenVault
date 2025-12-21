// Yield API Server
const express = require('express');
const { StrategyExecutor } = require('./strategyExecutor');
const { YieldOptimizer } = require('./yieldOptimizer');

class YieldAPI {
  constructor(port = 3003) {
    this.app = express();
    this.port = port;
    this.executor = new StrategyExecutor();
    this.optimizer = new YieldOptimizer();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.get('/api/strategies', (req, res) => {
      res.json({
        available: ['staking', 'liquidity', 'lending'],
        rates: { staking: '5%', liquidity: '8%', lending: '3%' }
      });
    });

    this.app.post('/api/yield/stake', async (req, res) => {
      try {
        const { userAddress, amount, strategyType } = req.body;
        const result = await this.executor.executeStrategy(userAddress, strategyType, amount);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/yield/optimize/:userAddress', (req, res) => {
      const { userAddress } = req.params;
      const { balance, riskTolerance } = req.query;
      
      const allocation = this.optimizer.optimizeAllocation(
        parseInt(balance), 
        riskTolerance || 'medium'
      );
      
      res.json({ allocation, expectedYield: this.optimizer.calculateExpectedYield(balance, allocation) });
    });

    this.app.post('/api/yield/rebalance', async (req, res) => {
      try {
        const { userAddress } = req.body;
        const result = await this.executor.rebalanceUser(userAddress);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/yield/portfolio/:userAddress', (req, res) => {
      const { userAddress } = req.params;
      const strategies = this.executor.getActiveStrategies(userAddress);
      res.json({ strategies, totalValue: strategies.reduce((sum, s) => sum + s.amount, 0) });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Yield API server running on port ${this.port}`);
    });
  }
}

module.exports = { YieldAPI };