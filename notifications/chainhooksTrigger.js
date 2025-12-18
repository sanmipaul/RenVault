const express = require('express');
const router = express.Router();

let notificationQueue = [];

router.post('/trigger', (req, res) => {
  const { type, userId, amount, txid } = req.body;
  
  const notification = {
    id: Date.now(),
    type,
    userId,
    amount: parseInt(amount),
    txid,
    timestamp: Date.now(),
    status: 'pending'
  };
  
  notificationQueue.push(notification);
  
  // Process notification immediately
  processNotification(notification);
  
  console.log(`🔔 Notification triggered: ${type} for ${userId}`);
  
  res.json({ 
    status: 'triggered', 
    notificationId: notification.id 
  });
});

function processNotification(notification) {
  const { type, userId, amount, txid } = notification;
  
  // Mock notification processing
  switch (type) {
    case 'deposit':
      console.log(`📧 Sending deposit notification to ${userId}: ${amount} STX deposited`);
      break;
    case 'withdrawal':
      console.log(`📧 Sending withdrawal notification to ${userId}: ${amount} STX withdrawn`);
      break;
  }
  
  // Update notification status
  notification.status = 'sent';
  notification.sentAt = Date.now();
}

router.get('/queue', (req, res) => {
  res.json({
    pending: notificationQueue.filter(n => n.status === 'pending').length,
    sent: notificationQueue.filter(n => n.status === 'sent').length,
    total: notificationQueue.length
  });
});

router.get('/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const recent = notificationQueue
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);
  
  res.json(recent);
});

module.exports = router;