/**
 * amountValidator unit tests
 */

import {
  validateRequired,
  validateNumeric,
  validatePositive,
  validateMinAmount,
  validateMaxAmount,
  validateDecimalPlaces,
  validateDepositAmount,
  validateWithdrawAmount,
  runValidators,
  STX_MIN_AMOUNT,
  STX_MAX_SINGLE_TX,
  STX_DUST_THRESHOLD,
} from '../amountValidator';

// ─── validateRequired ────────────────────────────────────────────────────────

describe('validateRequired', () => {
  it('fails for empty string', () => {
    expect(validateRequired('').valid).toBe(false);
  });

  it('fails for whitespace-only string', () => {
    expect(validateRequired('   ').valid).toBe(false);
  });

  it('passes for a non-empty value', () => {
    expect(validateRequired('1').valid).toBe(true);
  });
});

// ─── validateNumeric ─────────────────────────────────────────────────────────

describe('validateNumeric', () => {
  it('fails for non-numeric string', () => {
    expect(validateNumeric('abc').valid).toBe(false);
  });

  it('fails for "NaN"', () => {
    expect(validateNumeric('NaN').valid).toBe(false);
  });

  it('passes for integer string', () => {
    expect(validateNumeric('100').valid).toBe(true);
  });

  it('passes for decimal string', () => {
    expect(validateNumeric('0.5').valid).toBe(true);
  });
});

// ─── validatePositive ────────────────────────────────────────────────────────

describe('validatePositive', () => {
  it('fails for zero', () => {
    expect(validatePositive('0').valid).toBe(false);
  });

  it('fails for negative number', () => {
    expect(validatePositive('-1').valid).toBe(false);
  });

  it('passes for positive number', () => {
    expect(validatePositive('0.1').valid).toBe(true);
  });
});

// ─── validateMinAmount ───────────────────────────────────────────────────────

describe('validateMinAmount', () => {
  it(`fails for amount below ${STX_MIN_AMOUNT}`, () => {
    expect(validateMinAmount('0.0000001').valid).toBe(false);
  });

  it(`passes for exactly ${STX_MIN_AMOUNT}`, () => {
    expect(validateMinAmount(STX_MIN_AMOUNT.toString()).valid).toBe(true);
  });

  it('passes for larger amount', () => {
    expect(validateMinAmount('1').valid).toBe(true);
  });
});

// ─── validateMaxAmount ───────────────────────────────────────────────────────

describe('validateMaxAmount', () => {
  it(`fails for amount above ${STX_MAX_SINGLE_TX}`, () => {
    expect(validateMaxAmount((STX_MAX_SINGLE_TX + 1).toString()).valid).toBe(false);
  });

  it('passes for amount equal to max', () => {
    expect(validateMaxAmount(STX_MAX_SINGLE_TX.toString()).valid).toBe(true);
  });

  it('respects a custom max parameter', () => {
    expect(validateMaxAmount('101', 100).valid).toBe(false);
    expect(validateMaxAmount('99', 100).valid).toBe(true);
  });
});

// ─── validateDecimalPlaces ───────────────────────────────────────────────────

describe('validateDecimalPlaces', () => {
  it('fails for more than 6 decimal places', () => {
    expect(validateDecimalPlaces('1.0000001').valid).toBe(false);
  });

  it('passes for exactly 6 decimal places', () => {
    expect(validateDecimalPlaces('1.000001').valid).toBe(true);
  });

  it('passes for no decimal part', () => {
    expect(validateDecimalPlaces('5').valid).toBe(true);
  });

  it('passes for fewer than 6 decimal places', () => {
    expect(validateDecimalPlaces('1.5').valid).toBe(true);
  });
});

// ─── runValidators ───────────────────────────────────────────────────────────

describe('runValidators', () => {
  it('returns the first failure', () => {
    const result = runValidators('', [validateRequired, validateNumeric]);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/enter an amount/i);
  });

  it('returns OK when all pass', () => {
    const result = runValidators('1', [validateRequired, validateNumeric, validatePositive]);
    expect(result.valid).toBe(true);
  });
});

// ─── validateDepositAmount ───────────────────────────────────────────────────

describe('validateDepositAmount', () => {
  it('fails for empty string', () => {
    expect(validateDepositAmount('').valid).toBe(false);
  });

  it('fails for zero', () => {
    expect(validateDepositAmount('0').valid).toBe(false);
  });

  it('fails for negative', () => {
    expect(validateDepositAmount('-5').valid).toBe(false);
  });

  it('fails for too many decimal places', () => {
    expect(validateDepositAmount('1.0000001').valid).toBe(false);
  });

  it('fails for non-numeric input', () => {
    expect(validateDepositAmount('abc').valid).toBe(false);
  });

  it('passes for valid STX amount', () => {
    expect(validateDepositAmount('10').valid).toBe(true);
  });

  it('passes for minimum amount (1 µSTX)', () => {
    expect(validateDepositAmount('0.000001').valid).toBe(true);
  });

  it('fails for amount exceeding max', () => {
    expect(validateDepositAmount((STX_MAX_SINGLE_TX + 1).toString()).valid).toBe(false);
  });
});

// ─── validateWithdrawAmount ──────────────────────────────────────────────────

describe('validateWithdrawAmount', () => {
  const balance = 10;

  it('fails for empty string', () => {
    expect(validateWithdrawAmount('', balance).valid).toBe(false);
  });

  it('fails when amount exceeds balance', () => {
    expect(validateWithdrawAmount('11', balance).valid).toBe(false);
  });

  it('fails for non-numeric', () => {
    expect(validateWithdrawAmount('xyz', balance).valid).toBe(false);
  });

  it('passes for valid amount within balance', () => {
    expect(validateWithdrawAmount('5', balance).valid).toBe(true);
  });

  it('passes for full balance withdrawal', () => {
    expect(validateWithdrawAmount('10', balance).valid).toBe(true);
  });

  it(`adds a warning when remaining balance < ${STX_DUST_THRESHOLD} STX`, () => {
    const result = validateWithdrawAmount('9.999', 10);
    expect(result.valid).toBe(true);
    expect(result.warning).toBeDefined();
    expect(result.warning).toContain('only');
  });

  it('does not warn when remaining balance equals zero (full withdrawal)', () => {
    const result = validateWithdrawAmount('10', 10);
    expect(result.valid).toBe(true);
    expect(result.warning).toBeUndefined();
  });
});
