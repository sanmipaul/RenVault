/**
 * Tests for formatSTXAmount and parseSTXInput helpers
 */

import { formatSTXAmount, parseSTXInput } from '../amountValidator';

describe('formatSTXAmount', () => {
  it('strips trailing zeros', () => {
    expect(formatSTXAmount(1.5)).toBe('1.5');
  });

  it('preserves meaningful micro-STX precision', () => {
    expect(formatSTXAmount(1.000001)).toBe('1.000001');
  });

  it('strips all decimals for whole numbers', () => {
    expect(formatSTXAmount(100)).toBe('100');
  });

  it('formats minimum amount correctly', () => {
    expect(formatSTXAmount(0.000001)).toBe('0.000001');
  });

  it('rounds to 6 decimal places', () => {
    // 1.0000005 rounds to 1.000001 at 6dp
    const result = formatSTXAmount(1.0000005);
    expect(result).toMatch(/^1\.000001$/);
  });
});

describe('parseSTXInput', () => {
  it('converts "1" to 1_000_000 µSTX', () => {
    expect(parseSTXInput('1')).toBe(1_000_000);
  });

  it('converts "0.5" to 500_000 µSTX', () => {
    expect(parseSTXInput('0.5')).toBe(500_000);
  });

  it('converts "0.000001" to 1 µSTX', () => {
    expect(parseSTXInput('0.000001')).toBe(1);
  });

  it('returns null for empty string', () => {
    expect(parseSTXInput('')).toBeNull();
  });

  it('returns null for zero', () => {
    expect(parseSTXInput('0')).toBeNull();
  });

  it('returns null for negative number', () => {
    expect(parseSTXInput('-5')).toBeNull();
  });

  it('returns null for non-numeric string', () => {
    expect(parseSTXInput('abc')).toBeNull();
  });

  it('avoids floating-point drift for "0.1"', () => {
    // 0.1 * 1_000_000 = 100000.00000000001 (floating-point); should round to 100_000
    expect(parseSTXInput('0.1')).toBe(100_000);
  });

  it('converts "10" to 10_000_000 µSTX', () => {
    expect(parseSTXInput('10')).toBe(10_000_000);
  });
});
