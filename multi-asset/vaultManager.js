// Multi-Asset Vault Manager
const { AssetRegistry } = require('./assetRegistry');

class VaultManager {
  constructor(stacksApi) {
    this.stacksApi = stacksApi;
    this.registry = new AssetRegistry();
    this.contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.multi-asset-vault';
  }

  async depositAsset(asset, amount, senderKey) {
    const assetInfo = this.registry.getAsset(asset);
    if (!assetInfo) throw new Error('Asset not supported');

    const functionName = assetInfo.type === 'native' ? 'deposit-stx' : 'deposit-sip010';
    const functionArgs = assetInfo.type === 'native' 
      ? [amount]
      : [assetInfo.contract, amount];

    return await this.callContract(functionName, functionArgs, senderKey);
  }

  async withdrawAsset(asset, amount, senderKey) {
    const assetInfo = this.registry.getAsset(asset);
    if (!assetInfo) throw new Error('Asset not supported');

    const functionName = assetInfo.type === 'native' ? 'withdraw-stx' : 'withdraw-sip010';
    const functionArgs = assetInfo.type === 'native'
      ? [amount]
      : [assetInfo.contract, amount];

    return await this.callContract(functionName, functionArgs, senderKey);
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