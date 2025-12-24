import { Core } from '@walletconnect/core';
import { environment } from '../config/environment';
import { logger } from '../utils/logger';

export class CoreService {
  private static instance: Core;

  static getInstance(): Core {
    if (!CoreService.instance) {
      CoreService.instance = CoreService.createCore();
    }
    return CoreService.instance;
  }

  private static createCore(): Core {
    try {
      logger.info('Initializing WalletConnect Core...');
      
      const core = new Core({
        projectId: environment.walletConnect.projectId,
        relayUrl: 'wss://relay.walletconnect.org',
      });

      logger.info('Core initialized successfully');
      return core;
    } catch (error) {
      logger.error('Failed to initialize Core', error as Error);
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
      logger.error('Error destroying Core', error as Error);
    }
  }
}

export default CoreService;
