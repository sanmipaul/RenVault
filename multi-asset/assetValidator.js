// Asset Validation Utilities
class AssetValidator {
  static validateAmount(amount, decimals = 6) {
    if (!amount || amount <= 0) return false;
    if (amount > Number.MAX_SAFE_INTEGER) return false;
    return true;
  }

  static validateAssetContract(contract) {
    const contractRegex = /^S[TM][0-9A-Z]{38}\.[a-z0-9-]+$/;
    return contractRegex.test(contract);
  }

  static formatAmount(amount, decimals = 6) {
    return Math.floor(amount * Math.pow(10, decimals));
  }

  static parseAmount(amount, decimals = 6) {
    return amount / Math.pow(10, decimals);
  }

  static validateDeposit(asset, amount) {
    if (!this.validateAmount(amount)) {
      throw new Error('Invalid deposit amount');
    }
    return true;
  }

  static validateWithdrawal(asset, amount, balance) {
    if (!this.validateAmount(amount)) {
      throw new Error('Invalid withdrawal amount');
    }
    if (amount > balance) {
      throw new Error('Insufficient balance');
    }
    return true;
  }
}

module.exports = { AssetValidator };