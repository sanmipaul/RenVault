class SwapEngine {
  constructor() {
    this.pools = new Map();
    this.feeRate = 0.003; // 0.3%
  }

  createPool(poolId, tokenA, tokenB, reserveA, reserveB) {
    if (!poolId || typeof poolId !== 'string') throw new Error('poolId must be a non-empty string');
    if (!tokenA || !tokenB) throw new Error('tokenA and tokenB are required');
    if (tokenA === tokenB) throw new Error('tokenA and tokenB must be different');
    if (typeof reserveA !== 'number' || reserveA <= 0) throw new Error('reserveA must be a positive number');
    if (typeof reserveB !== 'number' || reserveB <= 0) throw new Error('reserveB must be a positive number');
    if (this.pools.has(poolId)) throw new Error(`Pool "${poolId}" already exists`);

    this.pools.set(poolId, { tokenA, tokenB, reserveA, reserveB });
    return { poolId, tokenA, tokenB, reserveA, reserveB };
  }

  calculateSwapOutput(amountIn, reserveIn, reserveOut) {
    const amountInWithFee = amountIn * (1 - this.feeRate);
    return Math.floor((amountInWithFee * reserveOut) / (reserveIn + amountInWithFee));
  }

  calculateSlippage(expectedOut, actualOut) {
    // Guard against division by zero: if expectedOut is 0, slippage is
    // undefined (100% is a reasonable sentinel — caller receives nothing).
    if (expectedOut === 0) return 100;
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

    // Reject before touching reserves: a zero output means the user would pay
    // amountIn (plus fee) and receive nothing — Math.floor on a tiny input
    // relative to large reserves produces 0 and the swap silently steals value.
    if (amountOut === 0) {
      throw new Error('Insufficient output amount: input too small relative to pool reserves');
    }

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