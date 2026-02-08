const SwapEngine = require('./swapEngine');
const LiquidityRewards = require('./liquidityRewards');
const PoolAnalytics = require('./poolAnalytics');
const LPTokenManager = require('./lpTokenManager');
const PoolValidator = require('./poolValidator');

console.log('🚀 Initializing Liquidity Pool System...\n');

const swapEngine = new SwapEngine();
const rewards = new LiquidityRewards();
const analytics = new PoolAnalytics();
const lpTokens = new LPTokenManager();
const validator = new PoolValidator();

// Create demo pool
const poolId = 'STX-USDC';
swapEngine.pools.set(poolId, {
  tokenA: 'STX',
  tokenB: 'USDC',
  reserveA: 100000,
  reserveB: 50000
});

console.log('✅ Demo Pool Created:');
console.log(`   Pool ID: ${poolId}`);
console.log(`   Reserve A: 100,000 STX`);
console.log(`   Reserve B: 50,000 USDC\n`);

// Demo swap
const swapResult = swapEngine.executeSwap(poolId, 'STX', 1000, 400);
console.log('✅ Demo Swap Executed:');
console.log(`   Amount Out: ${swapResult.amountOut.toFixed(2)} USDC`);
console.log(`   Fee: ${swapResult.fee.toFixed(2)} STX\n`);

// Add liquidity provider
rewards.addLiquidityProvider(poolId, 'user1', 10000);
const earned = rewards.calculateRewards(poolId, 'user1');
console.log('✅ Liquidity Provider Added:');
console.log(`   User: user1`);
console.log(`   Amount: 10,000`);
console.log(`   Rewards: ${earned.toFixed(4)}\n`);

// Mint LP tokens
lpTokens.mint(poolId, 'user1', 1000);
const share = lpTokens.getShare(poolId, 'user1');
console.log('✅ LP Tokens Minted:');
console.log(`   Amount: 1,000`);
console.log(`   Pool Share: ${share.toFixed(2)}%\n`);

console.log('🎉 Liquidity Pool System Ready!');
console.log('📊 API Server: http://localhost:3011\n');
