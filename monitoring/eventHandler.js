const express = require('express');
const router = express.Router();

let recentEvents = [];
const MAX_EVENTS = 1000;

router.post('/events', (req, res) => {
  const { type, txid, sender, amount, timestamp } = req.body;
  
  const event = {
    id: Date.now(),
    type,
    txid,
    sender,
    amount: parseInt(amount),
    timestamp,
    processed: Date.now()
  };
  
  recentEvents.unshift(event);
  if (recentEvents.length > MAX_EVENTS) {
    recentEvents = recentEvents.slice(0, MAX_EVENTS);
  }
  
  console.log(`📊 Monitoring: ${type} event processed for ${sender}`);
  
  res.json({ status: 'processed', eventId: event.id });
});

router.get('/events', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const events = recentEvents.slice(0, limit);
  
  res.json({
    events,
    total: recentEvents.length,
    timestamp: Date.now()
  });
});

router.get('/events/stats', (req, res) => {
  const deposits = recentEvents.filter(e => e.type === 'deposit');
  const withdrawals = recentEvents.filter(e => e.type === 'withdrawal');
  
  const stats = {
    totalEvents: recentEvents.length,
    deposits: deposits.length,
    withdrawals: withdrawals.length,
    totalVolume: recentEvents.reduce((sum, e) => sum + e.amount, 0)
  };
  
  res.json(stats);
});

module.exports = router;