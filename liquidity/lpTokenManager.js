class LPTokenManager {
  constructor() {
    this.tokens = new Map();
    this.balances = new Map();
  }

  mint(poolId, user, amount) {
    const key = `${poolId}-${user}`;
    const current = this.balances.get(key) || 0;
    this.balances.set(key, current + amount);
    
    const poolData = this.tokens.get(poolId) || { totalSupply: 0 };
    poolData.totalSupply += amount;
    this.tokens.set(poolId, poolData);
    
    return amount;
  }

  burn(poolId, user, amount) {
    const key = `${poolId}-${user}`;
    const current = this.balances.get(key) || 0;
    if (current < amount) throw new Error('Insufficient LP tokens');
    
    this.balances.set(key, current - amount);
    
    const poolData = this.tokens.get(poolId);
    if (poolData) {
      poolData.totalSupply -= amount;
      this.tokens.set(poolId, poolData);
    }
    
    return amount;
  }

  balanceOf(poolId, user) {
    const key = `${poolId}-${user}`;
    return this.balances.get(key) || 0;
  }

  totalSupply(poolId) {
    const poolData = this.tokens.get(poolId);
    return poolData ? poolData.totalSupply : 0;
  }

  getShare(poolId, user) {
    const balance = this.balanceOf(poolId, user);
    const total = this.totalSupply(poolId);
    return total > 0 ? (balance / total) * 100 : 0;
  }
}

module.exports = LPTokenManager;
