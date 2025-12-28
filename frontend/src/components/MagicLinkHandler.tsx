import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmailAuthService } from '../services/email-auth-service';
import { logger } from '../utils/logger';

interface MagicLinkHandlerProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
}

/**
 * MagicLinkHandler - Handles magic link authentication callbacks
 *
 * Features:
 * - Processes magic link tokens from URL
 * - Verifies authentication
 * - Redirects on success
 * - Error handling and display
 */
export const MagicLinkHandler: React.FC<MagicLinkHandlerProps> = ({
  onSuccess,
  onError,
  redirectTo = '/',
}) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  const emailAuthService = EmailAuthService.getInstance();

  useEffect(() => {
    handleMagicLink();
  }, []);

  const handleMagicLink = async () => {
    try {
      // Get token from URL parameters
      const token = searchParams.get('token') || searchParams.get('magicToken');
      const email = searchParams.get('email');

      if (!token) {
        throw new Error('Invalid magic link - missing token');
      }

      logger.info('Processing magic link authentication');
      setStatus('loading');

      // Process the magic link callback
      const success = await emailAuthService.handleMagicLinkCallback(token);

      if (success) {
        setStatus('success');
        logger.info('Magic link authentication successful');

        if (onSuccess) {
          onSuccess();
        }

        // Redirect after a short delay
        setTimeout(() => {
          navigate(redirectTo);
        }, 2000);
      } else {
        throw new Error('Magic link verification failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process magic link';
      setError(errorMessage);
      setStatus('error');

      if (onError && err instanceof Error) {
        onError(err);
      }

      logger.error('Magic link processing failed:', err);
    }
  };

  const handleRetry = () => {
    setStatus('loading');
    setError(null);
    handleMagicLink();
  };

  if (status === 'loading') {
    return (
      <div className="magic-link-handler loading">
        <div className="spinner-large"></div>
        <h2>Verifying your email...</h2>
        <p>Please wait while we authenticate your account.</p>

        <style>{`
          .magic-link-handler {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 2rem;
            text-align: center;
          }

          .spinner-large {
            width: 64px;
            height: 64px;
            border: 4px solid #e5e7eb;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 2rem;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .magic-link-handler h2 {
            font-size: 1.5rem;
            color: #111827;
            margin-bottom: 0.5rem;
          }

          .magic-link-handler p {
            color: #6b7280;
            font-size: 1rem;
          }
        `}</style>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="magic-link-handler success">
        <div className="success-icon">✓</div>
        <h2>Email Verified!</h2>
        <p>Your email has been successfully verified.</p>
        <p className="redirect-text">Redirecting you to the app...</p>

        <style>{`
          .magic-link-handler.success {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 2rem;
            text-align: center;
          }

          .success-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #10b981;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            margin-bottom: 1.5rem;
            animation: scaleIn 0.3s ease-out;
          }

          @keyframes scaleIn {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }

          .magic-link-handler.success h2 {
            font-size: 1.75rem;
            color: #111827;
            margin-bottom: 0.5rem;
          }

          .magic-link-handler.success p {
            color: #6b7280;
            font-size: 1rem;
            margin-bottom: 0.5rem;
          }

          .redirect-text {
            color: #3b82f6;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="magic-link-handler error">
        <div className="error-icon">✗</div>
        <h2>Verification Failed</h2>
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button onClick={handleRetry} className="retry-button">
            Try Again
          </button>
          <button onClick={() => navigate('/')} className="home-button">
            Go to Home
          </button>
        </div>

        <style>{`
          .magic-link-handler.error {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            padding: 2rem;
            text-align: center;
          }

          .error-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: #ef4444;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            margin-bottom: 1.5rem;
          }

          .magic-link-handler.error h2 {
            font-size: 1.75rem;
            color: #111827;
            margin-bottom: 0.5rem;
          }

          .error-message {
            color: #991b1b;
            background: #fee2e2;
            padding: 1rem;
            border-radius: 8px;
            margin: 1rem 0;
            max-width: 400px;
          }

          .error-actions {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
          }

          .retry-button,
          .home-button {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .retry-button {
            background: #3b82f6;
            color: white;
          }

          .retry-button:hover {
            background: #2563eb;
          }

          .home-button {
            background: #f3f4f6;
            color: #374151;
          }

          .home-button:hover {
            background: #e5e7eb;
          }
        `}</style>
      </div>
    );
  }

  return null;
};
