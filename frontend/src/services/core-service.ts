import { Core } from '@walletconnect/core';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

type CoreInstance = InstanceType<typeof Core>;

export class CoreService {
  private static instance: CoreInstance;

  static getInstance(): CoreInstance {
    if (!CoreService.instance) {
      CoreService.instance = CoreService.createCore();
    }
    return CoreService.instance;
  }

  private static createCore(): CoreInstance {
    try {
      logger.info('Initializing WalletConnect Core...');

      const core = new Core({
        projectId: environment.walletConnect.projectId,
        relayUrl: 'wss://relay.walletconnect.org',
      });

      logger.info('Core initialized successfully');
      return core;
    } catch (error) {
      logger.error(`Failed to initialize Core: ${error}`);
      throw error;
    }
  }

  static async destroy() {
    try {
      if (CoreService.instance) {
        await CoreService.instance.relayer.provider.connection.close();
        CoreService.instance = null as any;
        logger.info('Core destroyed');
      }
    } catch (error) {
      logger.error(`Error destroying Core: ${error}`);
    }
  }
}

export default CoreService;
