const { StrategyExecutor } = require('./strategyExecutor');

describe('StrategyExecutor', () => {
  let executor;

  beforeEach(() => {
    executor = new StrategyExecutor();
  });

  // executeStrategy
  describe('executeStrategy', () => {
    test('executes a staking strategy and returns executed status', async () => {
      const result = await executor.executeStrategy('alice', 'staking', 1000);
      expect(result.status).toBe('executed');
      expect(result.expectedApy).toBe(5.0);
    });

    test('executes a liquidity strategy', async () => {
      const result = await executor.executeStrategy('alice', 'liquidity', 1000);
      expect(result.status).toBe('executed');
      expect(result.expectedApy).toBe(8.0);
    });

    test('executes a lending strategy', async () => {
      const result = await executor.executeStrategy('alice', 'lending', 1000);
      expect(result.status).toBe('executed');
      expect(result.expectedApy).toBe(3.0);
    });

    test('returns failed status for unknown strategy type', async () => {
      const result = await executor.executeStrategy('alice', 'unknown', 1000);
      expect(result.status).toBe('failed');
      expect(result.error).toBe('Unknown strategy type');
    });

    test('throws if userAddress is missing', async () => {
      await expect(executor.executeStrategy('', 'staking', 1000)).rejects.toThrow('userAddress is required');
    });

    test('throws if strategyType is missing', async () => {
      await expect(executor.executeStrategy('alice', '', 1000)).rejects.toThrow('strategyType is required');
    });

    test('throws if amount is not positive', async () => {
      await expect(executor.executeStrategy('alice', 'staking', 0)).rejects.toThrow('amount must be a positive number');
      await expect(executor.executeStrategy('alice', 'staking', -1)).rejects.toThrow();
    });
  });

  // calculateCurrentAllocation
  describe('calculateCurrentAllocation', () => {
    test('returns all zeros when strategies is empty (no division by zero)', () => {
      const alloc = executor.calculateCurrentAllocation([]);
      expect(alloc).toEqual({ staking: 0, liquidity: 0, lending: 0 });
    });

    test('returns correct allocation percentages', () => {
      const strategies = [
        { strategyType: 'staking', amount: 500 },
        { strategyType: 'liquidity', amount: 300 },
        { strategyType: 'lending', amount: 200 }
      ];
      const alloc = executor.calculateCurrentAllocation(strategies);
      expect(alloc.staking).toBe(50);
      expect(alloc.liquidity).toBe(30);
      expect(alloc.lending).toBe(20);
    });

    test('handles single strategy type at 100%', () => {
      const strategies = [{ strategyType: 'staking', amount: 1000 }];
      const alloc = executor.calculateCurrentAllocation(strategies);
      expect(alloc.staking).toBe(100);
      expect(alloc.liquidity).toBe(0);
      expect(alloc.lending).toBe(0);
    });
  });

  // getActiveStrategies
  describe('getActiveStrategies', () => {
    test('returns empty array for user with no strategies', () => {
      expect(executor.getActiveStrategies('nobody')).toHaveLength(0);
    });

    test('returns only strategies belonging to the given user', async () => {
      await executor.executeStrategy('alice', 'staking', 500);
      await executor.executeStrategy('bob', 'lending', 200);
      expect(executor.getActiveStrategies('alice')).toHaveLength(1);
      expect(executor.getActiveStrategies('bob')).toHaveLength(1);
    });
  });

  // rebalanceUser
  describe('rebalanceUser', () => {
    test('returns a result without throwing when no strategies exist', async () => {
      const result = await executor.rebalanceUser('nobody');
      expect(result).toBeDefined();
    });

    test('returns rebalanceNeeded:false when current allocation matches optimal', async () => {
      // Manually inject an active strategy that matches the medium-risk optimal (50/40/10)
      await executor.executeStrategy('alice', 'staking', 500);
      await executor.executeStrategy('alice', 'liquidity', 400);
      await executor.executeStrategy('alice', 'lending', 100);
      const result = await executor.rebalanceUser('alice');
      expect(result.rebalanceNeeded).toBe(false);
    });
  });
});
