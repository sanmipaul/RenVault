/**
 * Authentication Module Exports
 *
 * Centralized exports for all authentication-related functionality
 */

// Services
export { EmailAuthService } from '../services/email-auth-service';
export { SocialAuthService } from '../services/social-auth-service';
export { AuthAnalyticsService } from '../services/auth-analytics-service';

// Components
export { EmailLogin } from '../components/EmailLogin';
export { EmailVerification } from '../components/EmailVerification';
export { SocialLoginButtons } from '../components/SocialLoginButtons';
export { MagicLinkHandler } from '../components/MagicLinkHandler';

// Pages
export { AuthPage } from '../pages/AuthPage';

// Context
export { AuthProvider, useAuth } from '../context/AuthContext';
export type { AuthContextType, AuthUser } from '../context/AuthContext';

// Types
export type {
  AuthMethod,
  SocialProvider,
  EmailAuthConfig,
  SocialAuthConfig,
  AuthState,
  AuthSession,
  MagicLinkToken,
  OAuthCallbackData,
  AuthAnalyticsEvent,
  AuthError,
  EmailVerificationState,
  SocialAuthResult,
  AuthProviderConfig,
} from '../types/auth';

export { DEFAULT_AUTH_CONFIG } from '../types/auth';
