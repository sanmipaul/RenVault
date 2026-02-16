const express = require('express');
const SwapEngine = require('./swapEngine');
const LiquidityRewards = require('./liquidityRewards');
const ImpermanentLossCalculator = require('./impermanentLoss');

const app = express();
app.use(express.json());

const swapEngine = new SwapEngine();
const rewards = new LiquidityRewards();
const ilCalculator = new ImpermanentLossCalculator();

app.post('/pools/:id/swap', (req, res) => {
  try {
    const { tokenIn, amountIn, minAmountOut } = req.body;

    if (!tokenIn || typeof tokenIn !== 'string') {
      return res.status(400).json({ error: 'tokenIn is required and must be a string' });
    }
    if (amountIn === undefined || typeof amountIn !== 'number' || amountIn <= 0) {
      return res.status(400).json({ error: 'amountIn must be a positive number' });
    }
    if (minAmountOut === undefined || typeof minAmountOut !== 'number' || minAmountOut < 0) {
      return res.status(400).json({ error: 'minAmountOut must be a non-negative number' });
    }

    const result = swapEngine.executeSwap(req.params.id, tokenIn, amountIn, minAmountOut);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/pools/:id/liquidity', (req, res) => {
  try {
    const { user, amount } = req.body;

    if (!user || typeof user !== 'string') {
      return res.status(400).json({ error: 'user is required and must be a string' });
    }
    if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'amount must be a positive number' });
    }

    rewards.addLiquidityProvider(req.params.id, user, amount);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/pools/:id/rewards/:user', (req, res) => {
  const rewardAmount = rewards.calculateRewards(req.params.id, req.params.user);
  res.json({ rewards: rewardAmount });
});

app.post('/pools/:id/rewards/:user/claim', (req, res) => {
  const claimed = rewards.claimRewards(req.params.id, req.params.user);
  res.json({ claimed });
});

app.get('/pools/:id/stats', (req, res) => {
  const stats = rewards.getPoolStats(req.params.id);
  res.json(stats);
});

app.post('/pools/:id/position', (req, res) => {
  const { user, tokenA, tokenB, amountA, amountB, priceA, priceB } = req.body;
  ilCalculator.recordPosition(user, req.params.id, tokenA, tokenB, amountA, amountB, priceA, priceB);
  res.json({ success: true });
});

app.get('/pools/:id/impermanent-loss/:user', (req, res) => {
  const { priceA, priceB } = req.query;
  const loss = ilCalculator.calculateImpermanentLoss(req.params.user, req.params.id, parseFloat(priceA), parseFloat(priceB));
  res.json(loss);
});

app.listen(3011, () => console.log('Liquidity API running on port 3011'));