const DataExporter = require('./dataExporter');

class BackupScheduler {
  constructor() {
    this.exporter = new DataExporter();
    this.isRunning = false;
    this.knownUsers = new Set();
  }

  addUser(address) {
    this.knownUsers.add(address);
  }

  addUsers(addresses) {
    addresses.forEach(addr => this.knownUsers.add(addr));
  }

  async createScheduledBackup() {
    if (this.knownUsers.size === 0) {
      console.log('⚠️ No users to backup');
      return;
    }

    try {
      console.log(`📦 Creating backup for ${this.knownUsers.size} users...`);
      const filepath = await this.exporter.createFullBackup(Array.from(this.knownUsers));
      console.log(`✅ Scheduled backup completed: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('❌ Scheduled backup failed:', error.message);
    }
  }

  start(intervalHours = 24) {
    this.isRunning = true;
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    console.log(`🕐 Starting backup scheduler (every ${intervalHours} hours)...`);
    
    const backup = async () => {
      if (this.isRunning) {
        await this.createScheduledBackup();
        setTimeout(backup, intervalMs);
      }
    };
    
    // Create initial backup
    this.createScheduledBackup();
    
    // Schedule recurring backups
    setTimeout(backup, intervalMs);
  }

  stop() {
    this.isRunning = false;
    console.log('⏹️ Backup scheduler stopped');
  }

  getStatus() {
    return {
      running: this.isRunning,
      userCount: this.knownUsers.size,
      users: Array.from(this.knownUsers)
    };
  }
}

module.exports = BackupScheduler;