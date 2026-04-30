export interface ReconnectionConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export class ReconnectionStrategy {
  private config: ReconnectionConfig;
  private currentAttempt: number = 0;

  constructor(config: Partial<ReconnectionConfig> = {}) {
    this.config = {
      maxAttempts: config.maxAttempts || 5,
      initialDelay: config.initialDelay || 1000,
      maxDelay: config.maxDelay || 30000,
      backoffMultiplier: config.backoffMultiplier || 2
    };
  }

  getNextDelay(): number {
    if (!this.canRetry()) {
      throw new Error('Max reconnection attempts reached');
    }
    const delay = Math.min(
      this.config.initialDelay * Math.pow(this.config.backoffMultiplier, this.currentAttempt),
      this.config.maxDelay
    );
    this.currentAttempt++;
    return delay;
  }

  canRetry(): boolean {
    return this.currentAttempt < this.config.maxAttempts;
  }

  getRemainingAttempts(): number {
    return Math.max(0, this.config.maxAttempts - this.currentAttempt);
  }

  reset(): void {
    this.currentAttempt = 0;
  }
}
