class PoolAnalytics {
  constructor() {
    this.metrics = new Map();
    this.history = new Map();
  }

  recordSwap(poolId, tokenIn, tokenOut, amountIn, amountOut, fee) {
    if (!poolId) throw new Error('poolId is required');
    if (typeof amountIn !== 'number' || amountIn <= 0) throw new Error('amountIn must be a positive number');
    if (typeof amountOut !== 'number' || amountOut < 0) throw new Error('amountOut must be a non-negative number');
    if (typeof fee !== 'number' || fee < 0) throw new Error('fee must be a non-negative number');

    const key = poolId;
    const current = this.metrics.get(key) || {
      totalVolume: 0,
      swapCount: 0,
      totalFees: 0,
      lastUpdate: Date.now()
    };

    current.totalVolume += amountIn;
    current.swapCount += 1;
    current.totalFees += fee;
    current.lastUpdate = Date.now();

    this.metrics.set(key, current);
    this.recordHistory(poolId, 'swap', { amountIn, amountOut, fee });
  }

  recordHistory(poolId, type, data) {
    const key = poolId;
    const history = this.history.get(key) || [];
    history.push({
      type,
      data,
      timestamp: Date.now()
    });
    
    // Keep last 1000 records
    if (history.length > 1000) {
      history.shift();
    }
    
    this.history.set(key, history);
  }

  getPoolMetrics(poolId) {
    const metrics = this.metrics.get(poolId);
    if (!metrics) return null;

    const dayMs = 24 * 60 * 60 * 1000;
    const history = this.history.get(poolId) || [];
    const dayHistory = history.filter(h => Date.now() - h.timestamp < dayMs);

    const dailyVolume = dayHistory
      .filter(h => h.type === 'swap')
      .reduce((sum, h) => sum + h.data.amountIn, 0);

    return {
      ...metrics,
      dailyVolume,
      avgSwapSize: metrics.swapCount > 0 ? metrics.totalVolume / metrics.swapCount : 0,
      feeRate: metrics.totalVolume > 0 ? (metrics.totalFees / metrics.totalVolume) * 100 : 0
    };
  }

  getTopPools(limit = 10) {
    return Array.from(this.metrics.entries())
      .sort(([,a], [,b]) => b.totalVolume - a.totalVolume)
      .slice(0, limit)
      .map(([poolId, metrics]) => ({
        poolId,
        ...this.getPoolMetrics(poolId)
      }));
  }

  getVolumeHistory(poolId, hours = 24) {
    if (typeof hours !== 'number' || hours <= 0 || hours > 8760) {
      hours = 24;
    }
    const history = this.history.get(poolId) || [];
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    return history
      .filter(h => h.timestamp > cutoff && h.type === 'swap')
      .map(h => ({
        timestamp: h.timestamp,
        volume: h.data.amountIn,
        fee: h.data.fee
      }));
  }
}

module.exports = PoolAnalytics;