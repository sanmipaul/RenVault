class SwapEngine {
  constructor() {
    this.pools = new Map();
    this.feeRate = 0.003; // 0.3%
  }

  calculateSwapOutput(amountIn, reserveIn, reserveOut) {
    if (typeof amountIn !== 'number' || amountIn <= 0) throw new Error('amountIn must be a positive number');
    if (typeof reserveIn !== 'number' || reserveIn <= 0) throw new Error('reserveIn must be a positive number');
    if (typeof reserveOut !== 'number' || reserveOut <= 0) throw new Error('reserveOut must be a positive number');
    const amountInWithFee = amountIn * (1 - this.feeRate);
    return Math.floor((amountInWithFee * reserveOut) / (reserveIn + amountInWithFee));
  }

  calculateSlippage(expectedOut, actualOut) {
    if (typeof expectedOut !== 'number' || expectedOut <= 0) throw new Error('expectedOut must be a positive number');
    if (typeof actualOut !== 'number' || actualOut < 0) throw new Error('actualOut must be a non-negative number');
    return Math.abs((expectedOut - actualOut) / expectedOut) * 100;
  }

  executeSwap(poolId, tokenIn, amountIn, minAmountOut) {
    const pool = this.pools.get(poolId);
    if (!pool) throw new Error('Pool not found');

    if (!tokenIn) throw new Error('tokenIn is required');
    if (typeof amountIn !== 'number' || amountIn <= 0) throw new Error('amountIn must be a positive number');
    if (tokenIn !== pool.tokenA && tokenIn !== pool.tokenB) throw new Error('tokenIn does not match pool tokens');

    const isTokenA = tokenIn === pool.tokenA;
    const reserveIn = isTokenA ? pool.reserveA : pool.reserveB;
    const reserveOut = isTokenA ? pool.reserveB : pool.reserveA;

    const amountOut = this.calculateSwapOutput(amountIn, reserveIn, reserveOut);
    
    if (amountOut < minAmountOut) {
      throw new Error('Slippage too high');
    }

    // Update reserves
    if (isTokenA) {
      pool.reserveA += amountIn;
      pool.reserveB -= amountOut;
    } else {
      pool.reserveB += amountIn;
      pool.reserveA -= amountOut;
    }

    return { amountOut, fee: amountIn * this.feeRate };
  }

  getPrice(poolId, tokenIn, amountIn = 1) {
    const pool = this.pools.get(poolId);
    if (!pool) return 0;

    const isTokenA = tokenIn === pool.tokenA;
    const reserveIn = isTokenA ? pool.reserveA : pool.reserveB;
    const reserveOut = isTokenA ? pool.reserveB : pool.reserveA;

    return this.calculateSwapOutput(amountIn, reserveIn, reserveOut);
  }
}

module.exports = SwapEngine;