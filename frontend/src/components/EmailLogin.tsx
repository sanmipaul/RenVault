import React, { useState } from 'react';
import { EmailAuthService } from '../services/email-auth-service';
import { logger } from '../utils/logger';

interface EmailLoginProps {
  onSuccess?: (email: string) => void;
  onError?: (error: Error) => void;
}

/**
 * EmailLogin - Component for email-based authentication
 *
 * Features:
 * - Email input with validation
 * - One-Click Auth initiation
 * - Magic link request
 * - Real-time validation feedback
 */
export const EmailLogin: React.FC<EmailLoginProps> = ({ onSuccess, onError }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState(false);

  const emailAuthService = EmailAuthService.getInstance();

  const validateEmail = (value: string): boolean => {
    return emailAuthService.validateEmail(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValid(validateEmail(value));
    if (error) setError(null);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);

    if (!isValid) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await emailAuthService.authenticateWithEmail(email);
      if (onSuccess) {
        onSuccess(email);
      }
      logger.info('Email authentication initiated for:', email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to authenticate with email';
      setError(errorMessage);
      if (onError && err instanceof Error) {
        onError(err);
      }
      logger.error('Email authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showError = touched && !isValid && email.length > 0;

  return (
    <div className="email-login">
      <form onSubmit={handleSubmit} className="email-login-form">
        <div className="form-header">
          <h3>Sign in with Email</h3>
          <p>Enter your email to receive a magic link</p>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              className={`email-input ${showError ? 'invalid' : ''} ${
                isValid && email.length > 0 ? 'valid' : ''
              }`}
              disabled={isLoading}
              autoComplete="email"
            />
            {isValid && email.length > 0 && (
              <span className="validation-icon success">✓</span>
            )}
            {showError && <span className="validation-icon error">✗</span>}
          </div>
          {showError && (
            <span className="error-text">Please enter a valid email address</span>
          )}
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="submit-button"
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Sending Magic Link...
            </>
          ) : (
            'Continue with Email'
          )}
        </button>

        <p className="info-text">
          We'll send you a magic link to sign in instantly - no password needed!
        </p>
      </form>

      <style>{`
        .email-login {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }

        .email-login-form {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .form-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .form-header h3 {
          font-size: 1.5rem;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .form-header p {
          color: #6b7280;
          font-size: 0.875rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
          font-size: 0.875rem;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .email-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .email-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .email-input.valid {
          border-color: #10b981;
        }

        .email-input.invalid {
          border-color: #ef4444;
        }

        .email-input:disabled {
          background: #f3f4f6;
          cursor: not-allowed;
        }

        .validation-icon {
          position: absolute;
          right: 1rem;
          font-size: 1.25rem;
        }

        .validation-icon.success {
          color: #10b981;
        }

        .validation-icon.error {
          color: #ef4444;
        }

        .error-text {
          display: block;
          margin-top: 0.5rem;
          color: #ef4444;
          font-size: 0.875rem;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .error-icon {
          font-size: 1.25rem;
        }

        .submit-button {
          width: 100%;
          padding: 0.875rem;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
        }

        .submit-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          transform: none;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .info-text {
          text-align: center;
          color: #6b7280;
          font-size: 0.75rem;
          margin-top: 1rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
};
