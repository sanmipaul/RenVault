import { logger } from '../utils/logger';
import { useState, useCallback } from 'react';

/**
 * Identical API to useLocalStorage but backed by sessionStorage.
 * Values are cleared when the tab is closed. Does not sync across tabs.
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const readValue = useCallback((): T => {
    try {
      const raw = sessionStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw) as T;
    } catch {
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const next = value instanceof Function ? value(readValue()) : value;
        sessionStorage.setItem(key, JSON.stringify(next));
        setStoredValue(next);
      } catch (error) {
        logger.warn(`useSessionStorage: failed to write key "${key}"`, error);
      }
    },
    [key, readValue]
  );

  const remove = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      logger.warn(`useSessionStorage: failed to remove key "${key}"`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, remove];
}
