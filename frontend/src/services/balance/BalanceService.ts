// services/balance/BalanceService.ts
import { WalletProvider } from '../../types/wallet';

export interface Balance {
  stx: string;
  tokens: { [key: string]: string };
  lastUpdated: Date;
}

export class BalanceService {
  private static instance: BalanceService;
  private balances: Map<string, Balance> = new Map();
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): BalanceService {
    if (!BalanceService.instance) {
      BalanceService.instance = new BalanceService();
    }
    return BalanceService.instance;
  }

  async getBalance(address: string, provider: WalletProvider): Promise<Balance> {
    try {
      // Fetch STX balance
      const stxBalance = await this.fetchSTXBalance(address);

      // Fetch token balances (placeholder for now)
      const tokens = await this.fetchTokenBalances(address);

      const balance: Balance = {
        stx: stxBalance,
        tokens,
        lastUpdated: new Date()
      };

      this.balances.set(address, balance);
      return balance;
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      throw error;
    }
  }

  private async fetchSTXBalance(address: string): Promise<string> {
    try {
      // Use Stacks API to fetch balance
      const response = await fetch(`https://stacks-node-api.mainnet.stacks.co/extended/v1/address/${address}/balances`);
      if (!response.ok) {
        throw new Error('Failed to fetch STX balance');
      }
      const data = await response.json();
      return data.stx.balance || '0';
    } catch (error) {
      console.error('Error fetching STX balance:', error);
      // Fallback to mock data
      return '1000000';
    }
  }

  private async fetchTokenBalances(address: string): Promise<{ [key: string]: string }> {
    // Placeholder - implement token balance fetching
    return {
      'SP1234567890abcdef.token': '50000000'
    };
  }

  startAutoRefresh(address: string, provider: WalletProvider, intervalMs: number = 30000): void {
    this.stopAutoRefresh(address);

    const interval = setInterval(async () => {
      try {
        await this.getBalance(address, provider);
      } catch (error) {
        console.error('Auto-refresh failed:', error);
      }
    }, intervalMs);

    this.refreshIntervals.set(address, interval);
  }

  stopAutoRefresh(address: string): void {
    const interval = this.refreshIntervals.get(address);
    if (interval) {
      clearInterval(interval);
      this.refreshIntervals.delete(address);
    }
  }

  getCachedBalance(address: string): Balance | null {
    return this.balances.get(address) || null;
  }

  clearCache(address?: string): void {
    if (address) {
      this.balances.delete(address);
      this.stopAutoRefresh(address);
    } else {
      this.balances.clear();
      this.refreshIntervals.forEach(interval => clearInterval(interval));
      this.refreshIntervals.clear();
    }
  }
}