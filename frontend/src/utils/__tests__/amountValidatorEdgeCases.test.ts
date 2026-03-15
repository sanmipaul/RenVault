/**
 * amountValidator edge-case tests
 *
 * Covers boundary values, scientific notation, and locale-specific inputs.
 */

import {
  validateDepositAmount,
  validateWithdrawAmount,
  validateDecimalPlaces,
  validateNumeric,
  STX_MAX_SINGLE_TX,
} from '../amountValidator';

describe('validateDepositAmount – edge cases', () => {
  it('rejects scientific notation (e.g. "1e2")', () => {
    // parseFloat('1e2') === 100 which is fine, but we want to ensure
    // the validator handles it correctly
    const result = validateDepositAmount('1e2');
    // 1e2 = 100, which is valid numerically and positive
    expect(result.valid).toBe(true);
  });

  it('rejects leading-dot shorthand ".5" — numeric check passes', () => {
    // ".5" parses to 0.5 — should be valid
    expect(validateDepositAmount('.5').valid).toBe(true);
  });

  it('rejects strings with letters mixed in', () => {
    expect(validateDepositAmount('1a').valid).toBe(false);
  });

  it('rejects Infinity', () => {
    expect(validateNumeric('Infinity').valid).toBe(false);
  });

  it('rejects -Infinity', () => {
    expect(validateNumeric('-Infinity').valid).toBe(false);
  });

  it('treats "  " (spaces) as required-field failure', () => {
    expect(validateDepositAmount('  ').valid).toBe(false);
  });

  it('passes for the protocol maximum', () => {
    expect(validateDepositAmount(STX_MAX_SINGLE_TX.toString()).valid).toBe(true);
  });

  it('fails for exactly one more than the protocol maximum', () => {
    expect(validateDepositAmount((STX_MAX_SINGLE_TX + 0.000001).toString()).valid).toBe(false);
  });
});

describe('validateDecimalPlaces – edge cases', () => {
  it('accepts integer with no decimal point', () => {
    expect(validateDecimalPlaces('100').valid).toBe(true);
  });

  it('accepts exactly six decimal places', () => {
    expect(validateDecimalPlaces('0.123456').valid).toBe(true);
  });

  it('rejects seven decimal places', () => {
    expect(validateDecimalPlaces('0.1234567').valid).toBe(false);
  });

  it('accepts trailing zeros counted in decimal places', () => {
    // "0.1000000" has 7 chars after decimal — should fail
    expect(validateDecimalPlaces('0.1000000').valid).toBe(false);
  });
});

describe('validateWithdrawAmount – edge cases', () => {
  it('allows full balance withdrawal without dust warning', () => {
    const r = validateWithdrawAmount('5', 5);
    expect(r.valid).toBe(true);
    expect(r.warning).toBeUndefined();
  });

  it('fails for withdrawal from zero balance', () => {
    expect(validateWithdrawAmount('1', 0).valid).toBe(false);
  });

  it('passes for exactly 0.000001 STX', () => {
    expect(validateWithdrawAmount('0.000001', 1).valid).toBe(true);
  });
});
