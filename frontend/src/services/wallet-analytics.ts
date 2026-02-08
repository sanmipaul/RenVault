export class WalletAnalytics {
  private events: any[] = [];

  trackConnection(walletType: string, success: boolean, duration: number) {
    this.events.push({
      type: 'CONNECTION',
      walletType,
      success,
      duration,
      timestamp: Date.now()
    });
  }

  trackDisconnection(walletType: string, reason: string) {
    this.events.push({
      type: 'DISCONNECTION',
      walletType,
      reason,
      timestamp: Date.now()
    });
  }

  trackTransaction(txType: string, amount: number, success: boolean) {
    this.events.push({
      type: 'TRANSACTION',
      txType,
      amount,
      success,
      timestamp: Date.now()
    });
  }

  getConnectionStats() {
    const connections = this.events.filter(e => e.type === 'CONNECTION');
    const successful = connections.filter(e => e.success).length;
    const avgDuration = connections.reduce((sum, e) => sum + e.duration, 0) / connections.length;

    return {
      total: connections.length,
      successful,
      failed: connections.length - successful,
      avgDuration: avgDuration || 0
    };
  }

  getMostUsedWallet() {
    const walletCounts = new Map<string, number>();
    this.events.filter(e => e.type === 'CONNECTION' && e.success).forEach(e => {
      walletCounts.set(e.walletType, (walletCounts.get(e.walletType) || 0) + 1);
    });

    let maxWallet = '';
    let maxCount = 0;
    for (const [wallet, count] of walletCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        maxWallet = wallet;
      }
    }
    return maxWallet;
  }

  exportData() {
    return JSON.stringify(this.events);
  }
}

export const walletAnalytics = new WalletAnalytics();
