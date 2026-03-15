/**
 * amountValidator
 *
 * Input validation for STX deposit and withdrawal numeric fields.
 *
 * Design goals:
 *  - Pure functions with no side-effects (easy to test)
 *  - Rules compose: each validator returns a ValidationResult
 *  - All user-visible strings live here, not in components
 *  - STX-specific constraints (6 decimal places, dust threshold) are
 *    expressed as named constants so they stay in sync with the contract
 */

// ─── STX protocol constraints ────────────────────────────────────────────────

/** STX amounts must be expressed in micro-STX (1 STX = 1 000 000 µSTX). */
export const STX_DECIMALS = 6;

/** Smallest meaningful STX amount (1 µSTX in STX units). */
export const STX_MIN_AMOUNT = 0.000001;

/**
 * Amounts below this threshold after a withdrawal will trigger a low-balance
 * warning.  Matches the logic already present in App.tsx.
 */
export const STX_DUST_THRESHOLD = 0.01;

/**
 * Maximum allowed single deposit / withdrawal (protocol soft cap).
 * Set conservatively; can be raised via config in the future.
 */
export const STX_MAX_SINGLE_TX = 1_000_000;

// ─── Validation types ────────────────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  /** Empty string when valid; human-readable message when invalid. */
  error: string;
  /** Non-blocking advisory (e.g. "This will leave only X STX in your vault"). */
  warning?: string;
}

const OK: ValidationResult = { valid: true, error: '' };

// ─── Formatting helpers ───────────────────────────────────────────────────────

/**
 * Format a numeric STX value to at most 6 decimal places, stripping
 * insignificant trailing zeros.
 *
 * Examples:
 *   formatSTXAmount(1.5)       → "1.5"
 *   formatSTXAmount(1.000001)  → "1.000001"
 *   formatSTXAmount(1.000000)  → "1"
 */
export function formatSTXAmount(value: number): string {
  return value.toFixed(STX_DECIMALS).replace(/\.?0+$/, '');
}

/**
 * Convert a raw input string to a normalised number of micro-STX (µSTX).
 * Returns null when the string is not a valid positive number.
 *
 * This is the value that should be passed to `uintCV()` when building a
 * Clarity contract call.
 */
export function parseSTXInput(raw: string): number | null {
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  // Round to avoid floating-point drift (e.g. 0.1 + 0.2 → 300000 µSTX)
  return Math.round(n * 10 ** STX_DECIMALS);
}

// ─── Core validators ─────────────────────────────────────────────────────────

/**
 * Returns an error result with the given message.
 * Helper to keep callers concise.
 */
function fail(error: string, warning?: string): ValidationResult {
  return { valid: false, error, warning };
}

/**
 * Validate that the raw string is non-empty and not whitespace-only.
 */
export function validateRequired(raw: string): ValidationResult {
  if (!raw || raw.trim() === '') {
    return fail('Please enter an amount.');
  }
  return OK;
}

/**
 * Validate that the raw string parses to a finite number.
 */
export function validateNumeric(raw: string): ValidationResult {
  const n = Number(raw);
  if (!Number.isFinite(n) || raw.trim() === '') {
    return fail('Please enter a valid number.');
  }
  return OK;
}

/**
 * Validate that the value is strictly positive (> 0).
 */
export function validatePositive(raw: string): ValidationResult {
  const n = parseFloat(raw);
  if (n <= 0) {
    return fail('Amount must be greater than zero.');
  }
  return OK;
}

/**
 * Validate that the value meets the STX minimum (1 µSTX).
 */
export function validateMinAmount(raw: string): ValidationResult {
  const n = parseFloat(raw);
  if (n < STX_MIN_AMOUNT) {
    return fail(`Amount must be at least ${STX_MIN_AMOUNT} STX (1 µSTX).`);
  }
  return OK;
}

/**
 * Validate that the value does not exceed the per-transaction maximum.
 */
export function validateMaxAmount(raw: string, max = STX_MAX_SINGLE_TX): ValidationResult {
  const n = parseFloat(raw);
  if (n > max) {
    return fail(`Amount cannot exceed ${max.toLocaleString()} STX per transaction.`);
  }
  return OK;
}

/**
 * Validate that the value has at most `maxDecimals` decimal places.
 * STX supports up to 6 decimal places (micro-STX precision).
 */
export function validateDecimalPlaces(
  raw: string,
  maxDecimals = STX_DECIMALS
): ValidationResult {
  // Remove trailing zeros before counting
  const parts = raw.split('.');
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    return fail(`Amount can have at most ${maxDecimals} decimal places (µSTX precision).`);
  }
  return OK;
}

/**
 * Run a sequence of validators and return the first failure, or OK when all pass.
 */
export function runValidators(
  raw: string,
  validators: Array<(raw: string) => ValidationResult>
): ValidationResult {
  for (const validator of validators) {
    const result = validator(raw);
    if (!result.valid) return result;
  }
  return OK;
}

// ─── Composite validators ────────────────────────────────────────────────────

/**
 * Full validation for a deposit amount field.
 * Does NOT check the wallet balance (that is a runtime check in handleDeposit).
 */
export function validateDepositAmount(raw: string): ValidationResult {
  return runValidators(raw, [
    validateRequired,
    validateNumeric,
    validatePositive,
    validateDecimalPlaces,
    validateMinAmount,
    (r) => validateMaxAmount(r, STX_MAX_SINGLE_TX),
  ]);
}

/**
 * Full validation for a withdrawal amount field, including balance check.
 *
 * @param raw           - The raw string from the input element
 * @param currentBalance - The user's current vault balance as a number
 */
export function validateWithdrawAmount(
  raw: string,
  currentBalance: number
): ValidationResult {
  const base = runValidators(raw, [
    validateRequired,
    validateNumeric,
    validatePositive,
    validateDecimalPlaces,
    validateMinAmount,
    (r) => validateMaxAmount(r, currentBalance),
  ]);
  if (!base.valid) return base;

  const n = parseFloat(raw);

  if (n > currentBalance) {
    return fail(
      `Insufficient balance. You have ${currentBalance.toFixed(6)} STX available.`
    );
  }

  // Non-blocking dust warning
  const remaining = currentBalance - n;
  if (remaining > 0 && remaining < STX_DUST_THRESHOLD) {
    return {
      valid: true,
      error: '',
      warning: `This will leave only ${remaining.toFixed(6)} STX in your vault.`,
    };
  }

  return OK;
}
