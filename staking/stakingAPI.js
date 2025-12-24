// Staking API Server
const express = require('express');
const { StakingManager } = require('./stakingManager');
const { RewardsDistributor } = require('./rewardsDistributor');

class StakingAPI {
  constructor(port = 3010) {
    this.app = express();
    this.port = port;
    this.stakingManager = new StakingManager();
    this.rewardsDistributor = new RewardsDistributor(this.stakingManager);
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.post('/api/staking/stake', (req, res) => {
      try {
        const { userAddress, amount } = req.body;
        const result = this.stakingManager.stake(userAddress, amount);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/staking/unstake', (req, res) => {
      try {
        const { userAddress, amount } = req.body;
        const result = this.stakingManager.unstake(userAddress, amount);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/staking/claim', (req, res) => {
      try {
        const { userAddress } = req.body;
        const result = this.stakingManager.claimRewards(userAddress);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/staking/info/:userAddress', (req, res) => {
      const info = this.stakingManager.getStakeInfo(req.params.userAddress);
      res.json(info);
    });

    this.app.get('/api/staking/stats', (req, res) => {
      const stats = this.stakingManager.getGlobalStats();
      res.json(stats);
    });

    this.app.get('/api/staking/leaderboard', (req, res) => {
      const limit = parseInt(req.query.limit) || 10;
      const leaderboard = this.stakingManager.getTopStakers(limit);
      res.json({ leaderboard });
    });

    this.app.get('/api/staking/rewards/history', (req, res) => {
      const limit = parseInt(req.query.limit) || 50;
      const history = this.rewardsDistributor.getDistributionHistory(limit);
      res.json({ history });
    });

    this.app.get('/api/staking/rewards/stats', (req, res) => {
      const stats = this.rewardsDistributor.getDistributionStats();
      res.json(stats);
    });

    this.app.post('/api/staking/rewards/distribute', async (req, res) => {
      try {
        const result = await this.rewardsDistributor.distributeRewards();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/staking/rewards/status', (req, res) => {
      const status = this.rewardsDistributor.getStatus();
      res.json(status);
    });

    this.app.post('/api/staking/rewards/start', (req, res) => {
      this.rewardsDistributor.start();
      res.json({ message: 'Rewards distributor started' });
    });

    this.app.post('/api/staking/rewards/stop', (req, res) => {
      this.rewardsDistributor.stop();
      res.json({ message: 'Rewards distributor stopped' });
    });

    this.app.post('/api/staking/settings/reward-rate', (req, res) => {
      try {
        const { rate } = req.body;
        const newRate = this.stakingManager.updateRewardRate(rate);
        res.json({ rewardRate: newRate });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/staking/settings/min-stake', (req, res) => {
      try {
        const { amount } = req.body;
        const newMinStake = this.stakingManager.updateMinStake(amount);
        res.json({ minStake: newMinStake });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Staking API server running on port ${this.port}`);
    });
    
    // Start rewards distributor
    this.rewardsDistributor.start();
  }
}

module.exports = { StakingAPI };