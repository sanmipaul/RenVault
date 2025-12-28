import React, { useState } from 'react';
import { SocialAuthService, SocialProvider } from '../services/social-auth-service';
import { logger } from '../utils/logger';

interface SocialLoginButtonsProps {
  onSuccess?: (provider: SocialProvider) => void;
  onError?: (error: Error) => void;
  layout?: 'horizontal' | 'vertical';
}

/**
 * SocialLoginButtons - Display social authentication buttons
 *
 * Features:
 * - Google, X, Discord, GitHub authentication
 * - Configurable layout (horizontal/vertical)
 * - Loading states
 * - Error handling
 */
export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSuccess,
  onError,
  layout = 'vertical',
}) => {
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const socialAuthService = SocialAuthService.getInstance();

  const handleSocialLogin = async (provider: SocialProvider) => {
    setLoadingProvider(provider);
    setError(null);

    try {
      await socialAuthService.authenticateWithSocial(provider);
      if (onSuccess) {
        onSuccess(provider);
      }
      logger.info(`Successfully initiated ${provider} authentication`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to authenticate with ${provider}`;
      setError(errorMessage);
      if (onError && err instanceof Error) {
        onError(err);
      }
      logger.error(`${provider} authentication error:`, err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const socialProviders: Array<{
    provider: SocialProvider;
    label: string;
    icon: string;
    color: string;
  }> = [
    {
      provider: 'google',
      label: 'Continue with Google',
      icon: '🔍',
      color: '#4285F4',
    },
    {
      provider: 'x',
      label: 'Continue with X',
      icon: '𝕏',
      color: '#000000',
    },
    {
      provider: 'discord',
      label: 'Continue with Discord',
      icon: '💬',
      color: '#5865F2',
    },
    {
      provider: 'github',
      label: 'Continue with GitHub',
      icon: '🐙',
      color: '#24292e',
    },
  ];

  return (
    <div className={`social-login-buttons ${layout}`}>
      <div className="social-buttons-header">
        <span className="divider-line"></span>
        <span className="divider-text">Or continue with</span>
        <span className="divider-line"></span>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="social-buttons-container">
        {socialProviders.map(({ provider, label, icon, color }) => (
          <button
            key={provider}
            onClick={() => handleSocialLogin(provider)}
            disabled={loadingProvider !== null}
            className="social-button"
            style={{
              borderColor: color,
              color: loadingProvider === provider ? '#9ca3af' : color,
            }}
          >
            <span className="social-icon">{icon}</span>
            <span className="social-label">
              {loadingProvider === provider ? 'Connecting...' : label}
            </span>
          </button>
        ))}
      </div>

      <style>{`
        .social-login-buttons {
          width: 100%;
          margin: 1.5rem 0;
        }

        .social-buttons-header {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: #e5e7eb;
        }

        .divider-text {
          padding: 0 1rem;
          color: #6b7280;
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

        .social-buttons-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .social-login-buttons.horizontal .social-buttons-container {
          flex-direction: row;
          flex-wrap: wrap;
        }

        .social-login-buttons.horizontal .social-button {
          flex: 1;
          min-width: 150px;
        }

        .social-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border: 2px solid;
          border-radius: 8px;
          background: white;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .social-button:hover:not(:disabled) {
          background: #f9fafb;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .social-button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }

        .social-icon {
          font-size: 1.5rem;
          line-height: 1;
        }

        .social-label {
          font-size: 0.9375rem;
        }

        @media (max-width: 640px) {
          .social-login-buttons.horizontal .social-buttons-container {
            flex-direction: column;
          }

          .social-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
