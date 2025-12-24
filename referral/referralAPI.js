// Referral API Server
const express = require('express');
const { ReferralManager } = require('./referralManager');
const { ReferralTracker } = require('./referralTracker');

class ReferralAPI {
  constructor(port = 3009) {
    this.app = express();
    this.port = port;
    this.manager = new ReferralManager();
    this.tracker = new ReferralTracker();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.post('/api/referral/register', (req, res) => {
      try {
        const { userAddress, referrerAddress } = req.body;
        const result = this.manager.registerReferral(userAddress, referrerAddress);
        this.tracker.trackReferralRegistration(userAddress, referrerAddress);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/referral/register-code', (req, res) => {
      try {
        const { userAddress, referralCode } = req.body;
        const referrerAddress = this.manager.validateReferralCode(referralCode);
        
        if (!referrerAddress) {
          return res.status(400).json({ error: 'Invalid referral code' });
        }

        const result = this.manager.registerReferral(userAddress, referrerAddress);
        this.tracker.trackReferralRegistration(userAddress, referrerAddress);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/referral/reward', (req, res) => {
      try {
        const { userAddress, transactionAmount } = req.body;
        const result = this.manager.processReferralReward(userAddress, transactionAmount);
        
        if (result.commission > 0) {
          this.tracker.trackReferralReward(result.referrer, result.commission, transactionAmount);
        }
        
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/referral/claim', (req, res) => {
      try {
        const { referrerAddress } = req.body;
        const result = this.manager.claimRewards(referrerAddress);
        this.tracker.trackRewardClaim(referrerAddress, result.amount);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/referral/stats/:userAddress', (req, res) => {
      const stats = this.manager.getReferralStats(req.params.userAddress);
      const analytics = this.tracker.getReferrerAnalytics(req.params.userAddress);
      res.json({ ...stats, analytics });
    });

    this.app.get('/api/referral/leaderboard', (req, res) => {
      const limit = parseInt(req.query.limit) || 10;
      const leaderboard = this.manager.getLeaderboard(limit);
      res.json({ leaderboard });
    });

    this.app.get('/api/referral/metrics', (req, res) => {
      const metrics = this.tracker.getMetrics();
      res.json(metrics);
    });

    this.app.get('/api/referral/history', (req, res) => {
      const limit = parseInt(req.query.limit) || 100;
      const history = this.tracker.getEventHistory(limit);
      res.json({ history });
    });

    this.app.get('/api/referral/timeseries', (req, res) => {
      const period = req.query.period || 'daily';
      const data = this.tracker.getTimeSeriesData(period);
      res.json({ data, period });
    });

    this.app.get('/api/referral/settings', (req, res) => {
      const settings = this.manager.getSettings();
      res.json(settings);
    });

    this.app.post('/api/referral/settings', (req, res) => {
      try {
        const settings = this.manager.updateSettings(req.body);
        res.json(settings);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/referral/validate/:code', (req, res) => {
      const referrerAddress = this.manager.validateReferralCode(req.params.code);
      res.json({ 
        valid: !!referrerAddress, 
        referrerAddress: referrerAddress || null 
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Referral API server running on port ${this.port}`);
    });
  }
}

module.exports = { ReferralAPI };