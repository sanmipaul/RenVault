const WebSocket = require('ws');
const http = require('http');

class ChainhooksWebSocketServer {
  constructor(port = process.env.WS_PORT || 3007, host = process.env.WS_HOST || '0.0.0.0') {
    this.port = Number(port);
    this.host = host;
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });
    this.clients = new Map();
  }

  start() {
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);
      
      console.log(`📡 WebSocket client connected: ${clientId}`);
      
      ws.send(JSON.stringify({
        type: 'connection',
        clientId,
        message: 'Connected to RenVault real-time events'
      }));

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(clientId, data);
        } catch (error) {
          console.error('Invalid message from client:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`📡 WebSocket client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });

    this.server.listen(this.port, this.host, () => {
      console.log(`🔌 WebSocket server running on ${this.host}:${this.port}`);
    });
  }

  handleClientMessage(clientId, data) {
    switch (data.type) {
      case 'subscribe':
        this.subscribeClient(clientId, data.events);
        break;
      case 'unsubscribe':
        this.unsubscribeClient(clientId, data.events);
        break;
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: Date.now() });
        break;
    }
  }

  subscribeClient(clientId, events) {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions = events || ['deposit', 'withdrawal'];
      this.sendToClient(clientId, {
        type: 'subscribed',
        events: client.subscriptions
      });
    }
  }

  unsubscribeClient(clientId, events) {
    const client = this.clients.get(clientId);
    if (client && client.subscriptions) {
      client.subscriptions = client.subscriptions.filter(e => !events.includes(e));
      this.sendToClient(clientId, {
        type: 'unsubscribed',
        events: events
      });
    }
  }

  broadcast(eventType, data) {
    const message = JSON.stringify({
      type: 'event',
      eventType,
      data,
      timestamp: Date.now()
    });

    this.clients.forEach((client, clientId) => {
      if (client.readyState === WebSocket.OPEN) {
        const subscriptions = client.subscriptions || ['deposit', 'withdrawal'];
        if (subscriptions.includes(eventType)) {
          client.send(message);
        }
      }
    });
  }

  sendToClient(clientId, data) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  generateClientId() {
    return 'client_' + Math.random().toString(36).substr(2, 9);
  }

  getStats() {
    return {
      connectedClients: this.clients.size,
      port: this.port
    };
  }
}

module.exports = ChainhooksWebSocketServer;