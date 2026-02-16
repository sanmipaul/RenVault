class PriceOracle {
  constructor() {
    this.prices = new Map();
    this.updateInterval = 60000; // 1 minute
  }

  setPrice(token, price) {
    if (!token || typeof token !== 'string') {
      throw new Error('token identifier is required');
    }
    if (typeof price !== 'number' || price <= 0) {
      throw new Error('price must be a positive number');
    }
    this.prices.set(token, {
      price,
      timestamp: Date.now()
    });
  }

  getPrice(token) {
    const data = this.prices.get(token);
    if (!data) return null;
    
    const age = Date.now() - data.timestamp;
    if (age > this.updateInterval * 5) return null; // Stale price
    
    return data.price;
  }

  calculatePoolPrice(poolId, reserveA, reserveB) {
    if (!reserveA || reserveA <= 0) {
      throw new Error('reserveA must be a positive number to calculate pool price');
    }
    return reserveB / reserveA;
  }

  isPriceStale(token) {
    const data = this.prices.get(token);
    if (!data) return true;
    return Date.now() - data.timestamp > this.updateInterval * 5;
  }
}

module.exports = PriceOracle;
