import { renderHook, act } from '@testing-library/react';
import { useDebouncedCallback } from '../hooks/useDebouncedCallback';

jest.useFakeTimers();

describe('useDebouncedCallback', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('does not invoke callback immediately', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(cb, 300));
    result.current.debouncedFn('x');
    expect(cb).not.toHaveBeenCalled();
  });

  it('invokes callback after delay', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(cb, 300));
    result.current.debouncedFn('x');
    act(() => { jest.advanceTimersByTime(300); });
    expect(cb).toHaveBeenCalledWith('x');
    expect(cb).toHaveBeenCalledTimes(1);
  });

  it('coalesces rapid calls into one', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(cb, 300));
    result.current.debouncedFn('a');
    result.current.debouncedFn('b');
    result.current.debouncedFn('c');
    act(() => { jest.advanceTimersByTime(300); });
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenCalledWith('c');
  });

  it('cancel prevents pending invocation', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(cb, 300));
    result.current.debouncedFn('x');
    result.current.cancel();
    act(() => { jest.advanceTimersByTime(300); });
    expect(cb).not.toHaveBeenCalled();
  });

  it('passes multiple arguments correctly', () => {
    const cb = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(cb, 100));
    result.current.debouncedFn(1, 2, 3);
    act(() => { jest.advanceTimersByTime(100); });
    expect(cb).toHaveBeenCalledWith(1, 2, 3);
  });

  it('uses latest callback ref after rerender', () => {
    const cb1 = jest.fn();
    const cb2 = jest.fn();
    const { result, rerender } = renderHook(
      ({ fn }) => useDebouncedCallback(fn, 300),
      { initialProps: { fn: cb1 } }
    );
    result.current.debouncedFn('x');
    rerender({ fn: cb2 });
    act(() => { jest.advanceTimersByTime(300); });
    expect(cb1).not.toHaveBeenCalled();
    expect(cb2).toHaveBeenCalledWith('x');
  });

  it('cancels on unmount', () => {
    const cb = jest.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(cb, 300));
    result.current.debouncedFn('x');
    unmount();
    act(() => { jest.runAllTimers(); });
    expect(cb).not.toHaveBeenCalled();
  });
});
