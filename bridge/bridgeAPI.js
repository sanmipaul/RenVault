// Bridge API Server
const express = require('express');
const { BridgeManager } = require('./bridgeManager');
const { ValidatorNetwork } = require('./validatorNetwork');
const { AdapterFactory } = require('./chainAdapters');

class BridgeAPI {
  constructor(port = 3002) {
    this.app = express();
    this.port = port;
    this.bridge = new BridgeManager();
    this.validators = new ValidatorNetwork();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.get('/api/chains', (req, res) => {
      res.json({ chains: AdapterFactory.getSupportedChains() });
    });

    this.app.post('/api/bridge/initiate', async (req, res) => {
      try {
        const { fromChain, toChain, amount, userAddress } = req.body;
        const txId = await this.bridge.initiateBridge(fromChain, toChain, amount, userAddress);
        res.json({ success: true, txId: txId.toString('hex') });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/bridge/lock', async (req, res) => {
      try {
        const { txId, amount } = req.body;
        const result = await this.bridge.lockAssets(Buffer.from(txId, 'hex'), amount);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/bridge/status/:txId', (req, res) => {
      const txId = Buffer.from(req.params.txId, 'hex');
      const status = this.bridge.getTransactionStatus(txId);
      res.json(status || { error: 'Transaction not found' });
    });

    this.app.get('/api/validators', (req, res) => {
      res.json({ validators: this.validators.getActiveValidators() });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Bridge API server running on port ${this.port}`);
    });
  }
}

module.exports = { BridgeAPI };