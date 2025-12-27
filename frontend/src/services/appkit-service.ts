import { createAppKit } from '@reown/appkit';
import { CoreService } from './core-service';
import { walletConnectConfig } from '../config/walletconnect';
import { logger } from '../utils/logger';
import { WalletError, WalletErrorCode, isNetworkError } from '../utils/wallet-errors';
import { AppKitConfig, StacksNetwork } from '../types/appkit';

/**
 * AppKitService - Migrated from WalletKit to AppKit for enhanced UI/UX
 * 
 * This service provides a complete wallet connection UI with:
 * - Pre-built, customizable wallet connection modals
 * - Multi-chain support (currently configured for Stacks)
 * - Better mobile wallet integration
 * - Account management UI components
 * - Network switching capabilities
 * - Improved developer experience
 */
export class AppKitService {
  private static instance: AppKitService;
  private appKit: any; // Type from AppKit

  private constructor(appKit: any) {
    this.appKit = appKit;
  }

  private static readonly MAX_RETRIES = 3;
  private static readonly INIT_RETRY_DELAY = 1000; // 1 second

  static async init(retryCount = 0): Promise<AppKitService> {
    if (AppKitService.instance) {
      return AppKitService.instance;
    }

    try {
      logger.info('Initializing AppKit...');
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
        features: {
          analytics: true,
          email: false,
          socials: false,
          history: true,
        },
        enableWalletConnect: true,
        enableInjected: true,
        enableEIP6963: true,
        enableCoinbase: true,
      });

      AppKitService.instance = new AppKitService(appKit);
      logger.info('AppKit initialized successfully');
      return AppKitService.instance;
    } catch (error) {
      const isNetworkIssue = isNetworkError(error);
      const shouldRetry = isNetworkIssue && retryCount < AppKitService.MAX_RETRIES;

      if (shouldRetry) {
        const delay = AppKitService.INIT_RETRY_DELAY * Math.pow(2, retryCount);
        logger.warn(`AppKit init attempt ${retryCount + 1} failed, retrying in ${delay}ms...`, error);

        await new Promise(resolve => setTimeout(resolve, delay));
        return AppKitService.init(retryCount + 1);
      }

      const walletError = new WalletError(
        WalletErrorCode.WALLET_INIT_FAILED,
        'Failed to initialize wallet service',
        error
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

  public getAppKit(): any {
    return this.appKit;
  }

  async openModal() {
    this.appKit.open();
  }

  async closeModal() {
    this.appKit.close();
  }

  getActiveSessions() {
    return this.appKit.getActiveSessions ? this.appKit.getActiveSessions() : [];
  }

  async disconnect() {
    try {
      await this.appKit.disconnect();
    } catch (error) {
      throw new WalletError(
        WalletErrorCode.UNKNOWN_ERROR,
        'Failed to disconnect',
        error
      );
    }
  }

  static reset() {
    if (AppKitService.instance) {
      try {
        AppKitService.instance.disconnect().catch(err => {
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
