/**
 * Accessible Multi-Chain Transaction Form
 * WCAG 2.1 compliant form for multi-chain transactions
 */

import React, { useState } from 'react';
import { NetworkValidationService } from '../../services/chain/NetworkValidationService';
import { ChainSwitchService } from '../../services/chain/ChainSwitchService';
import { MultiChainErrorHandler, ErrorCode } from '../../services/chain/MultiChainErrorHandler';
import type { ChainType } from '../../config/multi-chain-config';

interface AccessibleMultiChainFormProps {
  onSubmit: (tx: {
    to: string;
    from: string;
    amount: string;
    chainType: ChainType;
  }) => Promise<void>;
  userAddress: string;
  className?: string;
}

/**
 * Accessible Multi-Chain Transaction Form
 */
export const AccessibleMultiChainForm: React.FC<AccessibleMultiChainFormProps> = ({
  onSubmit,
  userAddress,
  className = '',
}) => {
  const [formData, setFormData] = useState({
    to: '',
    amount: '',
    chainType: 'ethereum' as ChainType,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;

    setTouched(prev => new Set([...prev, name]));

    // Validate field on blur
    validateField(name, formData[name as keyof typeof formData]);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'to': {
        const validation = NetworkValidationService.validateAddress(value, formData.chainType);

        if (!value) {
          newErrors.to = 'Recipient address is required';
        } else if (!validation.isValid) {
          newErrors.to = validation.error || 'Invalid address format';
        } else {
          delete newErrors.to;
        }

        break;
      }

      case 'amount': {
        if (!value) {
          newErrors.amount = 'Amount is required';
        } else {
          const validation = NetworkValidationService.validateAmount(value, formData.chainType);

          if (!validation.isValid) {
            newErrors.amount = validation.error || 'Invalid amount';
          } else if (validation.warnings) {
            newErrors.amount = validation.warnings[0];
          } else {
            delete newErrors.amount;
          }
        }

        break;
      }

      case 'chainType': {
        if (!value) {
          newErrors.chainType = 'Please select a chain';
        } else {
          delete newErrors.chainType;
        }

        break;
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched(new Set(['to', 'amount', 'chainType']));

    // Validate all fields
    const newErrors: Record<string, string> = {};

    const toValidation = NetworkValidationService.validateAddress(formData.to, formData.chainType);
    if (!formData.to) {
      newErrors.to = 'Recipient address is required';
    } else if (!toValidation.isValid) {
      newErrors.to = toValidation.error || 'Invalid address';
    }

    const amountValidation = NetworkValidationService.validateAmount(
      formData.amount,
      formData.chainType
    );
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error || 'Invalid amount';
    }

    if (!formData.chainType) {
      newErrors.chainType = 'Please select a chain';
    }

    // Validate complete transaction
    if (Object.keys(newErrors).length === 0) {
      const txValidation = NetworkValidationService.validateTransaction({
        from: userAddress,
        to: formData.to,
        amount: formData.amount,
        chainType: formData.chainType,
      });

      if (!txValidation.isValid) {
        MultiChainErrorHandler.handleValidationError(
          ErrorCode.INVALID_CHAIN,
          txValidation.error || 'Transaction validation failed',
          { tx: formData }
        );
        newErrors.form = txValidation.error || 'Transaction validation failed';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Announce to screen readers
      announceError(Object.values(newErrors)[0]);
      return;
    }

    // Submit form
    setLoading(true);
    setSuccessMessage('');

    try {
      await onSubmit({
        to: formData.to,
        from: userAddress,
        amount: formData.amount,
        chainType: formData.chainType,
      });

      setSuccessMessage('Transaction submitted successfully!');
      setFormData({ to: '', amount: '', chainType: 'ethereum' });
      setTouched(new Set());

      // Announce success to screen readers
      announceSuccess('Your transaction has been submitted successfully');
    } catch (error) {
      const errorMessage = (error as Error).message || 'Transaction failed';

      MultiChainErrorHandler.handleTransactionError(
        ErrorCode.TRANSACTION_FAILED,
        errorMessage,
        { tx: formData }
      );

      setErrors(prev => ({
        ...prev,
        form: errorMessage,
      }));

      // Announce error to screen readers
      announceError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const announceError = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'alert');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.className = 'sr-only';
    announcement.textContent = `Error: ${message}`;
    document.body.appendChild(announcement);

    setTimeout(() => {
      announcement.remove();
    }, 6000);
  };

  const announceSuccess = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      announcement.remove();
    }, 6000);
  };

  return (
    <form className={`accessible-tx-form ${className}`} onSubmit={handleSubmit} noValidate>
      <fieldset>
        <legend>Send Multi-Chain Transaction</legend>

        {/* Error summary */}
        {Object.keys(errors).length > 0 && (
          <div
            className="form-error-summary"
            role="alert"
            aria-labelledby="error-summary-heading"
          >
            <h3 id="error-summary-heading">Please fix the following errors:</h3>
            <ul>
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>
                  <a href={`#${field}`}>{message}</a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="form-success-message" role="status" aria-live="polite">
            {successMessage}
          </div>
        )}

        {/* Chain selection */}
        <div className="form-group">
          <label htmlFor="chainType" className="form-label">
            Select Blockchain Network
            <span aria-label="required">*</span>
          </label>

          <select
            id="chainType"
            name="chainType"
            value={formData.chainType}
            onChange={handleInputChange}
            onBlur={handleBlur}
            aria-describedby={errors.chainType ? 'chainType-error' : undefined}
            aria-invalid={!!errors.chainType}
            required
          >
            <option value="">-- Select a chain --</option>
            <option value="stacks">Stacks</option>
            <option value="ethereum">Ethereum</option>
            <option value="polygon">Polygon</option>
            <option value="arbitrum">Arbitrum</option>
            <option value="sepolia">Sepolia (Testnet)</option>
          </select>

          {errors.chainType && touched.has('chainType') && (
            <span id="chainType-error" className="form-error" role="alert">
              {errors.chainType}
            </span>
          )}

          <p className="form-hint">
            Select the blockchain network where you want to send your transaction.
          </p>
        </div>

        {/* Recipient address */}
        <div className="form-group">
          <label htmlFor="to" className="form-label">
            Recipient Address
            <span aria-label="required">*</span>
          </label>

          <input
            id="to"
            type="text"
            name="to"
            value={formData.to}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Enter recipient address"
            aria-describedby={errors.to ? 'to-error' : 'to-hint'}
            aria-invalid={!!errors.to}
            required
            autoComplete="off"
            spellCheck="false"
          />

          {errors.to && touched.has('to') && (
            <span id="to-error" className="form-error" role="alert">
              {errors.to}
            </span>
          )}

          <p id="to-hint" className="form-hint">
            Enter the complete wallet address for the recipient. Double-check for accuracy.
          </p>
        </div>

        {/* Amount */}
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Amount to Send
            <span aria-label="required">*</span>
          </label>

          <input
            id="amount"
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="0.00"
            step="0.0001"
            min="0"
            aria-describedby={errors.amount ? 'amount-error' : 'amount-hint'}
            aria-invalid={!!errors.amount}
            required
          />

          {errors.amount && touched.has('amount') && (
            <span id="amount-error" className="form-error" role="alert">
              {errors.amount}
            </span>
          )}

          <p id="amount-hint" className="form-hint">
            Enter the amount you want to send. This amount will be deducted from your wallet.
          </p>
        </div>

        {/* Action buttons */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            aria-busy={loading}
            aria-label={loading ? 'Submitting transaction' : 'Send transaction'}
          >
            {loading ? 'Submitting...' : 'Send Transaction'}
          </button>

          <button
            type="reset"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => {
              setFormData({ to: '', amount: '', chainType: 'ethereum' });
              setErrors({});
              setTouched(new Set());
            }}
            aria-label="Reset form"
          >
            Clear
          </button>
        </div>
      </fieldset>

      <style jsx>{`
        .accessible-tx-form {
          padding: 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        fieldset {
          border: none;
          padding: 0;
          margin: 0;
        }

        legend {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #1e293b;
        }

        .form-error-summary {
          padding: 16px;
          margin-bottom: 20px;
          background: #fee2e2;
          border: 2px solid #dc2626;
          border-radius: 6px;
          color: #991b1b;
        }

        .form-error-summary h3 {
          margin: 0 0 12px 0;
          font-size: 16px;
        }

        .form-error-summary ul {
          margin: 0;
          padding-left: 20px;
        }

        .form-error-summary a {
          color: #991b1b;
          text-decoration: underline;
        }

        .form-success-message {
          padding: 16px;
          margin-bottom: 20px;
          background: #ecfdf5;
          border: 2px solid #10b981;
          border-radius: 6px;
          color: #065f46;
          font-weight: 500;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #0f172a;
          font-size: 14px;
        }

        .form-label span {
          color: #dc2626;
          margin-left: 4px;
        }

        input,
        select {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          transition: all 0.2s;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        input[aria-invalid='true'],
        select[aria-invalid='true'] {
          border-color: #dc2626;
        }

        input[aria-invalid='true']:focus,
        select[aria-invalid='true']:focus {
          box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
        }

        .form-error {
          display: block;
          margin-top: 6px;
          color: #dc2626;
          font-size: 13px;
          font-weight: 500;
        }

        .form-hint {
          margin-top: 8px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 40px;
        }

        .btn:focus {
          outline: 2px solid #4f46e5;
          outline-offset: 2px;
        }

        .btn-primary {
          background: #4f46e5;
          color: white;
          flex: 1;
        }

        .btn-primary:hover:not(:disabled) {
          background: #4338ca;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #1e293b;
          border: 1px solid #e2e8f0;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e2e8f0;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Screen reader only text */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        @media (max-width: 640px) {
          .form-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </form>
  );
};

export default AccessibleMultiChainForm;
