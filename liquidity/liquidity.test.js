const SwapEngine = require('./swapEngine');
const LiquidityRewards = require('./liquidityRewards');
const PoolValidator = require('./poolValidator');
const LPTokenManager = require('./lpTokenManager');

describe('Liquidity Pool System', () => {
  let swapEngine, rewards, validator, lpTokens;

  beforeEach(() => {
    swapEngine = new SwapEngine();
    rewards = new LiquidityRewards();
    validator = new PoolValidator();
    lpTokens = new LPTokenManager();
  });

  test('should execute swap correctly', () => {
    swapEngine.pools.set('pool1', {
      tokenA: 'STX',
      tokenB: 'USDC',
      reserveA: 100000,
      reserveB: 50000
    });

    const result = swapEngine.executeSwap('pool1', 'STX', 1000, 400);
    expect(result.amountOut).toBeGreaterThan(0);
    expect(result.fee).toBeGreaterThan(0);
  });

  test('should calculate rewards correctly', () => {
    rewards.addLiquidityProvider('pool1', 'user1', 10000);
    const earned = rewards.calculateRewards('pool1', 'user1');
    expect(earned).toBeGreaterThanOrEqual(0);
  });

  test('should validate pool creation', () => {
    expect(() => {
      validator.validatePoolCreation('STX', 'USDC', 10000, 5000);
    }).not.toThrow();

    expect(() => {
      validator.validatePoolCreation('STX', 'STX', 10000, 5000);
    }).toThrow('Tokens must be different');
  });

  test('should mint LP tokens', () => {
    const minted = lpTokens.mint('pool1', 'user1', 1000);
    expect(minted).toBe(1000);
    expect(lpTokens.balanceOf('pool1', 'user1')).toBe(1000);
  });

  test('should calculate pool share', () => {
    lpTokens.mint('pool1', 'user1', 1000);
    lpTokens.mint('pool1', 'user2', 1000);
    const share = lpTokens.getShare('pool1', 'user1');
    expect(share).toBe(50);
  });
});
