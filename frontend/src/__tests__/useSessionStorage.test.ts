import { renderHook, act } from '@testing-library/react';
import { useSessionStorage } from '../hooks/useSessionStorage';

beforeEach(() => {
  sessionStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('useSessionStorage', () => {
  it('returns initialValue when key absent', () => {
    const { result } = renderHook(() => useSessionStorage('s-key', 'init'));
    expect(result.current[0]).toBe('init');
  });

  it('reads existing value from sessionStorage on mount', () => {
    sessionStorage.setItem('s-key', JSON.stringify('existing'));
    const { result } = renderHook(() => useSessionStorage('s-key', 'init'));
    expect(result.current[0]).toBe('existing');
  });

  it('writes to sessionStorage on setValue', () => {
    const { result } = renderHook(() => useSessionStorage<number>('s-num', 0));
    act(() => { result.current[1](7); });
    expect(result.current[0]).toBe(7);
    expect(JSON.parse(sessionStorage.getItem('s-num')!)).toBe(7);
  });

  it('removes key and resets to initialValue on remove()', () => {
    const { result } = renderHook(() => useSessionStorage('s-r', 'default'));
    act(() => { result.current[1]('written'); });
    act(() => { result.current[2](); });
    expect(result.current[0]).toBe('default');
    expect(sessionStorage.getItem('s-r')).toBeNull();
  });

  it('supports functional updater', () => {
    const { result } = renderHook(() => useSessionStorage<number>('s-fn', 1));
    act(() => { result.current[1](prev => prev * 10); });
    expect(result.current[0]).toBe(10);
  });
});
