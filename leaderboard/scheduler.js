const LeaderboardManager = require('./rankings');

class LeaderboardScheduler {
  constructor() {
    this.leaderboard = new LeaderboardManager();
    this.knownUsers = new Set();
    this.isRunning = false;
  }

  addUser(address) {
    this.knownUsers.add(address);
  }

  async updateAllUsers() {
    console.log(`🔄 Updating ${this.knownUsers.size} users...`);
    
    for (const address of this.knownUsers) {
      try {
        await this.leaderboard.updateUser(address);
      } catch (error) {
        console.error(`Failed to update ${address}:`, error.message);
      }
    }
    
    console.log('✅ Leaderboard updated');
  }

  start(intervalMs = 300000) { // 5 minutes
    this.isRunning = true;
    console.log('🏆 Starting leaderboard scheduler...');
    
    const update = async () => {
      if (this.isRunning) {
        await this.updateAllUsers();
        setTimeout(update, intervalMs);
      }
    };
    
    update();
  }

  stop() {
    this.isRunning = false;
    console.log('⏹️ Leaderboard scheduler stopped');
  }
}

module.exports = LeaderboardScheduler;