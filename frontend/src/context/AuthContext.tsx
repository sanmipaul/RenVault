import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EmailAuthService } from '../services/email-auth-service';
import { SocialAuthService, SocialProvider } from '../services/social-auth-service';
import { logger } from '../utils/logger';

export type AuthMethod = 'wallet' | 'email' | 'social';

export interface AuthUser {
  method: AuthMethod;
  email?: string;
  provider?: SocialProvider;
  isVerified: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authenticateWithEmail: (email: string) => Promise<void>;
  authenticateWithSocial: (provider: SocialProvider) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider - Manages email and social authentication state
 *
 * Features:
 * - Email authentication state
 * - Social authentication state
 * - Unified authentication interface
 * - Persistent session management
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const emailAuthService = EmailAuthService.getInstance();
  const socialAuthService = SocialAuthService.getInstance();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setIsLoading(true);
    try {
      // Check if user is authenticated via email
      const isEmailVerified = await emailAuthService.isEmailVerified();
      if (isEmailVerified) {
        setUser({
          method: 'email',
          isVerified: true,
        });
        return;
      }

      // Check if user is authenticated via social
      const socialStatus = await socialAuthService.getSocialAuthStatus();
      if (socialStatus.isAuthenticated && socialStatus.provider) {
        setUser({
          method: 'social',
          provider: socialStatus.provider,
          isVerified: true,
        });
        return;
      }

      // No authentication found
      setUser(null);
    } catch (error) {
      logger.error('Failed to check auth status:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithEmail = async (email: string) => {
    setIsLoading(true);
    try {
      await emailAuthService.authenticateWithEmail(email);
      setUser({
        method: 'email',
        email,
        isVerified: false,
      });
      logger.info('Email authentication initiated');
    } catch (error) {
      logger.error('Email authentication failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateWithSocial = async (provider: SocialProvider) => {
    setIsLoading(true);
    try {
      await socialAuthService.authenticateWithSocial(provider);
      setUser({
        method: 'social',
        provider,
        isVerified: false,
      });
      logger.info(`${provider} authentication initiated`);
    } catch (error) {
      logger.error(`${provider} authentication failed:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (user?.method === 'email') {
        await emailAuthService.logout();
      } else if (user?.method === 'social') {
        await socialAuthService.logout();
      }
      setUser(null);
      logger.info('User logged out successfully');
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null && user.isVerified,
    isLoading,
    authenticateWithEmail,
    authenticateWithSocial,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
