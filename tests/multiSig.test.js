const WalletManager = require('../frontend/src/services/wallet/WalletManager');
const MultiSigWalletProvider = require('../frontend/src/services/wallet/MultiSigWalletProvider');

class MultiSigTest {
  constructor() {
    this.walletManager = new WalletManager();
  }

  async runTests() {
    console.log('🔐 Running Multi-Signature Tests...\n');

    try {
      // Test 1: Multi-sig setup
      console.log('Test 1: Multi-Sig Setup');
      await this.testMultiSigSetup();
      console.log('✅ Multi-sig setup test passed\n');

      // Test 2: Co-signer management
      console.log('Test 2: Co-Signer Management');
      await this.testCoSignerManagement();
      console.log('✅ Co-signer management test passed\n');

      // Test 3: Transaction signing
      console.log('Test 3: Transaction Signing');
      await this.testTransactionSigning();
      console.log('✅ Transaction signing test passed\n');

      // Test 4: Threshold validation
      console.log('Test 4: Threshold Validation');
      await this.testThresholdValidation();
      console.log('✅ Threshold validation test passed\n');

      console.log('🎉 All multi-signature tests passed!');

    } catch (error) {
      console.error('❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  async testMultiSigSetup() {
    const coSigners = [
      { address: 'ST1234567890123456789012345678901234567891', publicKey: '03abc', name: 'Co-signer 1' },
      { address: 'ST1234567890123456789012345678901234567892', publicKey: '03def', name: 'Co-signer 2' }
    ];

    this.walletManager.setupMultiSigWallet(2, coSigners);

    const config = this.walletManager.getMultiSigConfig();
    if (!config) {
      throw new Error('Multi-sig config not set');
    }

    if (config.threshold !== 2) {
      throw new Error('Threshold not set correctly');
    }

    if (config.coSigners.length !== 2) {
      throw new Error('Co-signers not added correctly');
    }
  }

  async testCoSignerManagement() {
    // Add co-signer
    this.walletManager.addCoSigner({
      address: 'ST1234567890123456789012345678901234567893',
      publicKey: '03ghi',
      name: 'Co-signer 3'
    });

    let config = this.walletManager.getMultiSigConfig();
    if (config.coSigners.length !== 3) {
      throw new Error('Co-signer not added');
    }

    // Remove co-signer
    this.walletManager.removeCoSigner('ST1234567890123456789012345678901234567893');

    config = this.walletManager.getMultiSigConfig();
    if (config.coSigners.length !== 2) {
      throw new Error('Co-signer not removed');
    }
  }

  async testTransactionSigning() {
    const mockTx = { amount: 100, to: 'ST1234567890123456789012345678901234567890' };

    // First signature
    const result1 = await this.walletManager.signTransaction(mockTx);
    if (result1.status !== 'pending') {
      throw new Error('First signature should be pending');
    }

    // Second signature (should complete)
    const result2 = await this.walletManager.signTransaction(mockTx);
    if (result2.status !== 'signed') {
      throw new Error('Second signature should complete transaction');
    }

    if (!result2.multiSigSignatures || result2.multiSigSignatures.length !== 2) {
      throw new Error('Signatures not combined correctly');
    }
  }

  async testThresholdValidation() {
    // Test invalid threshold
    try {
      this.walletManager.setupMultiSigWallet(0, []);
      throw new Error('Should not allow threshold of 0');
    } catch (error) {
      // Expected
    }

    // Test threshold > signers
    try {
      this.walletManager.setupMultiSigWallet(3, [
        { address: 'ST1', publicKey: '03abc', name: 'Co-signer 1' }
      ]);
      throw new Error('Should not allow threshold > total signers');
    } catch (error) {
      // Expected
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const test = new MultiSigTest();
  test.runTests();
}

module.exports = MultiSigTest;