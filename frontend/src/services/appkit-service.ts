import { createAppKit } from '@reown/appkit';
import { CoreService } from './core-service';
import { walletConnectConfig } from '../config/walletconnect';
import { logger } from '../utils/logger';
import { WalletError, WalletErrorCode, isNetworkError } from '../utils/wallet-errors';
import { AppKitConfig, StacksNetwork } from '../types/appkit';

/**
 * Supported social login providers
 */
export type SocialProvider = 'google' | 'x' | 'discord' | 'github' | 'apple' | 'facebook';

/**
 * Authentication method types
 */
export type AuthMethod = 'wallet' | 'email' | 'social';

/**
 * Email/Social authentication configuration
 */
export interface EmailSocialAuthConfig {
  email: {
    enabled: boolean;
    verificationRequired: boolean;
    magicLinkExpiry: number; // in seconds
  };
  social: {
    enabled: boolean;
    providers: SocialProvider[];
  };
}

/**
 * Default email/social auth configuration
 */
export const defaultEmailSocialConfig: EmailSocialAuthConfig = {
  email: {
    enabled: true,
    verificationRequired: true,
    magicLinkExpiry: 900, // 15 minutes
  },
  social: {
    enabled: true,
    providers: ['google', 'x', 'discord', 'github'],
  },
};

/**
 * AppKitService - Migrated from WalletKit to AppKit for enhanced UI/UX
 *
 * This service provides a complete wallet connection UI with:
 * - Pre-built, customizable wallet connection modals
 * - Multi-chain support (currently configured for Stacks)
 * - Better mobile wallet integration
 * - Account management UI components
 * - Network switching capabilities
 * - Email and Social login support (NEW)
 * - Improved developer experience
 */
export class AppKitService {
  private static instance: AppKitService;
  private appKit: ReturnType<typeof createAppKit>;
  private authConfig: EmailSocialAuthConfig;

  private constructor(
    appKit: ReturnType<typeof createAppKit>,
    authConfig: EmailSocialAuthConfig = defaultEmailSocialConfig
  ) {
    this.appKit = appKit;
    this.authConfig = authConfig;
  }

  private static readonly MAX_RETRIES = 3;
  private static readonly INIT_RETRY_DELAY = 1000; // 1 second

  static async init(
    retryCount = 0,
    authConfig: EmailSocialAuthConfig = defaultEmailSocialConfig
  ): Promise<AppKitService> {
    if (AppKitService.instance) {
      return AppKitService.instance;
    }

    // Validate configuration before initialization
    if (!walletConnectConfig.projectId) {
      throw new WalletError(
        WalletErrorCode.CONFIGURATION_ERROR,
        'WalletConnect project ID is required'
      );
    }

    try {
      logger.info('Initializing AppKit with email/social login support...');
      const core = CoreService.getInstance();

      const appKit = createAppKit({
        networks: [
          {
            id: 'stacks:1',
            name: 'Stacks Mainnet',
            network: 'stacks',
            nativeCurrency: {
              name: 'STX',
              symbol: 'STX',
              decimals: 6,
            },
            rpcUrls: {
              default: { http: ['https://api.mainnet.stacks.co'] },
            },
            blockExplorers: {
              default: { name: 'Stacks Explorer', url: 'https://explorer.stacks.co' },
            },
          },
        ],
        metadata: walletConnectConfig.metadata,
        projectId: walletConnectConfig.projectId,
        themeMode: walletConnectConfig.appKit.themeMode,
        themeVariables: walletConnectConfig.appKit.themeVariables,
        termsConditionsUrl: walletConnectConfig.termsConditionsUrl,
        privacyPolicyUrl: walletConnectConfig.privacyPolicyUrl,
        featuredWalletIds: ['hiro', 'leather', 'xverse'],
        features: {
          analytics: true,
          // Enable email login for Web2 users
          email: authConfig.email.enabled,
          // Enable social login with specified providers
          socials: authConfig.social.enabled ? authConfig.social.providers : false,
          history: true,
          onramp: true,
          swaps: true,
          sponsoredTransactions: true,
        },
        enableWalletConnect: true,
        enableInjected: true,
        enableEIP6963: true,
        enableCoinbase: true,
      });

      AppKitService.instance = new AppKitService(appKit, authConfig);
      logger.info('AppKit initialized successfully with email/social login enabled');
      logger.info(`Email login: ${authConfig.email.enabled ? 'enabled' : 'disabled'}`);
      logger.info(
        `Social login: ${authConfig.social.enabled ? authConfig.social.providers.join(', ') : 'disabled'}`
      );
      return AppKitService.instance;
    } catch (error) {
      const isNetworkIssue = isNetworkError(error);
      const shouldRetry = isNetworkIssue && retryCount < AppKitService.MAX_RETRIES;

      if (shouldRetry) {
        const delay = AppKitService.INIT_RETRY_DELAY * Math.pow(2, retryCount);
        logger.warn(`AppKit init attempt ${retryCount + 1} failed, retrying in ${delay}ms...`, error);

        await new Promise((resolve) => setTimeout(resolve, delay));
        return AppKitService.init(retryCount + 1, authConfig);
      }

      const walletError = new WalletError(
        WalletErrorCode.WALLET_INIT_FAILED,
        'Failed to initialize wallet service'
      );

      logger.error('Failed to initialize AppKit', walletError);
      throw walletError;
    }
  }

  static getInstance(): AppKitService {
    if (!AppKitService.instance) {
      throw new Error('AppKitService not initialized. Call init() first.');
    }
    return AppKitService.instance;
  }

  public getAppKit(): ReturnType<typeof createAppKit> {
    return this.appKit;
  }

  /**
   * Get current authentication configuration
   */
  public getAuthConfig(): EmailSocialAuthConfig {
    return this.authConfig;
  }

  /**
   * Check if email login is enabled
   */
  public isEmailEnabled(): boolean {
    return this.authConfig.email.enabled;
  }

  /**
   * Check if social login is enabled
   */
  public isSocialEnabled(): boolean {
    return this.authConfig.social.enabled;
  }

  /**
   * Get enabled social providers
   */
  public getEnabledSocialProviders(): SocialProvider[] {
    return this.authConfig.social.enabled ? this.authConfig.social.providers : [];
  }

  async openModal() {
    try {
      await this.appKit.open();
    } catch (error) {
      throw new WalletError(WalletErrorCode.MODAL_OPEN_FAILED, 'Failed to open wallet modal');
    }
  }

  /**
   * Open modal with specific view (connect, account, etc.)
   */
  async openModalWithView(view: 'Connect' | 'Account' | 'Networks') {
    try {
      await this.appKit.open({ view });
    } catch (error) {
      throw new WalletError(
        WalletErrorCode.MODAL_OPEN_FAILED,
        `Failed to open modal with view: ${view}`
      );
    }
  }

  async closeModal() {
    try {
      await this.appKit.close();
    } catch (error) {
      logger.warn('Error closing modal:', error);
    }
  }

  getActiveSessions() {
    try {
      return this.appKit.getActiveSessions ? this.appKit.getActiveSessions() : [];
    } catch (error) {
      logger.warn('Error getting active sessions:', error);
      return [];
    }
  }

  /**
   * Get current authentication method
   */
  getCurrentAuthMethod(): AuthMethod | null {
    try {
      const sessions = this.getActiveSessions();
      if (!sessions || sessions.length === 0) {
        return null;
      }
      // Determine auth method from session data
      // This is a simplified implementation
      return 'wallet';
    } catch (error) {
      logger.warn('Error determining auth method:', error);
      return null;
    }
  }

  async disconnect() {
    try {
      await this.appKit.disconnect();
      logger.info('Successfully disconnected from wallet');
    } catch (error) {
      const walletError = new WalletError(WalletErrorCode.UNKNOWN_ERROR, 'Failed to disconnect');
      logger.error('Disconnect error:', walletError);
      throw walletError;
    }
  }

  static reset() {
    if (AppKitService.instance) {
      try {
        AppKitService.instance.disconnect().catch((err) => {
          logger.warn('Error disconnecting during reset:', err);
        });
      } catch (error) {
        logger.warn('Error during wallet service reset:', error);
      } finally {
        AppKitService.instance = null as any;
      }
    }
  }
}
