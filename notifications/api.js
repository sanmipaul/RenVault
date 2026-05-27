const express = require('express');
const NotificationManager = require('./notificationManager');
const { validateUserId, validateEmail, validateAmount, validateIpAddress, validateEndpoint } = require('./validators');

const app = express();
const notificationManager = new NotificationManager();

app.use(express.json());

app.post('/api/notifications/preferences', (req, res) => {
  const { userId, preferences } = req.body;

  const userIdErr = validateUserId(userId);
  if (userIdErr) return res.status(400).json({ error: userIdErr });

  if (!preferences || typeof preferences !== 'object' || Array.isArray(preferences)) {
    return res.status(400).json({ error: 'preferences must be a plain object' });
  }

  if (preferences.emailEnabled && preferences.email) {
    const emailErr = validateEmail(preferences.email);
    if (emailErr) return res.status(400).json({ error: emailErr });
  }

  try {
    notificationManager.setUserPreferences(userId, preferences);
    res.json({ success: true, message: 'Preferences updated' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/notifications/subscribe-push', (req, res) => {
  const { userId, endpoint, keys } = req.body;

  const userIdErr = validateUserId(userId);
  if (userIdErr) return res.status(400).json({ error: userIdErr });

  const endpointErr = validateEndpoint(endpoint);
  if (endpointErr) return res.status(400).json({ error: endpointErr });

  notificationManager.subscribeToPush(userId, endpoint, keys);
  res.json({ success: true, message: 'Push subscription added' });
});

app.delete('/api/notifications/unsubscribe-push/:userId', (req, res) => {
  const { userId } = req.params;

  const userIdErr = validateUserId(userId);
  if (userIdErr) return res.status(400).json({ error: userIdErr });

  notificationManager.unsubscribeFromPush(userId);
  res.json({ success: true, message: 'Push subscription removed' });
});

app.post('/api/notifications/test-deposit', async (req, res) => {
  const { userId, amount, balance } = req.body;

  const userIdErr = validateUserId(userId);
  if (userIdErr) return res.status(400).json({ error: userIdErr });

  const amountErr = validateAmount(amount);
  if (amountErr) return res.status(400).json({ error: `amount: ${amountErr}` });

  await notificationManager.notifyDeposit(userId, amount, balance);
  res.json({ success: true, message: 'Test deposit notification sent' });
});

app.post('/api/notifications/test-withdrawal', async (req, res) => {
  const { userId, amount, balance } = req.body;

  const userIdErr = validateUserId(userId);
  if (userIdErr) return res.status(400).json({ error: userIdErr });

  const amountErr = validateAmount(amount);
  if (amountErr) return res.status(400).json({ error: `amount: ${amountErr}` });

  await notificationManager.notifyWithdrawal(userId, amount, balance);
  res.json({ success: true, message: 'Test withdrawal notification sent' });
});

app.post('/api/notifications/test-staking-reward', async (req, res) => {
  const { userId, amount, stakedAmount } = req.body;

  const userIdErr = validateUserId(userId);
  if (userIdErr) return res.status(400).json({ error: userIdErr });

  const amountErr = validateAmount(amount);
  if (amountErr) return res.status(400).json({ error: `amount: ${amountErr}` });

  await notificationManager.notifyStakingReward(userId, amount, stakedAmount);
  res.json({ success: true, message: 'Test staking reward notification sent' });
});

app.post('/api/notifications/test-liquidity-reward', async (req, res) => {
  const { userId, amount, poolName } = req.body;

  const userIdErr = validateUserId(userId);
  if (userIdErr) return res.status(400).json({ error: userIdErr });

  const amountErr = validateAmount(amount);
  if (amountErr) return res.status(400).json({ error: `amount: ${amountErr}` });

  if (!poolName || typeof poolName !== 'string' || poolName.trim().length === 0) {
    return res.status(400).json({ error: 'poolName must be a non-empty string' });
  }

  await notificationManager.notifyLiquidityReward(userId, amount, poolName);
  res.json({ success: true, message: 'Test liquidity reward notification sent' });
});

app.post('/api/notifications/test-failed-login', async (req, res) => {
  const { userId, ipAddress, userAgent } = req.body;

  const userIdErr = validateUserId(userId);
  if (userIdErr) return res.status(400).json({ error: userIdErr });

  const ipErr = validateIpAddress(ipAddress);
  if (ipErr) return res.status(400).json({ error: `ipAddress: ${ipErr}` });

  await notificationManager.notifyFailedLogin(userId, ipAddress, userAgent);
  res.json({ success: true, message: 'Test failed login notification sent' });
});

app.post('/api/notifications/test-suspicious-activity', async (req, res) => {
  const { userId, activity, ipAddress } = req.body;

  const userIdErr = validateUserId(userId);
  if (userIdErr) return res.status(400).json({ error: userIdErr });

  if (!activity || typeof activity !== 'string' || activity.trim().length === 0) {
    return res.status(400).json({ error: 'activity must be a non-empty string' });
  }

  const ipErr = validateIpAddress(ipAddress);
  if (ipErr) return res.status(400).json({ error: `ipAddress: ${ipErr}` });

  await notificationManager.notifySuspiciousActivity(userId, activity, ipAddress);
  res.json({ success: true, message: 'Test suspicious activity notification sent' });
});

app.post('/api/notifications/test-2fa-enabled', async (req, res) => {
  const { userId } = req.body;
  
  await notificationManager.notifyTwoFactorEnabled(userId);
  res.json({ success: true, message: 'Test 2FA enabled notification sent' });
});

app.post('/api/notifications/test-2fa-disabled', async (req, res) => {
  const { userId } = req.body;
  
  await notificationManager.notifyTwoFactorDisabled(userId);
  res.json({ success: true, message: 'Test 2FA disabled notification sent' });
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