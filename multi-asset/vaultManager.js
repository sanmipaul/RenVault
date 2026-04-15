// Multi-Asset Vault Manager
const { AssetRegistry } = require('./assetRegistry');
const { AssetValidator } = require('./assetValidator');

class VaultManager {
  constructor(stacksApi) {
    this.stacksApi = stacksApi;
    this.registry = new AssetRegistry();
    this.contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multi-asset-vault';
  }

  async depositAsset(asset, amount, senderKey) {
    if (!AssetValidator.isValidSymbol(asset)) {
      throw new Error(`Invalid asset symbol: "${asset}"`);
    }
    if (!AssetValidator.validateSenderKey(senderKey)) {
      throw new Error('senderKey must be a valid 64-character hex private key');
    }
    const assetInfo = this.registry.getAssetOrThrow(asset);
    AssetValidator.validateDeposit(asset, amount);

    try {
      const functionName = assetInfo.type === 'native' ? 'deposit-stx' : 'deposit-sip010';
      const functionArgs = assetInfo.type === 'native' 
        ? [amount]
        : [assetInfo.contract, amount];

      const result = await this.callContract(functionName, functionArgs, senderKey);
      console.log(`Deposit successful for ${asset}: ${result.txId}`);
      return result;
    } catch (error) {
      console.error(`Deposit failed for ${asset}:`, error.message);
      throw error;
    }
  }

  async withdrawAsset(asset, amount, senderKey) {
    if (!AssetValidator.isValidSymbol(asset)) {
      throw new Error(`Invalid asset symbol: "${asset}"`);
    }
    if (!AssetValidator.validateSenderKey(senderKey)) {
      throw new Error('senderKey must be a valid 64-character hex private key');
    }
    const assetInfo = this.registry.getAssetOrThrow(asset);

    try {
      const functionName = assetInfo.type === 'native' ? 'withdraw-stx' : 'withdraw-sip010';
      const functionArgs = assetInfo.type === 'native'
        ? [amount]
        : [assetInfo.contract, amount];

      const result = await this.callContract(functionName, functionArgs, senderKey);
      console.log(`Withdrawal successful for ${asset}: ${result.txId}`);
      return result;
    } catch (error) {
      console.error(`Withdrawal failed for ${asset}:`, error.message);
      throw error;
    }
  }

  async getBalance(user, asset) {
    const assetInfo = this.registry.getAsset(asset);
    const assetContract = assetInfo.type === 'native' ? 'STX' : assetInfo.contract;
    
    return await this.readContract('get-asset-balance', [user, assetContract]);
  }

  async callContract(functionName, args, senderKey) {
    // Contract call implementation
    return { success: true, txId: 'mock-tx-id' };
  }

  async readContract(functionName, args) {
    // Contract read implementation
    return { success: true, result: 0 };
  }
}

module.exports = { VaultManager };