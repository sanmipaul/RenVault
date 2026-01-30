// Asset Validation Utilities
class AssetValidator {
  static validateAmount(amount, decimals = 6) {
    if (amount === undefined || amount === null) return false;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;
    if (numAmount > Number.MAX_SAFE_INTEGER) return false;
    return true;
  }

  static validateAssetContract(contract) {
    if (!contract) return false;
    const contractRegex = /^S[TM][0-9A-Z]{38}\.[a-z0-9-]+$/;
    return contractRegex.test(contract);
  }

  static formatAmount(amount, decimals = 6) {
    if (!this.validateAmount(amount, decimals)) return '0';
    return Math.floor(amount * Math.pow(10, decimals)).toString();
  }

  static parseAmount(amount, decimals = 6) {
    if (!amount) return 0;
    return Number(amount) / Math.pow(10, decimals);
  }

  static validateDeposit(asset, amount, minDeposit = 0) {
    if (!this.validateAmount(amount)) {
      throw new Error('Invalid deposit amount');
    }
    if (amount < minDeposit) {
      throw new Error(`Deposit amount below minimum of ${minDeposit}`);
    }
    return true;
  }

  static validateWithdrawal(asset, amount, balance) {
    if (!this.validateAmount(amount)) {
      throw new Error('Invalid withdrawal amount');
    }
    if (Number(amount) > Number(balance)) {
      throw new Error('Insufficient balance');
    }
    return true;
  }

  static isValidSymbol(symbol) {
    const symbolRegex = /^[A-Z0-9]{2,10}$/;
    return symbolRegex.test(symbol);
  }
}

module.exports = { AssetValidator };