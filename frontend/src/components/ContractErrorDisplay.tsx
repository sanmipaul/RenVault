/**
 * ContractErrorDisplay
 *
 * Renders a styled error card for a ContractErrorDescriptor.
 * Intended for use in transaction flows where a contract error
 * needs to be shown inline with a clear message and recovery hint.
 */

import React from 'react';
import type { ContractErrorDescriptor } from '../utils/contractErrorCodes';

interface ContractErrorDisplayProps {
  descriptor: ContractErrorDescriptor | null;
  /** Called when the user dismisses the error. */
  onDismiss?: () => void;
}

export const ContractErrorDisplay: React.FC<ContractErrorDisplayProps> = ({
  descriptor,
  onDismiss,
}) => {
  if (!descriptor) return null;

  return (
    <div className="card error" role="alert" aria-live="assertive">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h4 style={{ margin: 0 }}>
          ❌ Transaction Error
          {descriptor.code > 0 && (
            <span
              style={{ fontSize: '0.75rem', fontWeight: 'normal', marginLeft: '8px', opacity: 0.7 }}
            >
              (code {descriptor.code})
            </span>
          )}
        </h4>
        {onDismiss && (
          <button
            className="btn btn-outline"
            onClick={onDismiss}
            style={{ padding: '2px 8px', fontSize: '0.8rem' }}
            aria-label="Dismiss error"
          >
            ✕
          </button>
        )}
      </div>
      <p style={{ margin: '8px 0 0' }}>{descriptor.message}</p>
      {descriptor.hint && (
        <p style={{ margin: '4px 0 0', fontSize: '0.875rem', opacity: 0.85 }}>
          💡 {descriptor.hint}
        </p>
      )}
    </div>
  );
};

export default ContractErrorDisplay;
