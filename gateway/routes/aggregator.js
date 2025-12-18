const express = require('express');
const axios = require('axios');
const router = express.Router();

const services = {
  monitoring: 'http://localhost:3001',
  leaderboard: 'http://localhost:3002',
  notifications: 'http://localhost:3003',
  backup: 'http://localhost:3004'
};

router.get('/dashboard', async (req, res) => {
  try {
    const promises = [
      axios.get(`${services.monitoring}/api/metrics`).catch(() => ({ data: {} })),
      axios.get(`${services.leaderboard}/api/leaderboard?limit=5`).catch(() => ({ data: [] })),
      axios.get(`${services.notifications}/api/stats`).catch(() => ({ data: {} }))
    ];

    const [metrics, leaderboard, notifications] = await Promise.all(promises);

    res.json({
      metrics: metrics.data,
      topUsers: leaderboard.data,
      notifications: notifications.data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to aggregate data' });
  }
});

router.get('/overview', async (req, res) => {
  const overview = {
    services: Object.keys(services).length,
    status: 'operational',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };

  res.json(overview);
});

module.exports = router;