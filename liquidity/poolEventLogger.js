class PoolEventLogger {
  constructor() {
    this.events = [];
    this.maxEvents = 10000;
  }

  logSwap(poolId, user, tokenIn, tokenOut, amountIn, amountOut, fee) {
    this.addEvent({
      type: 'SWAP',
      poolId,
      user,
      data: { tokenIn, tokenOut, amountIn, amountOut, fee },
      timestamp: Date.now()
    });
  }

  logAddLiquidity(poolId, user, amountA, amountB, lpTokens) {
    this.addEvent({
      type: 'ADD_LIQUIDITY',
      poolId,
      user,
      data: { amountA, amountB, lpTokens },
      timestamp: Date.now()
    });
  }

  logRemoveLiquidity(poolId, user, lpTokens, amountA, amountB) {
    this.addEvent({
      type: 'REMOVE_LIQUIDITY',
      poolId,
      user,
      data: { lpTokens, amountA, amountB },
      timestamp: Date.now()
    });
  }

  logPoolCreated(poolId, tokenA, tokenB, creator) {
    this.addEvent({
      type: 'POOL_CREATED',
      poolId,
      user: creator,
      data: { tokenA, tokenB },
      timestamp: Date.now()
    });
  }

  addEvent(event) {
    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
  }

  getEvents(poolId, type, limit = 100) {
    return this.events
      .filter(e => (!poolId || e.poolId === poolId) && (!type || e.type === type))
      .slice(-limit);
  }

  getUserEvents(user, limit = 100) {
    return this.events
      .filter(e => e.user === user)
      .slice(-limit);
  }
}

module.exports = PoolEventLogger;
