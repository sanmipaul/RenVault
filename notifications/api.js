const express = require('express');
const NotificationManager = require('./notificationManager');

const app = express();
const notificationManager = new NotificationManager();

app.use(express.json());

app.post('/api/notifications/preferences', (req, res) => {
  const { userId, preferences } = req.body;
  
  if (!userId) {
    return res.status(400).json({ error: 'User ID required' });
  }

  notificationManager.setUserPreferences(userId, preferences);
  res.json({ success: true, message: 'Preferences updated' });
});

app.post('/api/notifications/subscribe-push', (req, res) => {
  const { userId, endpoint, keys } = req.body;
  
  if (!userId || !endpoint) {
    return res.status(400).json({ error: 'User ID and endpoint required' });
  }

  notificationManager.subscribeToPush(userId, endpoint, keys);
  res.json({ success: true, message: 'Push subscription added' });
});

app.delete('/api/notifications/unsubscribe-push/:userId', (req, res) => {
  const { userId } = req.params;
  
  notificationManager.unsubscribeFromPush(userId);
  res.json({ success: true, message: 'Push subscription removed' });
});

app.post('/api/notifications/test-deposit', async (req, res) => {
  const { userId, amount, balance } = req.body;
  
  await notificationManager.notifyDeposit(userId, amount, balance);
  res.json({ success: true, message: 'Test deposit notification sent' });
});

app.get('/api/notifications/stats', (req, res) => {
  const stats = notificationManager.getStats();
  res.json(stats);
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`🔔 Notification API running on port ${PORT}`);
});

module.exports = app;