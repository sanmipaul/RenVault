import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('useLocalStorage multi-instance integration', () => {
  it('two instances on same key stay in sync via storage event', () => {
    const { result: a } = renderHook(() => useLocalStorage('sync-key', 'init'));
    const { result: b } = renderHook(() => useLocalStorage('sync-key', 'init'));

    act(() => { a.current[1]('updated'); });
    // b should sync because setValue dispatches a storage event
    expect(b.current[0]).toBe('updated');
  });

  it('remove on one instance resets both via storage event', () => {
    const { result: a } = renderHook(() => useLocalStorage('rm-key', 'default'));
    const { result: b } = renderHook(() => useLocalStorage('rm-key', 'default'));

    act(() => { a.current[1]('something'); });
    act(() => { a.current[2](); });

    expect(a.current[0]).toBe('default');
    expect(b.current[0]).toBe('default');
  });

  it('two instances on different keys are isolated', () => {
    const { result: x } = renderHook(() => useLocalStorage('x', 0));
    const { result: y } = renderHook(() => useLocalStorage('y', 0));

    act(() => { x.current[1](100); });
    expect(y.current[0]).toBe(0);
  });
});
