class SwapEngine {
  constructor() {
    this.pools = new Map();
    this.feeRate = 0.003; // 0.3%
  }

  calculateSwapOutput(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn * (1 - this.feeRate);
    return Math.floor((amountInWithFee * reserveOut) / (reserveIn + amountInWithFee));
  }

  calculateSlippage(expectedOut, actualOut) {
    return Math.abs((expectedOut - actualOut) / expectedOut) * 100;
  }

  executeSwap(poolId, tokenIn, amountIn, minAmountOut) {
    const pool = this.pools.get(poolId);
    if (!pool) throw new Error('Pool not found');

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