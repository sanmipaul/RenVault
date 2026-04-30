import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('useLocalStorage edge cases', () => {
  it('handles boolean false as initialValue correctly', () => {
    const { result } = renderHook(() => useLocalStorage('flag', false));
    expect(result.current[0]).toBe(false);
  });

  it('stores and reads boolean true', () => {
    const { result } = renderHook(() => useLocalStorage('flag', false));
    act(() => { result.current[1](true); });
    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem('flag')).toBe('true');
  });

  it('does not conflict between two hooks on different keys', () => {
    const { result: r1 } = renderHook(() => useLocalStorage('key1', 'a'));
    const { result: r2 } = renderHook(() => useLocalStorage('key2', 'b'));
    act(() => { r1.current[1]('x'); });
    expect(r1.current[0]).toBe('x');
    expect(r2.current[0]).toBe('b');
  });

  it('handles null stored value as initialValue', () => {
    localStorage.setItem('nullkey', 'null');
    const { result } = renderHook(() => useLocalStorage<string | null>('nullkey', 'default'));
    expect(result.current[0]).toBeNull();
  });

  it('handles nested objects', () => {
    const initial = { a: { b: { c: 42 } } };
    const { result } = renderHook(() => useLocalStorage('nested', initial));
    act(() => { result.current[1]({ a: { b: { c: 99 } } }); });
    expect(result.current[0]).toEqual({ a: { b: { c: 99 } } });
  });

  it('functional updater reads from current localStorage not stale closure', () => {
    localStorage.setItem('counter', '10');
    const { result } = renderHook(() => useLocalStorage('counter', 0));
    act(() => { result.current[1](prev => prev + 5); });
    expect(result.current[0]).toBe(15);
  });

  it('warns and does not throw when localStorage.setItem throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw new DOMException('QuotaExceeded');
    });
    const { result } = renderHook(() => useLocalStorage('quota', 'value'));
    expect(() => act(() => { result.current[1]('newvalue'); })).not.toThrow();
    expect(console.warn).toHaveBeenCalled();
  });
});
