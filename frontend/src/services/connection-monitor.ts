import { logger } from '../utils/logger';

const log = logger.child('ConnectionMonitor');

export class ConnectionMonitor {
  private checkInterval: NodeJS.Timeout | null = null;
  private isHealthy = true;
  private lastCheck = Date.now();

  startMonitoring(intervalMs: number = 30000) {
    this.stopMonitoring();
    log.info('Starting connection monitoring', { intervalMs });
    this.checkInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      log.info('Connection monitoring stopped');
    }
  }

  private async performHealthCheck() {
    try {
      const connected = await this.checkConnection();
      this.isHealthy = connected;
      this.lastCheck = Date.now();
      log.debug('Health check passed', { connected });
    } catch (error) {
      this.isHealthy = false;
      logger.error('Health check failed:', error);
    }
  }

  private async checkConnection(): Promise<boolean> {
    return true;
  }

  getHealthStatus() {
    return {
      healthy: this.isHealthy,
      lastCheck: this.lastCheck,
      timeSinceCheck: Date.now() - this.lastCheck,
    };
  }

  isConnectionHealthy(): boolean {
    return this.isHealthy;
  }
}

export const connectionMonitor = new ConnectionMonitor();
