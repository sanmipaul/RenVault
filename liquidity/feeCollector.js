class FeeCollector {
  constructor() {
    this.fees = new Map();
    this.protocolFeeRate = 0.0005; // 0.05% protocol fee
  }

  collectFee(poolId, amount, token) {
    const key = `${poolId}-${token}`;
    const current = this.fees.get(key) || 0;
    this.fees.set(key, current + amount);
    return amount;
  }

  calculateProtocolFee(swapFee) {
    return swapFee * this.protocolFeeRate;
  }

  getTotalFees(poolId, token) {
    const key = `${poolId}-${token}`;
    return this.fees.get(key) || 0;
  }

  withdrawFees(poolId, token, recipient) {
    const key = `${poolId}-${token}`;
    const amount = this.fees.get(key) || 0;
    if (amount > 0) {
      this.fees.set(key, 0);
      return { recipient, amount, token };
    }
    return null;
  }

  getAllPoolFees(poolId) {
    const poolFees = {};
    for (const [key, amount] of this.fees.entries()) {
      if (key.startsWith(poolId)) {
        const token = key.split('-')[1];
        poolFees[token] = amount;
      }
    }
    return poolFees;
  }
}

module.exports = FeeCollector;
