/**
 * Shape of a Stacks broadcast API error response body.
 * See: https://docs.stacks.co/reference/stacks-node-rpc-api
 */
export interface StacksBroadcastErrorBody {
  error?: string;
  reason?: string;
  reason_data?: {
    type?: string;
    error?: string;
    message?: string;
  };
}

/**
 * Parse a Stacks broadcast API error body into a ContractErrorDescriptor.
 * Returns null when the body does not contain a contract error code.
 */
export function parseStacksBroadcastError(
  body: StacksBroadcastErrorBody,
  contractName: string
): import('./contractErrorCodes').ContractErrorDescriptor | null {
  const code = ContractErrorMapper.parseErrorCode(body);
  if (code === null) return null;
  return ContractErrorMapper.lookup(code, contractName);
}

/**
 * ContractErrorMapper
 *
 * Parses raw Clarity / Stacks broadcast error payloads and returns
 * structured, user-friendly error descriptors.
 *
 * Clarity contract errors arrive in several shapes depending on where in the
 * call stack they surface:
 *
 *   1. Post-condition abort:  error.message contains "PostConditionFailed"
 *   2. Abort_by_response:     error.message or error.reason contains
 *                             "abort_by_response" and a reason_data like
 *                             "(err u102)"
 *   3. Broadcast API body:    { error: "transaction rejected", reason: "...",
 *                               reason_data: { type: "AbortedByResponse",
 *                               error: "(err u102)" } }
 *   4. Plain integer string:  "102"
 *
 * The mapper handles all four forms and returns a consistent
 * ContractErrorDescriptor (or a generic fallback).
 */

import {
  ALL_CONTRACT_ERRORS,
  ContractErrorDescriptor,
  ContractErrorMap,
} from './contractErrorCodes';

/** Fallback descriptor returned when no specific mapping is found. */
const UNKNOWN_ERROR: ContractErrorDescriptor = {
  code: -1,
  name: 'unknown',
  message: 'An unexpected contract error occurred.',
  hint: 'Please try again or contact support if the issue persists.',
};

/**
 * Structured error thrown by ContractErrorMapper.mapToError() so callers
 * can catch typed contract errors.
 */
export class ContractError extends Error {
  constructor(
    public readonly descriptor: ContractErrorDescriptor,
    public readonly contractName: string,
    public readonly rawError?: unknown
  ) {
    super(descriptor.message);
    this.name = 'ContractError';
  }
}

export class ContractErrorMapper {
  /**
   * Extract an unsigned integer error code from a raw error value.
   *
   * Handles:
   *   - `(err u102)` strings
   *   - `u102` strings
   *   - plain numbers / numeric strings like `"102"`
   *   - Error objects whose .message contains one of the above patterns
   *   - Broadcast response objects with a `reason_data.error` field
   */
  static parseErrorCode(raw: unknown): number | null {
    if (raw === null || raw === undefined) return null;

    // Plain number
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;

    // String patterns
    if (typeof raw === 'string') {
      // "(err u102)" or "u102"
      const clarityMatch = raw.match(/\(err\s+u(\d+)\)/);
      if (clarityMatch) return parseInt(clarityMatch[1], 10);

      const uintMatch = raw.match(/\bu(\d+)\b/);
      if (uintMatch) return parseInt(uintMatch[1], 10);

      // Plain numeric string
      const numMatch = raw.match(/^\s*(\d+)\s*$/);
      if (numMatch) return parseInt(numMatch[1], 10);
    }

    // Error object
    if (raw instanceof Error) return this.parseErrorCode(raw.message);

    // Broadcast response object shape: { reason_data: { error: "(err u102)" } }
    if (typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;

      if (typeof obj.reason_data === 'object' && obj.reason_data !== null) {
        const rd = obj.reason_data as Record<string, unknown>;
        const code = this.parseErrorCode(rd.error ?? rd.message);
        if (code !== null) return code;
      }

      // Top-level `error` or `message` field
      const code =
        this.parseErrorCode(obj.error) ??
        this.parseErrorCode(obj.message) ??
        this.parseErrorCode(obj.reason);
      if (code !== null) return code;
    }

    return null;
  }

  /**
   * Look up the descriptor for a numeric error code in the given contract's
   * error map.  Returns null when the code is not in the map.
   */
  static lookup(code: number, contractName: string): ContractErrorDescriptor | null {
    const map: ContractErrorMap | undefined = ALL_CONTRACT_ERRORS[contractName];
    return map?.[code] ?? null;
  }

  /**
   * Map a raw error value to a user-friendly ContractErrorDescriptor.
   * Falls back to UNKNOWN_ERROR when no match is found.
   *
   * @param raw         - The raw error (string, Error, broadcast object, etc.)
   * @param contractName - Clarity contract name (e.g. "ren-vault")
   */
  static map(raw: unknown, contractName: string): ContractErrorDescriptor {
    // Check for post-condition abort first (no error code needed)
    if (
      typeof raw === 'string' &&
      raw.toLowerCase().includes('postcondition')
    ) {
      return {
        code: -2,
        name: 'post-condition-failed',
        message: 'Transaction rejected — post-condition check failed.',
        hint: 'Ensure your balance and spending conditions are met before retrying.',
      };
    }

    if (raw instanceof Error && raw.message.toLowerCase().includes('postcondition')) {
      return {
        code: -2,
        name: 'post-condition-failed',
        message: 'Transaction rejected — post-condition check failed.',
        hint: 'Ensure your balance and spending conditions are met before retrying.',
      };
    }

    const code = this.parseErrorCode(raw);
    if (code === null) return UNKNOWN_ERROR;

    const descriptor = this.lookup(code, contractName);
    return descriptor ?? {
      ...UNKNOWN_ERROR,
      code,
      name: `err-u${code}`,
      message: `Contract error (code ${code}).`,
    };
  }

  /**
   * Convenience: map and throw a ContractError.
   * Useful inside async transaction handlers:
   *   await ContractErrorMapper.mapToError(err, 'ren-vault');
   */
  static mapToError(raw: unknown, contractName: string): ContractError {
    const descriptor = this.map(raw, contractName);
    return new ContractError(descriptor, contractName, raw);
  }

  /**
   * Return a user-facing error string combining the message and hint.
   * Suitable for direct insertion into a status bar or toast.
   */
  static toStatusMessage(raw: unknown, contractName: string): string {
    const d = this.map(raw, contractName);
    return d.hint ? `${d.message} ${d.hint}` : d.message;
  }

  /**
   * Return true when a raw error is a user-recognizable contract error
   * (i.e. it carries a parseable error code).
   */
  static isContractError(raw: unknown): boolean {
    return this.parseErrorCode(raw) !== null;
  }

  /**
   * Return only the recovery hint for a raw error, or an empty string when
   * no hint is defined.  Useful for tooltip / aria-description attributes.
   */
  static getErrorSuggestion(raw: unknown, contractName: string): string {
    return this.map(raw, contractName).hint ?? '';
  }
}
