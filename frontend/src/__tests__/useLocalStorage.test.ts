import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

beforeEach(() => {
  localStorage.clear();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('useLocalStorage', () => {
  it('returns initialValue when key is absent', () => {
    const { result } = renderHook(() => useLocalStorage('missing', 42));
    expect(result.current[0]).toBe(42);
  });

  it('reads an existing stored value on mount', () => {
    localStorage.setItem('theme', JSON.stringify('dark'));
    const { result } = renderHook(() => useLocalStorage('theme', 'light'));
    expect(result.current[0]).toBe('dark');
  });

  it('updates localStorage and state on setValue', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => { result.current[1](5); });
    expect(result.current[0]).toBe(5);
    expect(JSON.parse(localStorage.getItem('count')!)).toBe(5);
  });

  it('supports functional updater', () => {
    const { result } = renderHook(() => useLocalStorage('count', 0));
    act(() => { result.current[1](prev => prev + 10); });
    expect(result.current[0]).toBe(10);
  });

  it('removes key and resets to initialValue on remove()', () => {
    const { result } = renderHook(() => useLocalStorage('key', 'init'));
    act(() => { result.current[1]('changed'); });
    act(() => { result.current[2](); });
    expect(result.current[0]).toBe('init');
    expect(localStorage.getItem('key')).toBeNull();
  });

  it('returns initialValue when stored JSON is corrupt', () => {
    localStorage.setItem('bad', 'not-valid-json{{{');
    const { result } = renderHook(() => useLocalStorage('bad', 'fallback'));
    expect(result.current[0]).toBe('fallback');
  });

  it('works with object types', () => {
    const { result } = renderHook(() =>
      useLocalStorage<{ name: string; age: number }>('user', { name: '', age: 0 })
    );
    act(() => { result.current[1]({ name: 'Alice', age: 30 }); });
    expect(result.current[0]).toEqual({ name: 'Alice', age: 30 });
  });

  it('works with array types', () => {
    const { result } = renderHook(() => useLocalStorage<string[]>('tags', []));
    act(() => { result.current[1](['a', 'b', 'c']); });
    expect(result.current[0]).toEqual(['a', 'b', 'c']);
  });

  it('syncs state when storage event fires for same key', () => {
    const { result } = renderHook(() => useLocalStorage('shared', 'old'));
    act(() => {
      localStorage.setItem('shared', JSON.stringify('new'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'shared', newValue: JSON.stringify('new') }));
    });
    expect(result.current[0]).toBe('new');
  });

  it('ignores storage events for different keys', () => {
    const { result } = renderHook(() => useLocalStorage('mykey', 'original'));
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'otherkey', newValue: JSON.stringify('irrelevant') }));
    });
    expect(result.current[0]).toBe('original');
  });

  it('resets to initialValue when storage event has newValue=null', () => {
    const { result } = renderHook(() => useLocalStorage('reset-key', 'default'));
    act(() => { result.current[1]('changed'); });
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'reset-key', newValue: null }));
    });
    expect(result.current[0]).toBe('default');
  });
});
