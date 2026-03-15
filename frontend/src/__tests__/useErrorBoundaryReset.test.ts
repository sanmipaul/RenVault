import { renderHook, act } from '@testing-library/react';
import { useErrorBoundaryReset } from '../hooks/useErrorBoundaryReset';

describe('useErrorBoundaryReset', () => {
  it('returns resetKey=0 initially', () => {
    const { result } = renderHook(() => useErrorBoundaryReset());
    expect(result.current.resetKey).toBe(0);
  });

  it('increments resetKey each time reset is called', () => {
    const { result } = renderHook(() => useErrorBoundaryReset());
    act(() => { result.current.reset(); });
    expect(result.current.resetKey).toBe(1);
    act(() => { result.current.reset(); });
    expect(result.current.resetKey).toBe(2);
  });

  it('returns stable reset function reference across renders', () => {
    const { result, rerender } = renderHook(() => useErrorBoundaryReset());
    const first = result.current.reset;
    rerender();
    expect(result.current.reset).toBe(first);
  });
});
