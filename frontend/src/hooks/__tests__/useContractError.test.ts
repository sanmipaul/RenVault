/**
 * useContractError hook unit tests
 */

import { renderHook, act } from '@testing-library/react';
import { useContractError } from '../useContractError';

describe('useContractError', () => {
  it('initialises with null error and empty message', () => {
    const { result } = renderHook(() => useContractError());
    expect(result.current.contractError).toBeNull();
    expect(result.current.errorMessage).toBe('');
  });

  it('captureError maps a Clarity error string and stores the descriptor', () => {
    const { result } = renderHook(() => useContractError());
    act(() => {
      result.current.captureError('(err u101)', 'ren-vault');
    });
    expect(result.current.contractError).not.toBeNull();
    expect(result.current.contractError!.name).toBe('err-invalid-amount');
    expect(result.current.errorMessage).toContain('invalid');
  });

  it('errorMessage includes hint when present', () => {
    const { result } = renderHook(() => useContractError());
    act(() => {
      result.current.captureError('(err u102)', 'ren-vault');
    });
    // hint: "Check your vault balance and try a smaller amount."
    expect(result.current.errorMessage).toContain('vault balance');
  });

  it('clearError resets contractError and errorMessage', () => {
    const { result } = renderHook(() => useContractError());
    act(() => {
      result.current.captureError('(err u103)', 'ren-vault');
    });
    act(() => {
      result.current.clearError();
    });
    expect(result.current.contractError).toBeNull();
    expect(result.current.errorMessage).toBe('');
  });

  it('captureError returns the descriptor', () => {
    const { result } = renderHook(() => useContractError());
    let descriptor: ReturnType<typeof result.current.captureError> | undefined;
    act(() => {
      descriptor = result.current.captureError('(err u100)', 'ren-vault');
    });
    expect(descriptor!.name).toBe('err-owner-only');
  });

  it('captureError maps unknown code to generic descriptor', () => {
    const { result } = renderHook(() => useContractError());
    act(() => {
      result.current.captureError('(err u9999)', 'ren-vault');
    });
    expect(result.current.contractError!.code).toBe(9999);
  });
});
