class PoolValidator {
  constructor() {
    this.minLiquidity = 1000;
    this.maxSlippage = 50; // 50%
  }

  validatePoolCreation(tokenA, tokenB, amountA, amountB) {
    if (!tokenA || !tokenB) {
      throw new Error('Invalid token addresses');
    }
    if (tokenA === tokenB) {
      throw new Error('Tokens must be different');
    }
    if (amountA < this.minLiquidity || amountB < this.minLiquidity) {
      throw new Error(`Minimum liquidity is ${this.minLiquidity}`);
    }
    return true;
  }

  validateSwap(amountIn, minAmountOut, reserveIn, reserveOut) {
    if (amountIn <= 0) {
      throw new Error('Invalid input amount');
    }
    if (amountIn >= reserveIn) {
      throw new Error('Insufficient liquidity');
    }
    if (minAmountOut < 0) {
      throw new Error('Invalid minimum output');
    }
    return true;
  }

  validateSlippage(expectedOut, actualOut) {
    const slippage = Math.abs((expectedOut - actualOut) / expectedOut) * 100;
    if (slippage > this.maxSlippage) {
      throw new Error(`Slippage ${slippage.toFixed(2)}% exceeds maximum ${this.maxSlippage}%`);
    }
    return true;
  }

  validateLiquidityAmount(amount, reserve) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    if (amount > reserve * 10) {
      throw new Error('Amount too large relative to pool');
    }
    return true;
  }
}

module.exports = PoolValidator;
