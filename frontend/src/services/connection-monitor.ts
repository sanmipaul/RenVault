export class ConnectionMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  private isHealthy = true;
  private lastCheck = Date.now();

  startMonitoring(intervalMs: number = 30000) {
    this.stopMonitoring();
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private async performHealthCheck() {
    try {
      const connected = await this.checkConnection();
      this.isHealthy = connected;
      this.lastCheck = Date.now();
    } catch (error) {
      this.isHealthy = false;
      console.error('Health check failed:', error);
    }
  }

  private async checkConnection(): Promise<boolean> {
    // Implement actual connection check
    return true;
  }

  getHealthStatus() {
    return {
      healthy: this.isHealthy,
      lastCheck: this.lastCheck,
      timeSinceCheck: Date.now() - this.lastCheck
    };
  }

  isConnectionHealthy(): boolean {
    return this.isHealthy;
  }
}

export const connectionMonitor = new ConnectionMonitor();
