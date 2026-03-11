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
    try {
      return JSON.parse(data);
    } catch (err) {
      throw new Error(`Backup file "${filename}" contains invalid JSON: ${err.message}`);
    }
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
      if (backupData[field] === undefined || backupData[field] === null) {
        return { valid: false, error: `Missing field: ${field}` };
      }
    }

    if (!Array.isArray(backupData.users)) {
      return { valid: false, error: 'Users must be an array' };
    }

    for (const user of backupData.users) {
      if (!user.address) {
        return { valid: false, error: 'Invalid user data structure: missing address' };
      }
      if (user.balance === undefined || user.balance === null) {
        return { valid: false, error: 'Invalid user data structure: missing balance' };
      }
      if (user.points === undefined || user.points === null) {
        return { valid: false, error: 'Invalid user data structure: missing points' };
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
      sum + parseInt(user.balance, 10), 0);

    const totalPoints = backupData.users.reduce((sum, user) =>
      sum + parseInt(user.points, 10), 0);

    return {
      exportedAt: backupData.exportedAt,
      totalUsers: backupData.users.length,
      totalBalance: totalBalance,
      totalPoints: totalPoints,
      averageBalance: backupData.users.length > 0
        ? Math.floor(totalBalance / backupData.users.length) : 0,
      averagePoints: backupData.users.length > 0
        ? Math.floor(totalPoints / backupData.users.length) : 0
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

  // Wallet Backup and Recovery Methods
  validateWalletBackup(backupData) {
    const required = ['address', 'publicKey', 'encryptedMnemonic', 'createdAt', 'version'];
    
    for (const field of required) {
      if (backupData[field] === undefined || backupData[field] === null) {
        return { valid: false, error: `Missing field: ${field}` };
      }
    }

    if (backupData.version !== '1.0') {
      return { valid: false, error: 'Unsupported backup version' };
    }

    return { valid: true };
  }

  generateWalletRecoveryReport(backupData) {
    const validation = this.validateWalletBackup(backupData);
    
    if (!validation.valid) {
      return { error: validation.error };
    }

    return {
      address: backupData.address,
      publicKey: backupData.publicKey,
      createdAt: backupData.createdAt,
      version: backupData.version,
      recoverySteps: [
        'Decrypt backup with password',
        'Verify mnemonic integrity',
        'Restore wallet connection',
        'Validate address and public key'
      ]
    };
  }
}

module.exports = RecoveryManager;