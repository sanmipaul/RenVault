/**
 * Email and Social Authentication Integration Examples
 *
 * This file contains practical examples of how to integrate email and social
 * authentication into your RenVault components.
 */

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useWalletContext } from '../context/WalletProvider';
import { EmailAuthService } from '../services/email-auth-service';
import { SocialAuthService } from '../services/social-auth-service';
import { AuthAnalyticsService } from '../services/auth-analytics-service';

// ============================================================================
// Example 1: Basic Authentication Status Check
// ============================================================================

export const Example1_BasicAuthCheck: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading authentication status...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return (
    <div>
      <h2>Welcome!</h2>
      <p>Authenticated via: {user?.method}</p>
      {user?.method === 'email' && <p>Email: {user.email}</p>}
      {user?.method === 'social' && <p>Provider: {user.provider}</p>}
    </div>
  );
};

// ============================================================================
// Example 2: Protected Route Component
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Example2_ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
}) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Verifying authentication...</div>;
  }

  if (!isAuthenticated) {
    return fallback || <div>Access denied. Please sign in.</div>;
  }

  return <>{children}</>;
};

// ============================================================================
// Example 3: Custom Login Form with Multiple Methods
// ============================================================================

export const Example3_CustomLoginForm: React.FC = () => {
  const { authenticateWithEmail, authenticateWithSocial } = useAuth();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const analytics = AuthAnalyticsService.getInstance();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await authenticateWithEmail(email);
      analytics.trackEmailAuthStarted(email);
      alert('Check your email for magic link!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      analytics.trackAuthFailure('email', String(err));
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'x' | 'discord' | 'github') => {
    try {
      await authenticateWithSocial(provider);
      analytics.trackSocialAuthStarted(provider);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      analytics.trackAuthFailure('social', String(err), provider);
    }
  };

  return (
    <div>
      <h2>Sign In</h2>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit">Sign in with Email</button>
      </form>

      <div>
        <button onClick={() => handleSocialLogin('google')}>Sign in with Google</button>
        <button onClick={() => handleSocialLogin('x')}>Sign in with X</button>
        <button onClick={() => handleSocialLogin('discord')}>Sign in with Discord</button>
        <button onClick={() => handleSocialLogin('github')}>Sign in with GitHub</button>
      </div>
    </div>
  );
};

// ============================================================================
// Example 4: User Profile with Auth Method Display
// ============================================================================

export const Example4_UserProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const analytics = AuthAnalyticsService.getInstance();

  const handleLogout = async () => {
    try {
      if (user) {
        analytics.trackLogout(user.method, user.provider);
      }
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (!user) {
    return <div>Not signed in</div>;
  }

  return (
    <div>
      <h2>User Profile</h2>
      <dl>
        <dt>Authentication Method:</dt>
        <dd>{user.method}</dd>

        {user.method === 'email' && (
          <>
            <dt>Email:</dt>
            <dd>{user.email}</dd>
            <dt>Verified:</dt>
            <dd>{user.isVerified ? 'Yes' : 'No'}</dd>
          </>
        )}

        {user.method === 'social' && (
          <>
            <dt>Provider:</dt>
            <dd>{user.provider}</dd>
            {user.displayName && (
              <>
                <dt>Name:</dt>
                <dd>{user.displayName}</dd>
              </>
            )}
          </>
        )}
      </dl>

      <button onClick={handleLogout}>Sign Out</button>
    </div>
  );
};

// ============================================================================
// Example 5: Combined Wallet and Auth Context
// ============================================================================

export const Example5_CombinedAuth: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { isConnected, connectionState, authMethod, isEmailAuth, isSocialAuth } =
    useWalletContext();

  return (
    <div>
      <h2>Authentication Status</h2>

      <div>
        <h3>Auth Context</h3>
        <p>Is Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        {user && (
          <>
            <p>Method: {user.method}</p>
            {user.method === 'social' && <p>Provider: {user.provider}</p>}
          </>
        )}
      </div>

      <div>
        <h3>Wallet Context</h3>
        <p>Is Connected: {isConnected ? 'Yes' : 'No'}</p>
        <p>Auth Method: {authMethod || 'None'}</p>
        <p>Is Email Auth: {isEmailAuth ? 'Yes' : 'No'}</p>
        <p>Is Social Auth: {isSocialAuth ? 'Yes' : 'No'}</p>
        {connectionState && <p>Address: {connectionState.address}</p>}
      </div>
    </div>
  );
};

// ============================================================================
// Example 6: Email Verification Flow
// ============================================================================

export const Example6_EmailVerificationFlow: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [step, setStep] = React.useState<'input' | 'verify'>('input');
  const emailAuth = EmailAuthService.getInstance();

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await emailAuth.sendVerificationEmail(email);
      setStep('verify');
    } catch (err) {
      alert('Failed to send verification email');
    }
  };

  const checkVerification = async () => {
    const isVerified = await emailAuth.isEmailVerified();
    if (isVerified) {
      alert('Email verified successfully!');
    } else {
      alert('Email not verified yet');
    }
  };

  if (step === 'input') {
    return (
      <form onSubmit={handleSendVerification}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          required
        />
        <button type="submit">Send Verification Email</button>
      </form>
    );
  }

  return (
    <div>
      <p>Check your email ({email}) for verification link</p>
      <button onClick={checkVerification}>I've verified my email</button>
      <button onClick={() => setStep('input')}>Change email</button>
    </div>
  );
};

// ============================================================================
// Example 7: Analytics Integration
// ============================================================================

export const Example7_AnalyticsIntegration: React.FC = () => {
  const analytics = AuthAnalyticsService.getInstance();
  const [summary, setSummary] = React.useState({
    totalEmailAuths: 0,
    totalSocialAuths: 0,
    mostUsedProvider: null as string | null,
  });

  React.useEffect(() => {
    const summaryData = analytics.getAuthAnalyticsSummary();
    setSummary(summaryData);
  }, []);

  const trackCustomEvent = () => {
    analytics.trackAuthMethodSelected('email');
    alert('Custom analytics event tracked!');
  };

  return (
    <div>
      <h2>Authentication Analytics</h2>
      <p>Total Email Authentications: {summary.totalEmailAuths}</p>
      <p>Total Social Authentications: {summary.totalSocialAuths}</p>
      <p>Most Used Provider: {summary.mostUsedProvider || 'N/A'}</p>
      <button onClick={trackCustomEvent}>Track Custom Event</button>
    </div>
  );
};

// ============================================================================
// Example 8: Conditional Rendering Based on Auth Method
// ============================================================================

export const Example8_ConditionalRendering: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please sign in to continue</div>;
  }

  return (
    <div>
      {user?.method === 'wallet' && (
        <div>
          <h3>Wallet User</h3>
          <p>You're using a crypto wallet to authenticate</p>
        </div>
      )}

      {user?.method === 'email' && (
        <div>
          <h3>Email User</h3>
          <p>You signed in with: {user.email}</p>
          {!user.isVerified && <p style={{ color: 'orange' }}>Please verify your email</p>}
        </div>
      )}

      {user?.method === 'social' && (
        <div>
          <h3>Social User</h3>
          <p>You signed in with: {user.provider}</p>
          {user.displayName && <p>Welcome, {user.displayName}!</p>}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// Example 9: Authentication State Monitoring
// ============================================================================

export const Example9_AuthStateMonitoring: React.FC = () => {
  const { user, isAuthenticated, checkAuthStatus } = useAuth();
  const [lastCheck, setLastCheck] = React.useState<Date | null>(null);

  const handleManualCheck = async () => {
    await checkAuthStatus();
    setLastCheck(new Date());
  };

  React.useEffect(() => {
    // Check auth status every 5 minutes
    const interval = setInterval(() => {
      checkAuthStatus();
      setLastCheck(new Date());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkAuthStatus]);

  return (
    <div>
      <h2>Auth State Monitor</h2>
      <p>Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
      {user && (
        <>
          <p>Method: {user.method}</p>
          <p>Verified: {user.isVerified ? 'Yes' : 'No'}</p>
        </>
      )}
      <p>Last Check: {lastCheck?.toLocaleTimeString() || 'Never'}</p>
      <button onClick={handleManualCheck}>Check Now</button>
    </div>
  );
};

// ============================================================================
// Example 10: Error Handling Pattern
// ============================================================================

export const Example10_ErrorHandling: React.FC = () => {
  const { authenticateWithEmail, authenticateWithSocial } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleAuth = async (type: 'email' | 'social', value: string) => {
    setLoading(true);
    setError(null);

    try {
      if (type === 'email') {
        await authenticateWithEmail(value);
      } else {
        await authenticateWithSocial(value as any);
      }
    } catch (err) {
      if (err instanceof Error) {
        // Handle specific error types
        if (err.message.includes('Invalid email')) {
          setError('Please enter a valid email address');
        } else if (err.message.includes('Network')) {
          setError('Network error. Please check your connection');
        } else {
          setError('Authentication failed. Please try again');
        }
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Authentication with Error Handling</h2>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red' }}>
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {loading && <div>Processing...</div>}

      <button onClick={() => handleAuth('email', 'test@example.com')} disabled={loading}>
        Test Email Auth
      </button>

      <button onClick={() => handleAuth('social', 'google')} disabled={loading}>
        Test Google Auth
      </button>
    </div>
  );
};
