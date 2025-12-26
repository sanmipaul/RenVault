// Analytics Dashboard Server
const express = require('express');
const { MetricsCollector } = require('./metricsCollector');

class DashboardServer {
  constructor(port = 3001) {
    this.app = express();
    this.port = port;
    this.metrics = new MetricsCollector();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());
    this.app.use(express.static('public'));

    this.app.get('/api/stats', (req, res) => {
      res.json(this.metrics.getStats());
    });

    this.app.get('/api/timeseries', (req, res) => {
      const interval = req.query.interval || 'daily';
      res.json(this.metrics.getTimeSeriesData(interval));
    });

    this.app.post('/api/deposit', (req, res) => {
      const { user, amount } = req.body;
      this.metrics.recordDeposit(user, amount, Date.now());
      res.json({ success: true });
    });

    this.app.post('/api/withdrawal', (req, res) => {
      const { user, amount } = req.body;
      this.metrics.recordWithdrawal(user, amount, Date.now());
      res.json({ success: true });
    });

    this.app.post('/api/wallet-connect', (req, res) => {
      const { user, method, success } = req.body;
      this.metrics.recordWalletConnection(user, method, Date.now(), success);
      res.json({ success: true });
    });

    this.app.post('/api/wallet-error', (req, res) => {
      const { user, method, errorType } = req.body;
      this.metrics.recordWalletError(user, method, errorType, Date.now());
      res.json({ success: true });
    });

    this.app.post('/api/performance', (req, res) => {
      const { operation, duration } = req.body;
      this.metrics.recordPerformanceMetric(operation, duration, Date.now());
      res.json({ success: true });
    });

    this.app.get('/api/wallet-stats', (req, res) => {
      res.json(this.metrics.getWalletStats());
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Analytics dashboard running on port ${this.port}`);
    });
  }
}

module.exports = { DashboardServer };