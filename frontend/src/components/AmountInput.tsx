/**
 * AmountInput
 *
 * Controlled numeric input for STX amounts with built-in real-time validation
 * display.  Renders an error message directly below the input when the value
 * is invalid, and a non-blocking warning when the value is valid but triggers
 * a dust-threshold alert.
 *
 * Delegates all validation logic to amountValidator.ts — the component only
 * handles presentation.
 */

import React, { useId } from 'react';
import type { ValidationResult } from '../utils/amountValidator';

export interface AmountInputProps {
  /** Current controlled value. */
  value: string;
  /** Called on every keystroke with the new raw string value. */
  onChange: (value: string) => void;
  /** Latest validation result (from useAmountValidation or a manual call). */
  validation: ValidationResult;
  /** Label text shown above the input. */
  label?: string;
  /** Placeholder text inside the input. */
  placeholder?: string;
  /** Whether the input should be disabled. */
  disabled?: boolean;
  /** Additional CSS class names for the outer wrapper div. */
  className?: string;
  /** Called when the user presses Enter. */
  onEnter?: () => void;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  value,
  onChange,
  validation,
  label = 'Amount (STX)',
  placeholder = '0.000001',
  disabled = false,
  className = '',
  onEnter,
}) => {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const warningId = `${inputId}-warning`;

  const hasError = !validation.valid && validation.error !== '';
  const hasWarning = validation.valid && Boolean(validation.warning);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter();
    }
  };

  return (
    <div className={`input-group ${className}`}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        step="0.000001"
        min="0.000001"
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? errorId : hasWarning ? warningId : undefined
        }
        style={
          hasError
            ? { borderColor: 'var(--color-error, #ef4444)' }
            : hasWarning
            ? { borderColor: 'var(--color-warning, #f59e0b)' }
            : undefined
        }
      />
      {hasError && (
        <p
          id={errorId}
          role="alert"
          style={{
            color: 'var(--color-error, #ef4444)',
            fontSize: '0.8rem',
            margin: '4px 0 0',
          }}
        >
          {validation.error}
        </p>
      )}
      {hasWarning && (
        <p
          id={warningId}
          style={{
            color: 'var(--color-warning, #f59e0b)',
            fontSize: '0.8rem',
            margin: '4px 0 0',
          }}
        >
          ⚠ {validation.warning}
        </p>
      )}
    </div>
  );
};

export default AmountInput;
