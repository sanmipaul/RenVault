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
  try {
    const rewardAmount = rewards.calculateRewards(req.params.id, req.params.user);
    res.json({ rewards: rewardAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/pools/:id/rewards/:user/claim', (req, res) => {
  try {
    const claimed = rewards.claimRewards(req.params.id, req.params.user);
    if (claimed === 0) {
      return res.status(404).json({ error: 'No rewards available to claim' });
    }
    res.json({ claimed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/pools/:id/stats', (req, res) => {
  try {
    const stats = rewards.getPoolStats(req.params.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/pools/:id/position', (req, res) => {
  try {
    const { user, tokenA, tokenB, amountA, amountB, priceA, priceB } = req.body;

    if (!user || typeof user !== 'string') {
      return res.status(400).json({ error: 'user is required and must be a string' });
    }
    if (!tokenA || !tokenB) {
      return res.status(400).json({ error: 'tokenA and tokenB are required' });
    }
    if (typeof amountA !== 'number' || typeof amountB !== 'number' || amountA <= 0 || amountB <= 0) {
      return res.status(400).json({ error: 'amountA and amountB must be positive numbers' });
    }
    if (typeof priceA !== 'number' || typeof priceB !== 'number' || priceA <= 0 || priceB <= 0) {
      return res.status(400).json({ error: 'priceA and priceB must be positive numbers' });
    }

    ilCalculator.recordPosition(user, req.params.id, tokenA, tokenB, amountA, amountB, priceA, priceB);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/pools/:id/impermanent-loss/:user', (req, res) => {
  try {
    const { priceA, priceB } = req.query;
    const parsedPriceA = parseFloat(priceA);
    const parsedPriceB = parseFloat(priceB);

    if (isNaN(parsedPriceA) || isNaN(parsedPriceB) || parsedPriceA <= 0 || parsedPriceB <= 0) {
      return res.status(400).json({ error: 'priceA and priceB query params must be positive numbers' });
    }

    const loss = ilCalculator.calculateImpermanentLoss(req.params.user, req.params.id, parsedPriceA, parsedPriceB);
    if (!loss) {
      return res.status(404).json({ error: 'No position found for this user and pool' });
    }
    res.json(loss);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3011, () => console.log('Liquidity API running on port 3011'));