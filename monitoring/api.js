const express = require('express');
const { getProtocolMetrics, getUserMetrics } = require('./metrics');
const MetricsLogger = require('./logger');

const app = express();
const logger = new MetricsLogger();

app.use(express.static(__dirname));

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await getProtocolMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:address', async (req, res) => {
  try {
    const metrics = await getUserMetrics(req.params.address);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/logs', (req, res) => {
  const hours = parseInt(req.query.hours) || 24;
  const logs = logger.getRecentLogs(hours);
  res.json(logs);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`📊 Analytics API running on port ${PORT}`);
});

module.exports = app;