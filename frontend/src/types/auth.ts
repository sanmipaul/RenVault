/**
 * Authentication Type Definitions
 */

export type AuthMethod = 'wallet' | 'email' | 'social';

export type SocialProvider = 'google' | 'x' | 'discord' | 'github';

export interface AuthUser {
  method: AuthMethod;
  email?: string;
  provider?: SocialProvider;
  isVerified: boolean;
  userId?: string;
  displayName?: string;
  avatar?: string;
}

export interface EmailAuthConfig {
  validateEmail: boolean;
  requireVerification: boolean;
  magicLinkExpiry: number; // in milliseconds
  resendCooldown: number; // in seconds
}

export interface SocialAuthConfig {
  enabledProviders: SocialProvider[];
  callbackUrl: string;
  scope?: Record<SocialProvider, string[]>;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
}

export interface AuthSession {
  id: string;
  userId: string;
  method: AuthMethod;
  provider?: SocialProvider;
  createdAt: number;
  expiresAt: number;
  lastActivity: number;
}

export interface MagicLinkToken {
  token: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  used: boolean;
}

export interface OAuthCallbackData {
  code: string;
  state: string;
  provider: SocialProvider;
}

export interface AuthAnalyticsEvent {
  eventName: string;
  authMethod?: AuthMethod;
  provider?: SocialProvider;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface AuthError extends Error {
  code: string;
  method?: AuthMethod;
  provider?: SocialProvider;
  recoverable: boolean;
}

export interface EmailVerificationState {
  email: string;
  isVerified: boolean;
  verificationSentAt?: number;
  canResend: boolean;
  resendCooldownRemaining: number;
}

export interface SocialAuthResult {
  provider: SocialProvider;
  userId: string;
  email?: string;
  name?: string;
  avatar?: string;
  accessToken?: string;
}

export interface AuthProviderConfig {
  emailConfig: EmailAuthConfig;
  socialConfig: SocialAuthConfig;
  sessionTimeout: number; // in milliseconds
  enableAnalytics: boolean;
}

export const DEFAULT_AUTH_CONFIG: AuthProviderConfig = {
  emailConfig: {
    validateEmail: true,
    requireVerification: true,
    magicLinkExpiry: 30 * 60 * 1000, // 30 minutes
    resendCooldown: 60, // 60 seconds
  },
  socialConfig: {
    enabledProviders: ['google', 'x', 'discord', 'github'],
    callbackUrl: '/auth/callback',
    scope: {
      google: ['email', 'profile'],
      x: ['users.read'],
      discord: ['identify', 'email'],
      github: ['user:email'],
    },
  },
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  enableAnalytics: true,
};
