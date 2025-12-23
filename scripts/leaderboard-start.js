const LeaderboardScheduler = require('../leaderboard/scheduler');

const scheduler = new LeaderboardScheduler();

const knownUsers = [
  'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY'
];

knownUsers.forEach(user => scheduler.addUser(user));

console.log('🏆 Starting leaderboard system...');
scheduler.start(300000);

process.on('SIGINT', () => {
  scheduler.stop();
  process.exit(0);
});