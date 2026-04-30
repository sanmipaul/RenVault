/**
 * useAmountValidation hook unit tests
 */

import { renderHook, act } from '@testing-library/react';
import { useAmountValidation } from '../useAmountValidation';

describe('useAmountValidation – deposit mode', () => {
  it('initialises with valid state and no error', () => {
    const { result } = renderHook(() => useAmountValidation('deposit'));
    expect(result.current.result.valid).toBe(true);
    expect(result.current.result.error).toBe('');
    expect(result.current.hasWarning).toBe(false);
  });

  it('validate() returns and stores a failure for empty string', () => {
    const { result } = renderHook(() => useAmountValidation('deposit'));
    act(() => {
      result.current.validate('');
    });
    expect(result.current.result.valid).toBe(false);
    expect(result.current.result.error).toMatch(/enter an amount/i);
  });

  it('validate() returns and stores a failure for zero', () => {
    const { result } = renderHook(() => useAmountValidation('deposit'));
    act(() => {
      result.current.validate('0');
    });
    expect(result.current.result.valid).toBe(false);
  });

  it('validate() stores valid result for a positive STX amount', () => {
    const { result } = renderHook(() => useAmountValidation('deposit'));
    act(() => {
      result.current.validate('5');
    });
    expect(result.current.result.valid).toBe(true);
    expect(result.current.result.error).toBe('');
  });

  it('reset() reverts to initial valid state', () => {
    const { result } = renderHook(() => useAmountValidation('deposit'));
    act(() => {
      result.current.validate('abc');
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.result.valid).toBe(true);
    expect(result.current.result.error).toBe('');
  });
});

describe('useAmountValidation – withdraw mode', () => {
  const balance = 10;

  it('fails when amount exceeds balance', () => {
    const { result } = renderHook(() => useAmountValidation('withdraw', balance));
    act(() => {
      result.current.validate('15');
    });
    expect(result.current.result.valid).toBe(false);
    expect(result.current.result.error).toContain('Insufficient');
  });

  it('passes for valid amount within balance', () => {
    const { result } = renderHook(() => useAmountValidation('withdraw', balance));
    act(() => {
      result.current.validate('5');
    });
    expect(result.current.result.valid).toBe(true);
  });

  it('hasWarning is true when remaining balance is below dust threshold', () => {
    const { result } = renderHook(() => useAmountValidation('withdraw', balance));
    act(() => {
      result.current.validate('9.999'); // leaves 0.001 STX — below 0.01 dust threshold
    });
    expect(result.current.result.valid).toBe(true);
    expect(result.current.hasWarning).toBe(true);
    expect(result.current.result.warning).toContain('only');
  });

  it('validate() inline return value matches state', () => {
    const { result } = renderHook(() => useAmountValidation('withdraw', balance));
    let returned: ReturnType<typeof result.current.validate> | undefined;
    act(() => {
      returned = result.current.validate('20');
    });
    expect(returned!.valid).toBe(false);
    expect(result.current.result).toEqual(returned);
  });
});
