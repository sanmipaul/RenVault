import walletConnectConfig from '../config/walletconnect';
import { BalanceService } from './balance/BalanceService';

export interface OnRampOptions {
  address: string;
  amount?: string; // in microSTX or user-friendly unit depending on provider
  currency?: string; // e.g., STX
}

export class OnRampService {
  private static instance: OnRampService;
  private pollingInterval = 5000;
  private timeoutMs = 1000 * 60 * 10; // 10 minutes

  static getInstance(): OnRampService {
    if (!OnRampService.instance) {
      OnRampService.instance = new OnRampService();
    }
    return OnRampService.instance;
  }

  openOnRampWindow(opts: OnRampOptions): Window | null {
    if (!walletConnectConfig.appKit?.enabled) return null;

    const provider = process.env.REACT_APP_APPKIT_PROVIDER_URL || walletConnectConfig.appKit.providerUrl || '';
    const apiKey = walletConnectConfig.appKit.apiKey || '';

    const params = new URLSearchParams();
    if (apiKey) params.set('apiKey', apiKey);
    params.set('address', opts.address);
    if (opts.amount) params.set('amount', opts.amount);
    if (opts.currency) params.set('currency', opts.currency);

    const url = `${provider}?${params.toString()}`;
    const win = window.open(url, 'appkit_onramp', 'width=480,height=740');
    return win;
  }

  async waitForOnRampSuccess(address: string): Promise<boolean> {
    const balanceService = BalanceService.getInstance();
    const initial = (await balanceService.getCachedBalance(address)) || await balanceService.getBalance(address, null as any);
    const initialStx = parseInt(initial?.stx || '0');

    const start = Date.now();
    return new Promise<boolean>((resolve) => {
      const interval = setInterval(async () => {
        try {
          const latest = await balanceService.getBalance(address, null as any);
          const latestStx = parseInt(latest?.stx || '0');
          if (latestStx > initialStx) {
            clearInterval(interval);
            resolve(true);
          } else if (Date.now() - start > this.timeoutMs) {
            clearInterval(interval);
            resolve(false);
          }
        } catch (err) {
          // keep polling
        }
      }, this.pollingInterval);
    });
  }
}

export const onRampService = OnRampService.getInstance();
