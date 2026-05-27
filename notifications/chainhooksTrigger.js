const express = require('express');
const router = express.Router();

const SUPPORTED_TYPES = new Set(['deposit', 'withdrawal', 'staking_reward', 'liquidity_reward']);
const MAX_QUEUE_SIZE = 1000;

let notificationQueue = [];

router.post('/trigger', (req, res) => {
  const { type, userId, amount, txid } = req.body;

  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(400).json({ error: 'userId must be a non-empty string' });
  }
  if (!type || !SUPPORTED_TYPES.has(type)) {
    return res.status(400).json({ error: `type must be one of: ${[...SUPPORTED_TYPES].join(', ')}` });
  }
  const parsedAmount = parseInt(amount, 10);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive integer' });
  }

  const notification = {
    id: Date.now(),
    type,
    userId,
    amount: parsedAmount,
    txid: txid || null,
    timestamp: Date.now(),
    status: 'pending'
  };

  if (notificationQueue.length >= MAX_QUEUE_SIZE) {
    notificationQueue.shift();
  }
  notificationQueue.push(notification);

  processNotification(notification);

  res.json({
    status: 'triggered',
    notificationId: notification.id
  });
});

function processNotification(notification) {
  const { type, userId, amount } = notification;

  switch (type) {
    case 'deposit':
    case 'withdrawal':
    case 'staking_reward':
    case 'liquidity_reward':
      break;
    default:
      notification.status = 'unsupported';
      return;
  }

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
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
  const recent = notificationQueue
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

  res.json(recent);
});

module.exports = router;