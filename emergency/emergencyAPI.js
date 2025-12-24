// Emergency API Server
const express = require('express');
const { PauseController } = require('./pauseController');

class EmergencyAPI {
  constructor(port = 3006) {
    this.app = express();
    this.port = port;
    this.controller = new PauseController();
    this.setupRoutes();
    this.initializeContacts();
  }

  initializeContacts() {
    this.controller.addEmergencyContact('SP1234...OWNER');
    this.controller.addEmergencyContact('SP5678...ADMIN');
  }

  setupRoutes() {
    this.app.use(express.json());

    this.app.get('/api/emergency/status', (req, res) => {
      const status = this.controller.getPauseStatus();
      res.json(status);
    });

    this.app.post('/api/emergency/pause', (req, res) => {
      try {
        const { reason, pausedBy } = req.body;
        const result = this.controller.emergencyPause(reason, pausedBy);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/emergency/resume', (req, res) => {
      try {
        const { resumedBy } = req.body;
        const result = this.controller.resumeOperations(resumedBy);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.post('/api/emergency/check', (req, res) => {
      const result = this.controller.checkAndPause();
      res.json(result);
    });

    this.app.get('/api/emergency/history', (req, res) => {
      const history = this.controller.getPauseHistory();
      res.json({ history });
    });

    this.app.get('/api/emergency/contacts', (req, res) => {
      const contacts = this.controller.getEmergencyContacts();
      res.json({ contacts });
    });

    this.app.post('/api/emergency/contacts', (req, res) => {
      try {
        const { address } = req.body;
        const result = this.controller.addEmergencyContact(address);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.get('/api/emergency/alerts', (req, res) => {
      const alerts = this.controller.monitor.getAlertHistory();
      res.json({ alerts });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Emergency API server running on port ${this.port}`);
    });

    // Auto-check every 30 seconds
    setInterval(() => {
      this.controller.checkAndPause();
    }, 30000);
  }
}

module.exports = { EmergencyAPI };