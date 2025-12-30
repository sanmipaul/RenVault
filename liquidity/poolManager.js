const express = require('express');
const app = express();
app.use(express.json());

class PoolManager {
  constructor() {
    this.pools = new Map();
    this.userPositions = new Map();
  }

  calculatePrice(reserveA, reserveB, amountA) {
    return Math.floor((amountA * reserveB) / (reserveA + amountA));
  }

  calculateLiquidity(amountA, amountB, reserveA, reserveB, totalSupply) {
    if (totalSupply === 0) return Math.sqrt(amountA * amountB);
    return Math.min((amountA * totalSupply) / reserveA, (amountB * totalSupply) / reserveB);
  }

  addPool(tokenA, tokenB, reserveA, reserveB) {
    const poolId = `${tokenA}-${tokenB}`;
    this.pools.set(poolId, { tokenA, tokenB, reserveA, reserveB, totalSupply: 0 });
    return poolId;
  }

  getPool(poolId) {
    return this.pools.get(poolId);
  }
}

const poolManager = new PoolManager();

app.post('/pools', (req, res) => {
  const { tokenA, tokenB, reserveA, reserveB } = req.body;
  const poolId = poolManager.addPool(tokenA, tokenB, reserveA, reserveB);
  res.json({ poolId, success: true });
});

app.get('/pools/:id', (req, res) => {
  const pool = poolManager.getPool(req.params.id);
  res.json(pool || { error: 'Pool not found' });
});

app.listen(3011, () => console.log('Pool Manager running on port 3011'));