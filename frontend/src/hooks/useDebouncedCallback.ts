import { useCallback, useEffect, useRef } from 'react';

/**
 * Returns a debounced version of `callback` that is only invoked after `delay`
 * ms of no new calls.  The returned function is stable across renders.
 *
 * Also returns a `cancel` function to abandon any pending invocation.
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): { debouncedFn: (...args: Parameters<T>) => void; cancel: () => void } {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef<T>(callback);

  // Keep callbackRef in sync without re-creating debouncedFn
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const debouncedFn = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [cancel, delay]
  );

  // Clean up on unmount
  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { debouncedFn, cancel };
}
