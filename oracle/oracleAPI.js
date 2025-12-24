// Oracle API Server
const express = require('express');
const { OracleUpdater } = require('./oracleUpdater');

class OracleAPI {
  constructor(port = 3007) {
    this.app = express();
    this.port = port;
    this.updater = new OracleUpdater();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.get('/api/oracle/prices', (req, res) => {
      const prices = this.updater.aggregator.getAllPrices();
      res.json({ prices });
    });

    this.app.get('/api/oracle/price/:symbol', (req, res) => {
      const price = this.updater.aggregator.getPrice(req.params.symbol.toUpperCase());
      if (!price) return res.status(404).json({ error: 'Price not found' });
      res.json({ symbol: req.params.symbol, ...price });
    });

    this.app.post('/api/oracle/update', async (req, res) => {
      try {
        const result = await this.updater.updatePrices();
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.get('/api/oracle/status', (req, res) => {
      const status = this.updater.getStatus();
      res.json(status);
    });

    this.app.post('/api/oracle/start', (req, res) => {
      this.updater.start();
      res.json({ message: 'Oracle updater started' });
    });

    this.app.post('/api/oracle/stop', (req, res) => {
      this.updater.stop();
      res.json({ message: 'Oracle updater stopped' });
    });

    this.app.post('/api/oracle/interval', (req, res) => {
      const { interval } = req.body;
      if (!interval || interval < 10000) {
        return res.status(400).json({ error: 'Interval must be at least 10 seconds' });
      }
      this.updater.setUpdateInterval(interval);
      res.json({ message: 'Update interval changed', interval });
    });

    this.app.post('/api/oracle/symbols', (req, res) => {
      const { symbol } = req.body;
      this.updater.addSymbol(symbol.toUpperCase());
      res.json({ message: 'Symbol added', symbol });
    });

    this.app.get('/api/oracle/health', (req, res) => {
      const prices = this.updater.aggregator.getAllPrices();
      const staleCount = Object.entries(prices).filter(([symbol, data]) => 
        this.updater.aggregator.isStale(symbol)
      ).length;

      res.json({
        healthy: staleCount === 0,
        totalPrices: Object.keys(prices).length,
        stalePrices: staleCount,
        uptime: this.updater.isRunning
      });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Oracle API server running on port ${this.port}`);
    });
    
    // Start price updates
    this.updater.start();
  }
}

module.exports = { OracleAPI };