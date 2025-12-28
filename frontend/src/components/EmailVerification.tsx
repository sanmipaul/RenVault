import React, { useState, useEffect } from 'react';
import { EmailAuthService } from '../services/email-auth-service';
import { logger } from '../utils/logger';

interface EmailVerificationProps {
  email: string;
  onVerified?: () => void;
  onError?: (error: Error) => void;
}

/**
 * EmailVerification - Component for handling email verification workflow
 *
 * Features:
 * - Email verification status display
 * - Resend verification email
 * - Magic link processing
 */
export const EmailVerification: React.FC<EmailVerificationProps> = ({
  email,
  onVerified,
  onError,
}) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const emailAuthService = EmailAuthService.getInstance();

  useEffect(() => {
    checkVerificationStatus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const checkVerificationStatus = async () => {
    try {
      const verified = await emailAuthService.isEmailVerified();
      setIsVerified(verified);
      if (verified && onVerified) {
        onVerified();
      }
    } catch (err) {
      logger.error('Failed to check verification status:', err);
    }
  };

  const handleResendEmail = async () => {
    if (resendTimer > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await emailAuthService.sendVerificationEmail(email);
      setResendTimer(60); // 60 seconds cooldown
      logger.info('Verification email resent successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend email';
      setError(errorMessage);
      if (onError && err instanceof Error) {
        onError(err);
      }
      logger.error('Failed to resend verification email:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="email-verification verified">
        <div className="verification-icon success">✓</div>
        <h3>Email Verified</h3>
        <p>Your email {email} has been verified successfully.</p>
      </div>
    );
  }

  return (
    <div className="email-verification pending">
      <div className="verification-icon pending">📧</div>
      <h3>Verify Your Email</h3>
      <p>
        We've sent a verification email to <strong>{email}</strong>
      </p>
      <p className="instruction">
        Please check your inbox and click the verification link to continue.
      </p>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <button
        onClick={handleResendEmail}
        disabled={isLoading || resendTimer > 0}
        className="resend-button"
      >
        {isLoading
          ? 'Sending...'
          : resendTimer > 0
          ? `Resend in ${resendTimer}s`
          : 'Resend Verification Email'}
      </button>

      <button onClick={checkVerificationStatus} className="check-button">
        I've Verified My Email
      </button>

      <style>{`
        .email-verification {
          max-width: 400px;
          margin: 2rem auto;
          padding: 2rem;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .verification-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .verification-icon.success {
          color: #10b981;
        }

        .verification-icon.pending {
          color: #f59e0b;
        }

        .email-verification h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #111827;
        }

        .email-verification p {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .instruction {
          font-size: 0.875rem;
          background: #f3f4f6;
          padding: 0.75rem;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: 8px;
          margin: 1rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .error-icon {
          font-size: 1.25rem;
        }

        .resend-button,
        .check-button {
          width: 100%;
          padding: 0.75rem;
          margin: 0.5rem 0;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .resend-button {
          background: #3b82f6;
          color: white;
        }

        .resend-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .resend-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .check-button {
          background: #f3f4f6;
          color: #374151;
        }

        .check-button:hover {
          background: #e5e7eb;
        }

        .verified {
          border: 2px solid #10b981;
        }
      `}</style>
    </div>
  );
};
