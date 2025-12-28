import { AnalyticsService } from './analytics-service';
import { logger } from '../utils/logger';
import { AuthMethod } from '../context/AuthContext';
import { SocialProvider } from './social-auth-service';

export interface AuthAnalyticsEvent {
  eventName: string;
  authMethod?: AuthMethod;
  provider?: SocialProvider;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * AuthAnalyticsService - Tracks authentication events for analytics
 *
 * Features:
 * - Email authentication analytics
 * - Social authentication analytics
 * - Authentication flow tracking
 * - Error tracking
 */
export class AuthAnalyticsService {
  private static instance: AuthAnalyticsService;
  private analyticsService: AnalyticsService;

  private constructor() {
    this.analyticsService = AnalyticsService.getInstance();
  }

  static getInstance(): AuthAnalyticsService {
    if (!AuthAnalyticsService.instance) {
      AuthAnalyticsService.instance = new AuthAnalyticsService();
    }
    return AuthAnalyticsService.instance;
  }

  /**
   * Track email authentication started
   */
  trackEmailAuthStarted(email: string): void {
    try {
      const event: AuthAnalyticsEvent = {
        eventName: 'email_auth_started',
        authMethod: 'email',
        timestamp: Date.now(),
        metadata: {
          emailDomain: email.split('@')[1],
        },
      };

      this.analyticsService.trackEvent('email_auth_started', {
        authMethod: 'email',
        emailDomain: email.split('@')[1],
      });

      logger.info('Email auth started tracked', event);
    } catch (error) {
      logger.error('Failed to track email auth started:', error);
    }
  }

  /**
   * Track email verification sent
   */
  trackEmailVerificationSent(email: string): void {
    try {
      this.analyticsService.trackEvent('email_verification_sent', {
        authMethod: 'email',
        emailDomain: email.split('@')[1],
      });

      logger.info('Email verification sent tracked');
    } catch (error) {
      logger.error('Failed to track email verification sent:', error);
    }
  }

  /**
   * Track email verification completed
   */
  trackEmailVerificationCompleted(email: string): void {
    try {
      this.analyticsService.trackEvent('email_verification_completed', {
        authMethod: 'email',
        emailDomain: email.split('@')[1],
      });

      logger.info('Email verification completed tracked');
    } catch (error) {
      logger.error('Failed to track email verification completed:', error);
    }
  }

  /**
   * Track social authentication started
   */
  trackSocialAuthStarted(provider: SocialProvider): void {
    try {
      const event: AuthAnalyticsEvent = {
        eventName: 'social_auth_started',
        authMethod: 'social',
        provider,
        timestamp: Date.now(),
      };

      this.analyticsService.trackEvent('social_auth_started', {
        authMethod: 'social',
        provider,
      });

      logger.info('Social auth started tracked', event);
    } catch (error) {
      logger.error('Failed to track social auth started:', error);
    }
  }

  /**
   * Track social authentication completed
   */
  trackSocialAuthCompleted(provider: SocialProvider, userId?: string): void {
    try {
      this.analyticsService.trackEvent('social_auth_completed', {
        authMethod: 'social',
        provider,
        hasUserId: !!userId,
      });

      logger.info('Social auth completed tracked');
    } catch (error) {
      logger.error('Failed to track social auth completed:', error);
    }
  }

  /**
   * Track authentication failure
   */
  trackAuthFailure(
    authMethod: AuthMethod,
    errorMessage: string,
    provider?: SocialProvider
  ): void {
    try {
      this.analyticsService.trackEvent('auth_failure', {
        authMethod,
        provider,
        errorMessage,
      });

      logger.info('Auth failure tracked', { authMethod, provider, errorMessage });
    } catch (error) {
      logger.error('Failed to track auth failure:', error);
    }
  }

  /**
   * Track authentication method selection
   */
  trackAuthMethodSelected(authMethod: AuthMethod, provider?: SocialProvider): void {
    try {
      this.analyticsService.trackEvent('auth_method_selected', {
        authMethod,
        provider,
      });

      logger.info('Auth method selected tracked', { authMethod, provider });
    } catch (error) {
      logger.error('Failed to track auth method selection:', error);
    }
  }

  /**
   * Track logout event
   */
  trackLogout(authMethod: AuthMethod, provider?: SocialProvider): void {
    try {
      this.analyticsService.trackEvent('user_logout', {
        authMethod,
        provider,
      });

      logger.info('Logout tracked', { authMethod, provider });
    } catch (error) {
      logger.error('Failed to track logout:', error);
    }
  }

  /**
   * Track magic link click
   */
  trackMagicLinkClick(email: string): void {
    try {
      this.analyticsService.trackEvent('magic_link_clicked', {
        authMethod: 'email',
        emailDomain: email.split('@')[1],
      });

      logger.info('Magic link click tracked');
    } catch (error) {
      logger.error('Failed to track magic link click:', error);
    }
  }

  /**
   * Track authentication session duration
   */
  trackSessionDuration(
    authMethod: AuthMethod,
    durationMs: number,
    provider?: SocialProvider
  ): void {
    try {
      this.analyticsService.trackEvent('auth_session_duration', {
        authMethod,
        provider,
        durationMs,
        durationMinutes: Math.round(durationMs / 60000),
      });

      logger.info('Session duration tracked', { authMethod, durationMs });
    } catch (error) {
      logger.error('Failed to track session duration:', error);
    }
  }

  /**
   * Get authentication analytics summary
   */
  getAuthAnalyticsSummary(): {
    totalEmailAuths: number;
    totalSocialAuths: number;
    mostUsedProvider: SocialProvider | null;
  } {
    try {
      // This would typically fetch from analytics backend
      return {
        totalEmailAuths: 0,
        totalSocialAuths: 0,
        mostUsedProvider: null,
      };
    } catch (error) {
      logger.error('Failed to get auth analytics summary:', error);
      return {
        totalEmailAuths: 0,
        totalSocialAuths: 0,
        mostUsedProvider: null,
      };
    }
  }
}
