// Timelock API Server
const express = require('express');
const { TimelockScheduler } = require('./timelockScheduler');

class TimelockAPI {
  constructor(port = 3008) {
    this.app = express();
    this.port = port;
    this.scheduler = new TimelockScheduler();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.post('/api/timelock/queue', (req, res) => {
      try {
        const { target, functionName, args, delay } = req.body;
        const result = this.scheduler.scheduleTransaction(target, functionName, args, delay);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/timelock/execute/:txId', (req, res) => {
      try {
        const txId = parseInt(req.params.txId);
        const result = this.scheduler.manager.executeTransaction(txId);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/timelock/cancel/:txId', (req, res) => {
      try {
        const txId = parseInt(req.params.txId);
        const result = this.scheduler.manager.cancelTransaction(txId);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/timelock/transaction/:txId', (req, res) => {
      const txId = parseInt(req.params.txId);
      const transaction = this.scheduler.manager.getTransaction(txId);
      
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json({
        ...transaction,
        timeRemaining: this.scheduler.manager.getTimeRemaining(txId),
        formattedTime: this.scheduler.formatTimeRemaining(txId),
        isReady: this.scheduler.manager.isReady(txId)
      });
    });

    this.app.get('/api/timelock/scheduled', (req, res) => {
      const transactions = this.scheduler.getScheduledTransactions();
      res.json({ transactions });
    });

    this.app.get('/api/timelock/ready', (req, res) => {
      const transactions = this.scheduler.manager.getReadyTransactions();
      res.json({ transactions });
    });

    this.app.get('/api/timelock/history', (req, res) => {
      const history = this.scheduler.getExecutionHistory();
      res.json({ history });
    });

    this.app.get('/api/timelock/status', (req, res) => {
      const status = this.scheduler.getStatus();
      res.json(status);
    });

    this.app.post('/api/timelock/start', (req, res) => {
      this.scheduler.start();
      res.json({ message: 'Timelock scheduler started' });
    });

    this.app.post('/api/timelock/stop', (req, res) => {
      this.scheduler.stop();
      res.json({ message: 'Timelock scheduler stopped' });
    });

    this.app.post('/api/timelock/delays', (req, res) => {
      try {
        const { minDelay, maxDelay } = req.body;
        const result = this.scheduler.manager.setDelays(minDelay, maxDelay);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Timelock API server running on port ${this.port}`);
    });
    
    // Start scheduler
    this.scheduler.start();
  }
}

module.exports = { TimelockAPI };