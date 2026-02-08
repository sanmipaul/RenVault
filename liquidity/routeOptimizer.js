class RouteOptimizer {
  constructor() {
    this.pools = new Map();
    this.routes = new Map();
  }

  addPool(poolId, tokenA, tokenB, reserveA, reserveB) {
    this.pools.set(poolId, { tokenA, tokenB, reserveA, reserveB });
  }

  findDirectRoute(tokenIn, tokenOut) {
    for (const [poolId, pool] of this.pools.entries()) {
      if ((pool.tokenA === tokenIn && pool.tokenB === tokenOut) ||
          (pool.tokenB === tokenIn && pool.tokenA === tokenOut)) {
        return [poolId];
      }
    }
    return null;
  }

  findBestRoute(tokenIn, tokenOut, amountIn) {
    const direct = this.findDirectRoute(tokenIn, tokenOut);
    if (direct) {
      return { route: direct, hops: 1 };
    }

    // Find 2-hop routes
    const intermediates = new Set();
    for (const pool of this.pools.values()) {
      if (pool.tokenA === tokenIn || pool.tokenB === tokenIn) {
        intermediates.add(pool.tokenA === tokenIn ? pool.tokenB : pool.tokenA);
      }
    }

    let bestRoute = null;
    let bestOutput = 0;

    for (const intermediate of intermediates) {
      const route1 = this.findDirectRoute(tokenIn, intermediate);
      const route2 = this.findDirectRoute(intermediate, tokenOut);
      
      if (route1 && route2) {
        const output = this.estimateOutput([...route1, ...route2], amountIn);
        if (output > bestOutput) {
          bestOutput = output;
          bestRoute = [...route1, ...route2];
        }
      }
    }

    return bestRoute ? { route: bestRoute, hops: 2, estimatedOutput: bestOutput } : null;
  }

  estimateOutput(route, amountIn) {
    let amount = amountIn;
    for (const poolId of route) {
      const pool = this.pools.get(poolId);
      if (!pool) return 0;
      amount = (amount * 0.997 * pool.reserveB) / (pool.reserveA + amount * 0.997);
    }
    return amount;
  }
}

module.exports = RouteOptimizer;
