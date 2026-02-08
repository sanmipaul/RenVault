import { sessionManager } from './wallet-session';

export class WalletAutoReconnect {
  private reconnectAttempts = 0;
  private maxAttempts = 3;
  private reconnectDelay = 2000;

  async attemptReconnect(walletType: string, address: string) {
    const session = sessionManager.getSession(address);
    if (!session) return false;

    while (this.reconnectAttempts < this.maxAttempts) {
      try {
        await this.reconnect(walletType, session);
        this.reconnectAttempts = 0;
        return true;
      } catch (error) {
        this.reconnectAttempts++;
        if (this.reconnectAttempts < this.maxAttempts) {
          await this.delay(this.reconnectDelay * this.reconnectAttempts);
        }
      }
    }
    return false;
  }

  private async reconnect(walletType: string, session: any) {
    // Implement wallet-specific reconnection logic
    console.log(`Reconnecting ${walletType}...`);
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
