import React, { useState } from 'react';
import { EmailLogin } from '../components/EmailLogin';
import { SocialLoginButtons } from '../components/SocialLoginButtons';
import { EmailVerification } from '../components/EmailVerification';
import { useAuth } from '../context/AuthContext';
import { AuthAnalyticsService } from '../services/auth-analytics-service';
import { SocialProvider } from '../services/social-auth-service';
import { logger } from '../utils/logger';

type AuthView = 'login' | 'verification';

/**
 * AuthPage - Main authentication page with email and social login
 *
 * Features:
 * - Email login form
 * - Social login buttons (Google, X, Discord, GitHub)
 * - Email verification flow
 * - Analytics tracking
 * - Error handling
 */
export const AuthPage: React.FC = () => {
  const [authView, setAuthView] = useState<AuthView>('login');
  const [verificationEmail, setVerificationEmail] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, user } = useAuth();
  const authAnalytics = AuthAnalyticsService.getInstance();

  const handleEmailSuccess = (email: string) => {
    setVerificationEmail(email);
    setAuthView('verification');
    authAnalytics.trackEmailAuthStarted(email);
    authAnalytics.trackEmailVerificationSent(email);
    logger.info('Email authentication initiated, showing verification view');
  };

  const handleEmailError = (err: Error) => {
    setError(err.message);
    authAnalytics.trackAuthFailure('email', err.message);
    logger.error('Email authentication error:', err);
  };

  const handleSocialSuccess = (provider: SocialProvider) => {
    authAnalytics.trackSocialAuthStarted(provider);
    authAnalytics.trackSocialAuthCompleted(provider);
    logger.info(`${provider} authentication successful`);
  };

  const handleSocialError = (err: Error) => {
    setError(err.message);
    authAnalytics.trackAuthFailure('social', err.message);
    logger.error('Social authentication error:', err);
  };

  const handleVerified = () => {
    authAnalytics.trackEmailVerificationCompleted(verificationEmail);
    logger.info('Email verification completed');
  };

  const handleBackToLogin = () => {
    setAuthView('login');
    setVerificationEmail('');
    setError(null);
  };

  if (isAuthenticated) {
    return (
      <div className="auth-page authenticated">
        <div className="auth-container">
          <div className="success-icon">✓</div>
          <h2>You're Already Signed In</h2>
          <p>
            You're authenticated via{' '}
            <strong>
              {user?.method === 'email'
                ? 'Email'
                : user?.method === 'social'
                ? `${user.provider}`
                : 'Wallet'}
            </strong>
          </p>
          <button onClick={() => (window.location.href = '/')} className="home-button">
            Go to Dashboard
          </button>
        </div>

        <style>{`
          .auth-page.authenticated {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .auth-container {
            background: white;
            padding: 3rem;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 400px;
          }

          .success-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            border-radius: 50%;
            background: #10b981;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
          }

          .home-button {
            margin-top: 1.5rem;
            padding: 0.875rem 2rem;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .home-button:hover {
            background: #2563eb;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome to RenVault</h1>
          <p>Sign in to access your decentralized vault</p>
        </div>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} className="dismiss-button">
              ✕
            </button>
          </div>
        )}

        {authView === 'login' ? (
          <>
            <EmailLogin onSuccess={handleEmailSuccess} onError={handleEmailError} />
            <SocialLoginButtons
              onSuccess={handleSocialSuccess}
              onError={handleSocialError}
              layout="vertical"
            />

            <div className="wallet-option">
              <div className="divider">
                <span className="divider-line"></span>
                <span className="divider-text">Or use wallet</span>
                <span className="divider-line"></span>
              </div>
              <button className="wallet-button">
                <span className="wallet-icon">👛</span>
                Connect Wallet
              </button>
            </div>
          </>
        ) : (
          <>
            <EmailVerification
              email={verificationEmail}
              onVerified={handleVerified}
              onError={handleEmailError}
            />
            <button onClick={handleBackToLogin} className="back-button">
              ← Back to Login
            </button>
          </>
        )}

        <div className="auth-footer">
          <p>
            By signing in, you agree to our{' '}
            <a href="/terms">Terms of Service</a> and{' '}
            <a href="/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .auth-container {
          background: white;
          padding: 3rem;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          max-width: 500px;
          width: 100%;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-header h1 {
          font-size: 2rem;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .auth-header p {
          color: #6b7280;
          font-size: 1rem;
        }

        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #fee2e2;
          color: #991b1b;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .error-icon {
          font-size: 1.25rem;
        }

        .dismiss-button {
          margin-left: auto;
          background: none;
          border: none;
          color: #991b1b;
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
        }

        .wallet-option {
          margin-top: 2rem;
        }

        .divider {
          display: flex;
          align-items: center;
          margin-bottom: 1rem;
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

        .wallet-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.875rem;
          background: white;
          border: 2px solid #3b82f6;
          color: #3b82f6;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .wallet-button:hover {
          background: #eff6ff;
        }

        .wallet-icon {
          font-size: 1.5rem;
        }

        .back-button {
          width: 100%;
          padding: 0.875rem;
          background: #f3f4f6;
          color: #374151;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s;
        }

        .back-button:hover {
          background: #e5e7eb;
        }

        .auth-footer {
          margin-top: 2rem;
          text-align: center;
        }

        .auth-footer p {
          color: #6b7280;
          font-size: 0.75rem;
          line-height: 1.5;
        }

        .auth-footer a {
          color: #3b82f6;
          text-decoration: none;
        }

        .auth-footer a:hover {
          text-decoration: underline;
        }

        @media (max-width: 640px) {
          .auth-container {
            padding: 2rem 1.5rem;
          }

          .auth-header h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};
