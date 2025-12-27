const WalletManager = require('../frontend/src/services/wallet/WalletManager');
const RecoveryManager = require('../backup/recoveryManager');

class WalletBackupTest {
  constructor() {
    this.walletManager = new WalletManager();
    this.recoveryManager = new RecoveryManager();
  }

  async runTests() {
    console.log('🛡️ Running Wallet Backup Tests...\n');

    try {
      // Test 1: Backup creation
      console.log('Test 1: Backup Creation');
      await this.testBackupCreation();
      console.log('✅ Backup creation test passed\n');

      // Test 2: Backup recovery
      console.log('Test 2: Backup Recovery');
      await this.testBackupRecovery();
      console.log('✅ Backup recovery test passed\n');

      // Test 3: Backup validation
      console.log('Test 3: Backup Validation');
      await this.testBackupValidation();
      console.log('✅ Backup validation test passed\n');

      // Test 4: Secure encryption
      console.log('Test 4: Secure Encryption');
      await this.testSecureEncryption();
      console.log('✅ Secure encryption test passed\n');

      console.log('🎉 All wallet backup tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  async testBackupCreation() {
    // Mock wallet connection
    this.walletManager.connectionState = {
      address: 'ST1234567890123456789012345678901234567890',
      publicKey: '03abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab'
    };

    const password = 'testpassword123';
    const backupData = await this.walletManager.createBackup(password);

    if (!backupData) {
      throw new Error('Backup data not generated');
    }

    const parsed = JSON.parse(backupData);
    if (!parsed.address || !parsed.encryptedMnemonic) {
      throw new Error('Backup data missing required fields');
    }
  }

  async testBackupRecovery() {
    const password = 'testpassword123';
    const backupData = await this.walletManager.createBackup(password);

    // Clear connection state
    this.walletManager.connectionState = null;

    await this.walletManager.recoverFromBackup(backupData, password);

    if (!this.walletManager.connectionState) {
      throw new Error('Wallet not recovered');
    }

    if (this.walletManager.connectionState.address !== 'ST1234567890123456789012345678901234567890') {
      throw new Error('Recovered address does not match');
    }
  }

  async testBackupValidation() {
    const validBackup = {
      address: 'ST1234567890123456789012345678901234567890',
      publicKey: '03abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
      encryptedMnemonic: 'salt:iv:encrypted',
      createdAt: new Date().toISOString(),
      version: '1.0'
    };

    const result = this.recoveryManager.validateWalletBackup(validBackup);
    if (!result.valid) {
      throw new Error('Valid backup not validated');
    }

    const invalidBackup = { address: 'test' };
    const invalidResult = this.recoveryManager.validateWalletBackup(invalidBackup);
    if (invalidResult.valid) {
      throw new Error('Invalid backup incorrectly validated');
    }
  }

  async testSecureEncryption() {
    const testData = 'test mnemonic phrase';
    const password = 'securepassword';

    // Test encryption/decryption
    const encrypted = this.walletManager.encryptData(testData, password);
    const decrypted = this.walletManager.decryptData(encrypted, password);

    if (decrypted !== testData) {
      throw new Error('Encryption/decryption failed');
    }

    // Test wrong password
    try {
      this.walletManager.decryptData(encrypted, 'wrongpassword');
      throw new Error('Decryption with wrong password should fail');
    } catch (error) {
      // Expected to fail
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const test = new WalletBackupTest();
  test.runTests();
}

module.exports = WalletBackupTest;