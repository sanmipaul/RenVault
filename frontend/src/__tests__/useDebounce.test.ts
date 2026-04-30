import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update value before delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );
    rerender({ value: 'b', delay: 300 });
    act(() => { jest.advanceTimersByTime(200); });
    expect(result.current).toBe('a');
  });

  it('updates value after delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );
    rerender({ value: 'b', delay: 300 });
    act(() => { jest.advanceTimersByTime(300); });
    expect(result.current).toBe('b');
  });

  it('resets timer on each new value', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );
    rerender({ value: 'b', delay: 300 });
    act(() => { jest.advanceTimersByTime(200); });
    rerender({ value: 'c', delay: 300 });
    act(() => { jest.advanceTimersByTime(200); });
    expect(result.current).toBe('a'); // neither b nor c yet
    act(() => { jest.advanceTimersByTime(100); });
    expect(result.current).toBe('c');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 100 } }
    );
    rerender({ value: 42, delay: 100 });
    act(() => { jest.advanceTimersByTime(100); });
    expect(result.current).toBe(42);
  });

  it('clears timer on unmount', () => {
    const { rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } }
    );
    rerender({ value: 'b', delay: 300 });
    unmount();
    // Should not throw after unmount when timer fires
    expect(() => act(() => { jest.runAllTimers(); })).not.toThrow();
  });
});
