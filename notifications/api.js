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

app.post('/api/notifications/test-vault-created', async (req, res) => {
  const { userId, vaultId, vaultType } = req.body;
  
  await notificationManager.notifyVaultCreated(userId, vaultId, vaultType);
  res.json({ success: true, message: 'Test vault created notification sent' });
});

app.post('/api/notifications/test-vault-updated', async (req, res) => {
  const { userId, vaultId, changes } = req.body;
  
  await notificationManager.notifyVaultUpdated(userId, vaultId, changes);
  res.json({ success: true, message: 'Test vault updated notification sent' });
});

app.post('/api/notifications/test-rewards', async (req, res) => {
  const { userId, vaultId, amount } = req.body;
  
  await notificationManager.notifyRewardsDistributed(userId, vaultId, amount);
  res.json({ success: true, message: 'Test rewards notification sent' });
});

app.post('/api/notifications/test-maturity', async (req, res) => {
  const { userId, vaultId, daysRemaining } = req.body;
  
  await notificationManager.notifyVaultMaturity(userId, vaultId, daysRemaining);
  res.json({ success: true, message: 'Test maturity notification sent' });
});

app.post('/api/notifications/test-price-alert', async (req, res) => {
  const { userId, asset, price, change } = req.body;
  
  await notificationManager.notifyPriceAlert(userId, asset, price, change);
  res.json({ success: true, message: 'Test price alert notification sent' });
});

app.post('/api/notifications/test-large-transaction', async (req, res) => {
  const { userId, amount, type } = req.body;
  
  await notificationManager.notifyLargeTransaction(userId, amount, type);
  res.json({ success: true, message: 'Test large transaction notification sent' });
});

app.post('/api/notifications/test-multisig', async (req, res) => {
  const { userId, requestId, action } = req.body;
  
  await notificationManager.notifyMultisigRequest(userId, requestId, action);
  res.json({ success: true, message: 'Test multisig notification sent' });
});

app.post('/api/notifications/test-session-expiration', async (req, res) => {
  const { userId, minutesRemaining } = req.body;
  
  await notificationManager.notifySessionExpiration(userId, minutesRemaining);
  res.json({ success: true, message: 'Test session expiration notification sent' });
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