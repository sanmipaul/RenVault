/**
 * Email Authentication Types
 * Types and interfaces for email-based authentication with Reown AppKit
 */

/**
 * Email authentication status
 */
export type EmailAuthStatus =
  | 'idle'
  | 'sending'
  | 'sent'
  | 'verifying'
  | 'verified'
  | 'error'
  | 'expired';

/**
 * Email verification state
 */
export interface EmailVerificationState {
  status: EmailAuthStatus;
  email: string | null;
  sentAt: number | null;
  expiresAt: number | null;
  error: string | null;
  attemptCount: number;
}

/**
 * Email login request
 */
export interface EmailLoginRequest {
  email: string;
  redirectUrl?: string;
}

/**
 * Email verification request
 */
export interface EmailVerificationRequest {
  email: string;
  token: string;
}

/**
 * Email authentication result
 */
export interface EmailAuthResult {
  success: boolean;
  email: string;
  address?: string;
  error?: string;
  authMethod: 'email';
}

/**
 * Magic link configuration
 */
export interface MagicLinkConfig {
  expirySeconds: number;
  maxAttempts: number;
  cooldownSeconds: number;
  redirectUrl: string;
}

/**
 * Email input validation result
 */
export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Email authentication events
 */
export type EmailAuthEvent =
  | { type: 'SEND_MAGIC_LINK'; email: string }
  | { type: 'MAGIC_LINK_SENT'; email: string; expiresAt: number }
  | { type: 'VERIFY_EMAIL'; token: string }
  | { type: 'EMAIL_VERIFIED'; email: string; address: string }
  | { type: 'EMAIL_AUTH_ERROR'; error: string }
  | { type: 'MAGIC_LINK_EXPIRED' }
  | { type: 'RESEND_MAGIC_LINK'; email: string }
  | { type: 'CANCEL_EMAIL_AUTH' };

/**
 * Email auth session data stored locally
 */
export interface EmailAuthSession {
  email: string;
  address: string;
  connectedAt: number;
  lastActive: number;
  authMethod: 'email';
}

/**
 * Default magic link configuration
 */
export const DEFAULT_MAGIC_LINK_CONFIG: MagicLinkConfig = {
  expirySeconds: 900, // 15 minutes
  maxAttempts: 3,
  cooldownSeconds: 60,
  redirectUrl: typeof window !== 'undefined' ? window.location.origin : '',
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): EmailValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true };
};

/**
 * Initial email verification state
 */
export const initialEmailVerificationState: EmailVerificationState = {
  status: 'idle',
  email: null,
  sentAt: null,
  expiresAt: null,
  error: null,
  attemptCount: 0,
};
