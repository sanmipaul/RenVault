const express = require('express');
const LeaderboardManager = require('./rankings');
const BadgeSystem = require('./badges');

const app = express();
const leaderboard = new LeaderboardManager();
const badges = new BadgeSystem();

app.use(express.static(__dirname));

app.get('/api/leaderboard', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const topUsers = leaderboard.getTopUsers(limit);
  
  const enrichedUsers = topUsers.map(user => ({
    ...user,
    badges: badges.checkBadges(user),
    progress: badges.getBadgeProgress(user)
  }));
  
  res.json(enrichedUsers);
});

app.get('/api/user/:address/rank', async (req, res) => {
  await leaderboard.updateUser(req.params.address);
  const rank = leaderboard.getUserRank(req.params.address);
  const userData = leaderboard.users.get(req.params.address);
  
  if (userData) {
    res.json({
      rank,
      ...userData,
      badges: badges.checkBadges(userData),
      progress: badges.getBadgeProgress(userData)
    });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/update/:address', async (req, res) => {
  const userData = await leaderboard.updateUser(req.params.address);
  if (userData) {
    res.json(userData);
  } else {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🏆 Leaderboard API running on port ${PORT}`);
});

module.exports = app;