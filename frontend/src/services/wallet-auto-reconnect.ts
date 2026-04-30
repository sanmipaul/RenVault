import { sessionManager } from './wallet-session';
import { logger } from '../utils/logger';

const log = logger.child('WalletAutoReconnect');

export class WalletAutoReconnect {
  private reconnectAttempts = 0;
  private maxAttempts = 3;
  private reconnectDelay = 2000;

  async attemptReconnect(walletType: string, address: string) {
    const session = sessionManager.getSession(address);
    if (!session) {
      log.warn('No session found for address, skipping reconnect', { address });
      return false;
    }

    while (this.reconnectAttempts < this.maxAttempts) {
      try {
        await this.reconnect(walletType, session);
        log.info('Reconnect successful', { walletType, attempt: this.reconnectAttempts + 1 });
        this.reconnectAttempts = 0;
        return true;
      } catch (error) {
        this.reconnectAttempts++;
        log.warn('Reconnect attempt failed', { walletType, attempt: this.reconnectAttempts, maxAttempts: this.maxAttempts });
        if (this.reconnectAttempts < this.maxAttempts) {
          await this.delay(this.reconnectDelay * this.reconnectAttempts);
        }
      }
    }
    log.error('All reconnect attempts exhausted', undefined, { walletType, maxAttempts: this.maxAttempts });
    return false;
  }

  private async reconnect(walletType: string, session: any) {
    log.debug(`Reconnecting ${walletType}...`);
    sessionManager.updateLastActive(session.address);
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reset() {
    this.reconnectAttempts = 0;
  }
}

export const autoReconnect = new WalletAutoReconnect();
