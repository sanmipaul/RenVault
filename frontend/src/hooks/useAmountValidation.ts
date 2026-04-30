/**
 * useAmountValidation
 *
 * React hook that validates an STX amount string in real time.
 * Maintains a validation result in state so components can show
 * inline errors and disable submit buttons without duplicating logic.
 *
 * Usage (deposit):
 *   const { result, validate, reset } = useAmountValidation('deposit');
 *   <input onChange={e => validate(e.target.value)} />
 *   {!result.valid && <p className="error">{result.error}</p>}
 *
 * Usage (withdrawal, with balance):
 *   const { result, validate } = useAmountValidation('withdraw', balance);
 */

import { useState, useCallback } from 'react';
import {
  ValidationResult,
  validateDepositAmount,
  validateWithdrawAmount,
} from '../utils/amountValidator';

type ValidationMode = 'deposit' | 'withdraw';

interface UseAmountValidationResult {
  /** Latest validation result for the current input value. */
  result: ValidationResult;
  /**
   * Validate a new raw string value.  Updates the stored result and
   * returns it so callers can also inspect it inline.
   */
  validate: (raw: string) => ValidationResult;
  /** Reset validation state to the initial (valid/empty) state. */
  reset: () => void;
  /** True when the stored result has a non-blocking warning. */
  hasWarning: boolean;
}

const INITIAL: ValidationResult = { valid: true, error: '' };

export function useAmountValidation(
  mode: ValidationMode,
  currentBalance = 0
): UseAmountValidationResult {
  const [result, setResult] = useState<ValidationResult>(INITIAL);

  const validate = useCallback(
    (raw: string): ValidationResult => {
      const next =
        mode === 'deposit'
          ? validateDepositAmount(raw)
          : validateWithdrawAmount(raw, currentBalance);
      setResult(next);
      return next;
    },
    [mode, currentBalance]
  );

  const reset = useCallback(() => setResult(INITIAL), []);

  return {
    result,
    validate,
    reset,
    hasWarning: result.valid && Boolean(result.warning),
  };
}
