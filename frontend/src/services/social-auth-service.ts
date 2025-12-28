import { logger } from '../utils/logger';
import { WalletError, WalletErrorCode } from '../utils/wallet-errors';
import { AppKitService } from './appkit-service';

export type SocialProvider = 'google' | 'x' | 'discord' | 'github';

export interface SocialAuthResult {
  provider: SocialProvider;
  userId: string;
  email?: string;
  name?: string;
  avatar?: string;
}

/**
 * SocialAuthService - Handles social authentication (Google, X, Discord, GitHub)
 *
 * Features:
 * - Google authentication
 * - Twitter/X authentication
 * - Discord authentication
 * - GitHub authentication
 */
export class SocialAuthService {
  private static instance: SocialAuthService;
  private appKitService: AppKitService;
  private supportedProviders: SocialProvider[] = ['google', 'x', 'discord', 'github'];

  private constructor(appKitService: AppKitService) {
    this.appKitService = appKitService;
  }

  static getInstance(): SocialAuthService {
    if (!SocialAuthService.instance) {
      const appKitService = AppKitService.getInstance();
      SocialAuthService.instance = new SocialAuthService(appKitService);
    }
    return SocialAuthService.instance;
  }

  /**
   * Check if a provider is supported
   */
  isProviderSupported(provider: string): provider is SocialProvider {
    return this.supportedProviders.includes(provider as SocialProvider);
  }

  /**
   * Authenticate with a social provider
   */
  async authenticateWithSocial(provider: SocialProvider): Promise<void> {
    try {
      if (!this.isProviderSupported(provider)) {
        throw new WalletError(
          WalletErrorCode.INVALID_REQUEST,
          `Unsupported social provider: ${provider}`
        );
      }

      logger.info(`Initiating ${provider} authentication`);

      // AppKit handles social authentication flow
      await this.appKitService.openModal();

      logger.info(`${provider} authentication initiated successfully`);
    } catch (error) {
      logger.error(`${provider} authentication failed:`, error);
      throw new WalletError(
        WalletErrorCode.WALLET_AUTH_FAILED,
        `Failed to authenticate with ${provider}`,
        error
      );
    }
  }

  /**
   * Authenticate with Google
   */
  async authenticateWithGoogle(): Promise<void> {
    return this.authenticateWithSocial('google');
  }

  /**
   * Authenticate with Twitter/X
   */
  async authenticateWithX(): Promise<void> {
    return this.authenticateWithSocial('x');
  }

  /**
   * Authenticate with Discord
   */
  async authenticateWithDiscord(): Promise<void> {
    return this.authenticateWithSocial('discord');
  }

  /**
   * Authenticate with GitHub
   */
  async authenticateWithGitHub(): Promise<void> {
    return this.authenticateWithSocial('github');
  }

  /**
   * Handle social authentication callback
   */
  async handleSocialCallback(
    provider: SocialProvider,
    code: string
  ): Promise<SocialAuthResult | null> {
    try {
      if (!this.isProviderSupported(provider)) {
        throw new WalletError(
          WalletErrorCode.INVALID_REQUEST,
          `Unsupported social provider: ${provider}`
        );
      }

      if (!code || code.trim() === '') {
        throw new WalletError(
          WalletErrorCode.INVALID_REQUEST,
          'Invalid authorization code'
        );
      }

      logger.info(`Processing ${provider} callback`);

      // AppKit handles the OAuth flow internally
      // Return mock result for now - AppKit manages the actual authentication
      const result: SocialAuthResult = {
        provider,
        userId: 'user-id',
        email: undefined,
        name: undefined,
        avatar: undefined,
      };

      logger.info(`${provider} callback processed successfully`);
      return result;
    } catch (error) {
      logger.error(`${provider} callback failed:`, error);
      throw new WalletError(
        WalletErrorCode.WALLET_AUTH_FAILED,
        `Failed to process ${provider} callback`,
        error
      );
    }
  }

  /**
   * Get current social authentication status
   */
  async getSocialAuthStatus(): Promise<{
    isAuthenticated: boolean;
    provider?: SocialProvider;
  }> {
    try {
      // AppKit manages authentication state
      return {
        isAuthenticated: false,
        provider: undefined,
      };
    } catch (error) {
      logger.error('Failed to get social auth status:', error);
      return {
        isAuthenticated: false,
        provider: undefined,
      };
    }
  }

  /**
   * Logout from social authentication
   */
  async logout(): Promise<void> {
    try {
      logger.info('Logging out from social authentication');
      await this.appKitService.disconnect();
      logger.info('Social logout successful');
    } catch (error) {
      logger.error('Social logout failed:', error);
      throw new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to logout',
        error
      );
    }
  }

  /**
   * Get list of supported providers
   */
  getSupportedProviders(): SocialProvider[] {
    return [...this.supportedProviders];
  }
}
