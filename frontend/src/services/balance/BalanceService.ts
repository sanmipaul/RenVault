// services/balance/BalanceService.ts
import { WalletProvider } from '../../types/wallet';

export interface Balance {
  stx: string;
  tokens: { [key: string]: string };
  lastUpdated: Date;
  history?: BalanceHistoryEntry[];
}

export interface BalanceHistoryEntry {
  timestamp: Date;
  stx: string;
  tokens: { [key: string]: string };
}

export class BalanceService {
  private static instance: BalanceService;
  private balances: Map<string, Balance> = new Map();
  private refreshIntervals: Map<string, NodeJS.Timeout> = new Map();
  private websockets: Map<string, WebSocket> = new Map();
  private balanceCallbacks: Map<string, (balance: Balance) => void> = new Map();

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

      const newBalance: Balance = {
        stx: stxBalance,
        tokens,
        lastUpdated: new Date()
      };

      // Check for balance changes
      const oldBalance = this.balances.get(address);
      if (oldBalance) {
        this.detectBalanceChanges(address, oldBalance, newBalance);
      }

      // Maintain balance history (keep last 10 entries)
      if (oldBalance) {
        const history = oldBalance.history || [];
        history.push({
          timestamp: oldBalance.lastUpdated,
          stx: oldBalance.stx,
          tokens: { ...oldBalance.tokens }
        });
        if (history.length > 10) {
          history.shift(); // Remove oldest
        }
        newBalance.history = history;
      }

      this.balances.set(address, newBalance);
      return newBalance;
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

  startWebSocketUpdates(address: string, provider: WalletProvider, callback: (balance: Balance) => void): void {
    this.stopWebSocketUpdates(address);
    this.balanceCallbacks.set(address, callback);

    // For now, use polling as WebSocket implementation would require specific Stacks node WebSocket support
    // This is a placeholder for future WebSocket implementation
    console.log('WebSocket updates not yet implemented, using polling');
  }

  stopWebSocketUpdates(address: string): void {
    const ws = this.websockets.get(address);
    if (ws) {
      ws.close();
      this.websockets.delete(address);
    }
    this.balanceCallbacks.delete(address);
  }

  private detectBalanceChanges(address: string, oldBalance: Balance, newBalance: Balance): void {
    const stxChanged = oldBalance.stx !== newBalance.stx;
    const tokensChanged = JSON.stringify(oldBalance.tokens) !== JSON.stringify(newBalance.tokens);

    if (stxChanged || tokensChanged) {
      console.log('Balance changed for address:', address);
      // Could emit events or call callbacks here
      // For now, just log the changes
      if (stxChanged) {
        const oldStx = parseInt(oldBalance.stx) / 1000000;
        const newStx = parseInt(newBalance.stx) / 1000000;
        console.log(`STX balance changed: ${oldStx} → ${newStx}`);
      }
      if (tokensChanged) {
        console.log('Token balances changed');
      }
    }
  }
}