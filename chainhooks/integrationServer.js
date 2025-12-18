const express = require('express');
const RealTimeEventProcessor = require('./eventProcessor');
const ChainhooksWebSocketServer = require('./websocketServer');

const app = express();
app.use(express.json());

// Initialize services
const eventProcessor = new RealTimeEventProcessor();
const wsServer = new ChainhooksWebSocketServer();

// Start WebSocket server
wsServer.start();

// Enhanced webhook endpoints with real-time processing
app.post('/webhooks/deposit', (req, res) => {
  const { payload } = req.body;
  
  console.log('💰 Deposit webhook received');
  
  // Process event in real-time
  eventProcessor.processDepositEvent(payload)
    .then(() => {
      // Broadcast to WebSocket clients
      wsServer.broadcast('deposit', {
        txid: payload.transaction.txid,
        sender: payload.transaction.tx_sender,
        timestamp: Date.now()
      });
    })
    .catch(error => {
      console.error('Error processing deposit:', error);
    });
  
  res.status(200).json({ status: 'processed' });
});

app.post('/webhooks/withdraw', (req, res) => {
  const { payload } = req.body;
  
  console.log('💸 Withdrawal webhook received');
  
  // Process event in real-time
  eventProcessor.processWithdrawalEvent(payload)
    .then(() => {
      // Broadcast to WebSocket clients
      wsServer.broadcast('withdrawal', {
        txid: payload.transaction.txid,
        sender: payload.transaction.tx_sender,
        timestamp: Date.now()
      });
    })
    .catch(error => {
      console.error('Error processing withdrawal:', error);
    });
  
  res.status(200).json({ status: 'processed' });
});

// Status endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'running',
    websocket: wsServer.getStats(),
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`🔗 Chainhooks integration server running on port ${PORT}`);
  console.log(`🔌 WebSocket server running on port 3007`);
});

module.exports = app;