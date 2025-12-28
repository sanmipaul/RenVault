/**
 * Authentication Testing Utilities
 *
 * Helper functions and mocks for testing authentication functionality
 */

import { AuthUser, AuthMethod, SocialProvider } from '../types/auth';

/**
 * Create a mock authenticated user
 */
export const createMockAuthUser = (
  method: AuthMethod = 'email',
  options?: Partial<AuthUser>
): AuthUser => {
  const baseUser: AuthUser = {
    method,
    isVerified: true,
  };

  if (method === 'email') {
    return {
      ...baseUser,
      email: 'test@example.com',
      ...options,
    };
  }

  if (method === 'social') {
    return {
      ...baseUser,
      provider: 'google' as SocialProvider,
      displayName: 'Test User',
      ...options,
    };
  }

  return { ...baseUser, ...options };
};

/**
 * Mock email validation
 */
export const mockEmailValidation = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Mock magic link token generation
 */
export const generateMockMagicLinkToken = (): string => {
  return `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mock OAuth authorization code
 */
export const generateMockOAuthCode = (): string => {
  return `mock_oauth_code_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Mock authentication delay (simulates network request)
 */
export const mockAuthDelay = (ms: number = 1000): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Test email addresses
 */
export const TEST_EMAILS = {
  valid: 'test@example.com',
  invalid: 'invalid-email',
  disposable: 'test@tempmail.com',
  corporate: 'user@company.com',
};

/**
 * Test social providers
 */
export const TEST_PROVIDERS: SocialProvider[] = ['google', 'x', 'discord', 'github'];

/**
 * Mock authentication error
 */
export class MockAuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public method?: AuthMethod,
    public provider?: SocialProvider
  ) {
    super(message);
    this.name = 'MockAuthError';
  }
}

/**
 * Create mock authentication errors
 */
export const createMockAuthError = (
  type: 'invalid_email' | 'expired_token' | 'network_error' | 'provider_error'
): MockAuthError => {
  switch (type) {
    case 'invalid_email':
      return new MockAuthError('Invalid email format', 'INVALID_EMAIL', 'email');
    case 'expired_token':
      return new MockAuthError('Magic link expired', 'EXPIRED_TOKEN', 'email');
    case 'network_error':
      return new MockAuthError('Network request failed', 'NETWORK_ERROR');
    case 'provider_error':
      return new MockAuthError('Provider authentication failed', 'PROVIDER_ERROR', 'social', 'google');
    default:
      return new MockAuthError('Unknown error', 'UNKNOWN_ERROR');
  }
};

/**
 * Mock localStorage for testing
 */
export const createMockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

/**
 * Assert email is valid
 */
export const assertValidEmail = (email: string): void => {
  if (!mockEmailValidation(email)) {
    throw new Error(`Invalid email format: ${email}`);
  }
};

/**
 * Assert provider is supported
 */
export const assertSupportedProvider = (provider: string): asserts provider is SocialProvider => {
  if (!TEST_PROVIDERS.includes(provider as SocialProvider)) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
};

/**
 * Mock analytics tracking
 */
export const createMockAnalytics = () => {
  const events: Array<{ eventName: string; properties: any }> = [];

  return {
    trackEvent: (eventName: string, properties: any) => {
      events.push({ eventName, properties });
    },
    getEvents: () => events,
    clearEvents: () => {
      events.length = 0;
    },
    getEventCount: () => events.length,
    hasEvent: (eventName: string) => events.some((e) => e.eventName === eventName),
  };
};

/**
 * Wait for authentication state change
 */
export const waitForAuthStateChange = async (
  checkFn: () => boolean,
  timeoutMs: number = 5000
): Promise<void> => {
  const startTime = Date.now();

  while (!checkFn()) {
    if (Date.now() - startTime > timeoutMs) {
      throw new Error('Timeout waiting for auth state change');
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

/**
 * Mock session data
 */
export const createMockSession = (method: AuthMethod = 'email') => {
  return {
    id: `session_${Date.now()}`,
    userId: `user_${Date.now()}`,
    method,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    lastActivity: Date.now(),
  };
};
