import { useState, useCallback, useRef } from 'react';
import { useDebounce } from './useDebounce';

export interface ValidationResult {
  valid: boolean;
  error: string;
  warning?: string;
}

const VALID_RESULT: ValidationResult = { valid: true, error: '' };

/**
 * Wraps a synchronous validator function with debounced execution.
 * The `result` reflects the last completed validation; `isPending` is true
 * while the debounce timer is still running.
 *
 * @param validator  Pure function mapping a raw string to a ValidationResult.
 * @param delay      Debounce delay in milliseconds (default 300).
 */
export function useDebouncedValidation(
  validator: (raw: string) => ValidationResult,
  delay = 300
): {
  result: ValidationResult;
  isPending: boolean;
  validate: (raw: string) => void;
  reset: () => void;
} {
  const [raw, setRaw] = useState('');
  const [isPending, setIsPending] = useState(false);

  // useDebouncedValue of raw drives the actual validation
  const debouncedRaw = useDebounce(raw, delay);

  // Compute result synchronously from the debounced value
  const result: ValidationResult = debouncedRaw === '' ? VALID_RESULT : validator(debouncedRaw);

  const validate = useCallback(
    (newRaw: string) => {
      setRaw(newRaw);
      setIsPending(true);
    },
    []
  );

  // Once the debounced value catches up, clear isPending
  const prevDebouncedRef = useRef(debouncedRaw);
  if (prevDebouncedRef.current !== debouncedRaw) {
    prevDebouncedRef.current = debouncedRaw;
    // Side-effect during render — safe here because it's synchronous state sync
    // React will immediately re-render with isPending=false
    if (isPending) {
      // schedule setIsPending(false) after this render commit
      Promise.resolve().then(() => setIsPending(false));
    }
  }

  const reset = useCallback(() => {
    setRaw('');
    setIsPending(false);
  }, []);

  return { result, isPending, validate, reset };
}
