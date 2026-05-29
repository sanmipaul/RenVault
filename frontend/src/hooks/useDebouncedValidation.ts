import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

export interface ValidationResult {
  valid: boolean;
  error: string;
  warning?: string;
}

const VALID_RESULT: ValidationResult = { valid: true, error: '' };

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

  const debouncedRaw = useDebounce(raw, delay);

  const result: ValidationResult = debouncedRaw === '' ? VALID_RESULT : validator(debouncedRaw);

  const validate = useCallback(
    (newRaw: string) => {
      setRaw(newRaw);
      setIsPending(true);
    },
    []
  );

  const prevDebouncedRef = useRef(debouncedRaw);
  useEffect(() => {
    if (prevDebouncedRef.current !== debouncedRaw) {
      prevDebouncedRef.current = debouncedRaw;
      if (isPending) {
        setIsPending(false);
      }
    }
  }, [debouncedRaw, isPending]);

  const reset = useCallback(() => {
    setRaw('');
    setIsPending(false);
  }, []);

  return { result, isPending, validate, reset };
}
