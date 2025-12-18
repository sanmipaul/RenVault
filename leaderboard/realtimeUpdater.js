const express = require('express');
const router = express.Router();

let userStats = new Map();

router.post('/update/:address', (req, res) => {
  const { address } = req.params;
  const { amountChange, timestamp } = req.body;
  
  const currentStats = userStats.get(address) || {
    balance: 0,
    points: 0,
    lastActivity: 0,
    totalDeposits: 0,
    totalWithdrawals: 0
  };
  
  // Update stats based on amount change
  if (amountChange > 0) {
    currentStats.totalDeposits += amountChange;
    currentStats.points += 1; // Increment points for deposits
  } else {
    currentStats.totalWithdrawals += Math.abs(amountChange);
  }
  
  currentStats.balance += amountChange;
  currentStats.lastActivity = timestamp;
  
  userStats.set(address, currentStats);
  
  console.log(`🏆 Leaderboard: Updated ${address} with change ${amountChange}`);
  
  res.json({ 
    status: 'updated', 
    user: address,
    newStats: currentStats 
  });
});

router.get('/realtime/:address', (req, res) => {
  const { address } = req.params;
  const stats = userStats.get(address);
  
  if (stats) {
    res.json(stats);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

router.get('/top', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const sortedUsers = Array.from(userStats.entries())
    .map(([address, stats]) => ({ address, ...stats }))
    .sort((a, b) => b.balance - a.balance)
    .slice(0, limit);
  
  res.json(sortedUsers);
});

module.exports = router;