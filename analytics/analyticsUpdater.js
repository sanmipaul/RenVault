// Real-time Analytics Updater
const WebSocket = require('ws');
const { DataProcessor } = require('./dataProcessor');
const { MetricsCollector } = require('./metricsCollector');

class AnalyticsUpdater {
  constructor() {
    this.metrics = new MetricsCollector();
    this.processor = new DataProcessor(this.metrics);
    this.clients = new Set();
  }

  startWebSocketServer(port = 8080) {
    const wss = new WebSocket.Server({ port });
    
    wss.on('connection', (ws) => {
      this.clients.add(ws);
      ws.send(JSON.stringify({ type: 'stats', data: this.metrics.getStats() }));
      
      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });

    console.log(`Analytics WebSocket server running on port ${port}`);
  }

  processBlockchainEvent(event) {
    this.processor.processEvent(event);
    this.broadcastUpdate();
  }

  broadcastUpdate() {
    const stats = this.metrics.getStats();
    const message = JSON.stringify({ type: 'update', data: stats });
    
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  simulateEvents() {
    setInterval(() => {
      const mockEvent = {
        type: 'deposit',
        data: { user: 'SP1234...', amount: Math.floor(Math.random() * 1000000) },
        timestamp: Date.now()
      };
      this.processBlockchainEvent(mockEvent);
    }, 5000);
  }
}

module.exports = { AnalyticsUpdater };