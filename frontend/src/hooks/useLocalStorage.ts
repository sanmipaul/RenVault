import { useState, useCallback, useEffect } from 'react';

/**
 * A typed hook that mirrors React.useState but persists the value in
 * localStorage under the given key.
 *
 * - Serialises/deserialises via JSON (supports any JSON-safe type).
 * - Returns `initialValue` when the key is absent or the stored value is
 *   corrupt/unparseable.
 * - Exposes a `remove` helper to delete the key and reset to `initialValue`.
 * - Syncs across tabs via the `storage` window event.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const readValue = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
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
        localStorage.setItem(key, JSON.stringify(next));
        setStoredValue(next);
        // Notify other hook instances on the same page
        window.dispatchEvent(new StorageEvent('storage', { key, newValue: JSON.stringify(next) }));
      } catch (error) {
        console.warn(`useLocalStorage: failed to write key "${key}"`, error);
      }
    },
    [key, readValue]
  );

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new StorageEvent('storage', { key, newValue: null }));
    } catch (error) {
      console.warn(`useLocalStorage: failed to remove key "${key}"`, error);
    }
  }, [key, initialValue]);

  // Sync when another tab or hook instance writes the same key
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== key) return;
      try {
        const next = event.newValue === null ? initialValue : (JSON.parse(event.newValue) as T);
        setStoredValue(next);
      } catch {
        setStoredValue(initialValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, remove];
}
