const fs = require('fs');
const path = require('path');
const { StacksMainnet } = require('@stacks/network');
const { callReadOnlyFunction, standardPrincipalCV } = require('@stacks/transactions');

class DataExporter {
  constructor() {
    this.network = new StacksMainnet();
    this.contractAddress = 'SP3ESR2PWP83R1YM3S4QJRWPDD886KJ4YFS3FKHPY';
    this.contractName = 'ren-vault';
  }

  async exportUserData(userAddress) {
    try {
      const balanceResult = await callReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-balance',
        functionArgs: [standardPrincipalCV(userAddress)],
        network: this.network,
      });

      const pointsResult = await callReadOnlyFunction({
        contractAddress: this.contractAddress,
        contractName: this.contractName,
        functionName: 'get-points',
        functionArgs: [standardPrincipalCV(userAddress)],
        network: this.network,
      });

      return {
        address: userAddress,
        balance: balanceResult.value,
        points: pointsResult.value,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error exporting data for ${userAddress}:`, error);
      return null;
    }
  }

  async exportAllUsers(userAddresses) {
    const userData = [];
    
    for (const address of userAddresses) {
      const data = await this.exportUserData(address);
      if (data) userData.push(data);
    }

    return {
      exportedAt: new Date().toISOString(),
      totalUsers: userData.length,
      users: userData
    };
  }

  saveBackup(data, filename) {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filepath = path.join(backupDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Backup saved: ${filepath}`);
    return filepath;
  }

  async createFullBackup(userAddresses) {
    console.log('📦 Creating full backup...');
    
    const data = await this.exportAllUsers(userAddresses);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `renvault-backup-${timestamp}.json`;
    
    return this.saveBackup(data, filename);
  }
}

module.exports = DataExporter;