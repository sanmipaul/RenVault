const PoolValidator = require('./poolValidator');

describe('PoolValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new PoolValidator();
  });

  // validatePoolCreation
  describe('validatePoolCreation', () => {
    test('passes for valid inputs', () => {
      expect(validator.validatePoolCreation('STX', 'USDC', 5000, 5000)).toBe(true);
    });

    test('throws if tokens are missing', () => {
      expect(() => validator.validatePoolCreation('', 'USDC', 5000, 5000)).toThrow('Invalid token addresses');
    });

    test('throws if both tokens are the same', () => {
      expect(() => validator.validatePoolCreation('STX', 'STX', 5000, 5000)).toThrow('Tokens must be different');
    });

    test('throws if amountA is below minimum liquidity', () => {
      expect(() => validator.validatePoolCreation('STX', 'USDC', 999, 5000)).toThrow('Minimum liquidity');
    });

    test('throws if amountB is below minimum liquidity', () => {
      expect(() => validator.validatePoolCreation('STX', 'USDC', 5000, 500)).toThrow('Minimum liquidity');
    });
  });

  // validateSwap
  describe('validateSwap', () => {
    test('passes for valid swap parameters', () => {
      expect(validator.validateSwap(100, 0, 10000, 5000)).toBe(true);
    });

    test('throws if amountIn is zero or negative', () => {
      expect(() => validator.validateSwap(0, 0, 10000, 5000)).toThrow('Invalid input amount');
      expect(() => validator.validateSwap(-1, 0, 10000, 5000)).toThrow();
    });

    test('throws if amountIn exceeds reserveIn', () => {
      expect(() => validator.validateSwap(10001, 0, 10000, 5000)).toThrow('Insufficient liquidity');
    });

    test('throws if minAmountOut is negative', () => {
      expect(() => validator.validateSwap(100, -1, 10000, 5000)).toThrow('Invalid minimum output');
    });
  });

  // validateSlippage
  describe('validateSlippage', () => {
    test('passes when slippage is within limit', () => {
      expect(validator.validateSlippage(1000, 960)).toBe(true); // 4% slippage
    });

    test('throws when slippage exceeds maxSlippage', () => {
      expect(() => validator.validateSlippage(1000, 400)).toThrow('exceeds maximum');
    });
  });

  // validateLiquidityAmount
  describe('validateLiquidityAmount', () => {
    test('passes for valid amount', () => {
      expect(validator.validateLiquidityAmount(500, 1000)).toBe(true);
    });

    test('throws if amount is zero or negative', () => {
      expect(() => validator.validateLiquidityAmount(0, 1000)).toThrow('Amount must be positive');
      expect(() => validator.validateLiquidityAmount(-1, 1000)).toThrow();
    });

    test('throws if amount is more than 10x the reserve', () => {
      expect(() => validator.validateLiquidityAmount(10001, 1000)).toThrow('Amount too large');
    });
  });
});
