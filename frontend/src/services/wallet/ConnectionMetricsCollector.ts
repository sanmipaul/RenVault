export interface ConnectionStats {
  totalConnections: number;
  successfulConnections: number;
  failedConnections: number;
  averageConnectionTime: number;
  reconnections: number;
}

export class ConnectionMetricsCollector {
  private stats: ConnectionStats = {
    totalConnections: 0,
    successfulConnections: 0,
    failedConnections: 0,
    averageConnectionTime: 0,
    reconnections: 0
  };

  recordConnection(success: boolean, duration: number): void {
    this.stats.totalConnections++;
    if (success) {
      this.stats.successfulConnections++;
      this.updateAverageTime(duration);
    } else {
      this.stats.failedConnections++;
    }
  }

  recordReconnection(): void {
    this.stats.reconnections++;
  }

  private updateAverageTime(duration: number): void {
    const total = this.stats.averageConnectionTime * (this.stats.successfulConnections - 1) + duration;
    this.stats.averageConnectionTime = total / this.stats.successfulConnections;
  }

  getStats(): ConnectionStats {
    return { ...this.stats };
  }

  reset(): void {
    this.stats = { totalConnections: 0, successfulConnections: 0, failedConnections: 0, averageConnectionTime: 0, reconnections: 0 };
  }
}
