const express = require('express');
const app = express();

app.use(express.json());

// Webhook authentication middleware
const authenticateWebhook = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const expectedToken = 'Bearer ' + process.env.WEBHOOK_SECRET;
  
  if (authHeader !== expectedToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Deposit webhook handler
app.post('/webhooks/deposit', authenticateWebhook, (req, res) => {
  const { payload } = req.body;
  
  console.log('💰 Deposit event received:', {
    txid: payload.transaction.txid,
    sender: payload.transaction.tx_sender,
    timestamp: new Date().toISOString()
  });

  // Process deposit event
  processDepositEvent(payload);
  
  res.status(200).json({ status: 'processed' });
});

// Withdrawal webhook handler
app.post('/webhooks/withdraw', authenticateWebhook, (req, res) => {
  const { payload } = req.body;
  
  console.log('💸 Withdrawal event received:', {
    txid: payload.transaction.txid,
    sender: payload.transaction.tx_sender,
    timestamp: new Date().toISOString()
  });

  // Process withdrawal event
  processWithdrawalEvent(payload);
  
  res.status(200).json({ status: 'processed' });
});

function processDepositEvent(payload) {
  // Extract deposit amount and user from transaction
  const { transaction } = payload;
  const contractCall = transaction.tx_result.value;
  
  // Emit to monitoring system
  console.log('📊 Processing deposit for monitoring...');
  
  // Update user stats
  console.log('👤 Updating user statistics...');
  
  // Send notifications
  console.log('🔔 Triggering deposit notifications...');
}

function processWithdrawalEvent(payload) {
  // Extract withdrawal amount and user from transaction
  const { transaction } = payload;
  
  // Emit to monitoring system
  console.log('📊 Processing withdrawal for monitoring...');
  
  // Update user stats
  console.log('👤 Updating user statistics...');
  
  // Send notifications
  console.log('🔔 Triggering withdrawal notifications...');
}

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`🪝 Webhook server running on port ${PORT}`);
});

module.exports = app;