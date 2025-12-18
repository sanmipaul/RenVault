const fs = require('fs');
const path = require('path');

class RecoveryManager {
  constructor() {
    this.backupDir = path.join(__dirname, 'backups');
  }

  loadBackup(filename) {
    const filepath = path.join(this.backupDir, filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup file not found: ${filename}`);
    }

    const data = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(data);
  }

  listBackups() {
    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    return fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(this.backupDir, file);
        const stats = fs.statSync(filepath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created);
  }

  validateBackup(backupData) {
    const required = ['exportedAt', 'totalUsers', 'users'];
    
    for (const field of required) {
      if (!backupData[field]) {
        return { valid: false, error: `Missing field: ${field}` };
      }
    }

    if (!Array.isArray(backupData.users)) {
      return { valid: false, error: 'Users must be an array' };
    }

    for (const user of backupData.users) {
      if (!user.address || !user.balance || !user.points) {
        return { valid: false, error: 'Invalid user data structure' };
      }
    }

    return { valid: true };
  }

  generateRecoveryReport(backupData) {
    const validation = this.validateBackup(backupData);
    
    if (!validation.valid) {
      return { error: validation.error };
    }

    const totalBalance = backupData.users.reduce((sum, user) => 
      sum + parseInt(user.balance), 0);
    
    const totalPoints = backupData.users.reduce((sum, user) => 
      sum + parseInt(user.points), 0);

    return {
      exportedAt: backupData.exportedAt,
      totalUsers: backupData.totalUsers,
      totalBalance: totalBalance,
      totalPoints: totalPoints,
      averageBalance: Math.floor(totalBalance / backupData.totalUsers),
      averagePoints: Math.floor(totalPoints / backupData.totalUsers)
    };
  }

  createRecoveryPlan(backupData) {
    const report = this.generateRecoveryReport(backupData);
    
    if (report.error) {
      return { error: report.error };
    }

    return {
      ...report,
      recoverySteps: [
        'Verify contract deployment status',
        'Check current contract state',
        'Compare with backup data',
        'Identify discrepancies',
        'Execute recovery transactions if needed'
      ],
      estimatedTime: `${Math.ceil(backupData.totalUsers / 10)} minutes`
    };
  }
}

module.exports = RecoveryManager;