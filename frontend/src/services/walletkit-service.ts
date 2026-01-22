import { createAppKit } from '@reown/appkit';
import { StacksAdapter } from '@reown/appkit-adapter-stacks'; // assuming it exists, or use built-in
import { CoreService } from './core-service';
import { walletConnectConfig } from '../config/walletconnect';
import { logger } from '../utils/logger';
import { WalletError, WalletErrorCode, isNetworkError, isUserRejectedError } from '../utils/wallet-errors';
import { walletKitSigningService } from './walletkit-signing';

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

      // For Stacks, AppKit has built-in support
      const stacksAdapter = new StacksAdapter();

      const appKit = createAppKit({
        adapters: [stacksAdapter],
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

  // AppKit handles sessions internally, so these methods change
  async openModal() {
    this.appKit.open();
  }

  async closeModal() {
    this.appKit.close();
  }

  getActiveSessions() {
    // AppKit manages sessions differently
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

  // WalletKitService wrapper to provide backward-compatible API and Sign API v2 exposure
  export class WalletKitService {
    private static instance: WalletKitService;
    private appKitService: AppKitService | null = null;

    private static readonly MAX_RETRIES = 3;
    private static readonly INIT_RETRY_DELAY = 1000;

    private constructor(appKitService: AppKitService | null) {
      this.appKitService = appKitService;
    }

    static async init(retryCount = 0): Promise<WalletKitService> {
      if (WalletKitService.instance) return WalletKitService.instance;

      try {
        const appKit = await AppKitService.init();
        WalletKitService.instance = new WalletKitService(appKit);
        return WalletKitService.instance;
      } catch (error) {
        const isNetworkIssue = isNetworkError(error);
        const shouldRetry = isNetworkIssue && retryCount < WalletKitService.MAX_RETRIES;
        if (shouldRetry) {
          const delay = WalletKitService.INIT_RETRY_DELAY * Math.pow(2, retryCount);
          logger.warn(`WalletKit init attempt ${retryCount + 1} failed, retrying in ${delay}ms...`, error);
          await new Promise(resolve => setTimeout(resolve, delay));
          return WalletKitService.init(retryCount + 1);
        }

        throw new WalletError(WalletErrorCode.WALLET_INIT_FAILED, 'Failed to initialize WalletKitService', error);
      }
    }

    static getInstance(): WalletKitService {
      if (!WalletKitService.instance) throw new Error('WalletKitService not initialized. Call init() first.');
      return WalletKitService.instance;
    }

    getAppKit(): any | null {
      return this.appKitService ? this.appKitService.getAppKit() : null;
    }

    // Delegate modal controls to AppKit
    async openModal() {
      this.appKitService?.openModal?.();
    }

    async closeModal() {
      this.appKitService?.closeModal?.();
    }

    // Sign API v2 methods - delegate to walletkit-signing service which falls back as needed
    async signTransactions(request: any) {
      return walletKitSigningService.signTransactions(request);
    }

    async signTypedData(request: any) {
      return walletKitSigningService.signTypedData(request);
    }

    async signMessage(request: any) {
      return walletKitSigningService.signMessage(request);
    }

    async signWithHardware(request: any) {
      return walletKitSigningService.signWithHardware(request);
    }

    async verifySignature(request: any) {
      return walletKitSigningService.verifySignature(request);
    }

    async initiateMultiSig(request: any) {
      return walletKitSigningService.initiateMultiSig(request);
    }

    async addMultiSigSignature(transactionId: string, signer: string, signature: any) {
      return walletKitSigningService.addMultiSigSignature(transactionId, signer, signature);
    }

    async getActiveSessions() {
      return this.appKitService?.getActiveSessions?.() ?? [];
    }

    async disconnectSession(topic: string) {
      try {
        return await this.appKitService?.disconnect?.();
      } catch (error) {
        if (isUserRejectedError(error)) {
          logger.info('User cancelled disconnection');
          return false;
        }
        throw new WalletError(WalletErrorCode.UNKNOWN_ERROR, 'Failed to disconnect session', error);
      }
    }

    static reset() {
      if (WalletKitService.instance) {
        try {
          WalletKitService.instance.getActiveSessions()
            .then((sessions: any) => {
              Object.keys(sessions || {}).forEach((topic: string) => {
                WalletKitService.instance?.disconnectSession(topic).catch((err: any) => {
                  logger.warn('Error disconnecting session during reset:', err);
                });
              });
            })
            .catch((err: any) => {
              logger.warn('Error getting active sessions during reset:', err);
            });
        } catch (error) {
          logger.warn('Error during wallet service reset:', error);
        } finally {
          WalletKitService.instance = null as any;
        }
      }
    }
  }
