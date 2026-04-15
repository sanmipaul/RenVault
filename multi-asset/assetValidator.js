// Asset Validation Utilities
class AssetValidator {
  static validateAmount(amount, decimals = 6) {
    if (amount === undefined || amount === null) return false;
    if (typeof amount === 'boolean') return false;
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) return false;
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
    if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) {
      throw new Error('decimals must be an integer between 0 and 18');
    }
    return Math.floor(Number(amount) * Math.pow(10, decimals)).toString();
  }

  static parseAmount(amount, decimals = 6) {
    if (!amount) return 0;
    return Number(amount) / Math.pow(10, decimals);
  }

  static validateDeposit(asset, amount, minDeposit = 0) {
    if (!this.validateAmount(amount)) {
      throw new Error('Invalid deposit amount');
    }
    if (!Number.isFinite(minDeposit) || minDeposit < 0) {
      throw new Error('minDeposit must be a non-negative finite number');
    }
    if (Number(amount) < minDeposit) {
      throw new Error(`Deposit amount below minimum of ${minDeposit}`);
    }
    return true;
  }

  static validateWithdrawal(asset, amount, balance) {
    if (!this.validateAmount(amount)) {
      throw new Error('Invalid withdrawal amount');
    }
    const numAmount = Number(amount);
    const numBalance = Number(balance);
    if (!Number.isFinite(numBalance) || numBalance < 0) {
      throw new Error('balance must be a non-negative finite number');
    }
    if (numAmount > numBalance) {
      throw new Error('Insufficient balance');
    }
    return true;
  }

  static isValidSymbol(symbol) {
    const symbolRegex = /^[A-Z0-9]{2,10}$/;
    return symbolRegex.test(symbol);
  }

  static validateSenderKey(key) {
    if (key === undefined || key === null) return false;
    if (typeof key !== 'string') return false;
    if (key.trim().length === 0) return false;
    // Stacks private keys are 64 hex chars (optionally with 01 compression suffix = 66)
    const hexKey = /^[0-9a-fA-F]{64}([0-9a-fA-F]{2})?$/.test(key);
    return hexKey;
  }

  static validateStacksAddress(address) {
    if (!address || typeof address !== 'string') return false;
    // C32-encoded Stacks addresses start with SP or ST and are 41 chars
    const addressRegex = /^S[TP][0-9A-Z]{38}$/;
    return addressRegex.test(address);
  }
}

module.exports = { AssetValidator };