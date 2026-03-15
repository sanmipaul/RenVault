/**
 * useContractError
 *
 * Convenience hook that wraps ContractErrorMapper for use inside React
 * components and hooks.  Stores the last contract error as state so it
 * can be rendered without the component needing to import the mapper.
 */

import { useState, useCallback } from 'react';
import { ContractErrorMapper } from '../utils/contractErrorMapper';
import type { ContractErrorDescriptor } from '../utils/contractErrorCodes';

interface UseContractErrorResult {
  /** The current error descriptor, or null when no error is set. */
  contractError: ContractErrorDescriptor | null;
  /** User-facing string combining message + hint. Empty string when no error. */
  errorMessage: string;
  /**
   * Map a raw error to a descriptor and store it.
   * Returns the descriptor so callers can inspect it inline.
   */
  captureError: (raw: unknown, contractName: string) => ContractErrorDescriptor;
  /** Clear the stored error. */
  clearError: () => void;
}

export function useContractError(): UseContractErrorResult {
  const [contractError, setContractError] = useState<ContractErrorDescriptor | null>(null);

  const captureError = useCallback(
    (raw: unknown, contractName: string): ContractErrorDescriptor => {
      const descriptor = ContractErrorMapper.map(raw, contractName);
      setContractError(descriptor);
      return descriptor;
    },
    []
  );

  const clearError = useCallback(() => setContractError(null), []);

  const errorMessage = contractError
    ? contractError.hint
      ? `${contractError.message} ${contractError.hint}`
      : contractError.message
    : '';

  return { contractError, errorMessage, captureError, clearError };
}
