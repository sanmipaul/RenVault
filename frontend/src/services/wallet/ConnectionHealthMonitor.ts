export class ConnectionHealthMonitor {
  private healthChecks: Map<string, boolean> = new Map();
  private lastCheck: number = 0;

  async checkHealth(providerId: string, checkFn: () => Promise<boolean>): Promise<boolean> {
    try {
      const isHealthy = await checkFn();
      this.healthChecks.set(providerId, isHealthy);
      this.lastCheck = Date.now();
      return isHealthy;
    } catch {
      this.healthChecks.set(providerId, false);
      return false;
    }
  }

  isHealthy(providerId: string): boolean {
    return this.healthChecks.get(providerId) || false;
  }

  getLastCheckTime(): number {
    return this.lastCheck;
  }
}
