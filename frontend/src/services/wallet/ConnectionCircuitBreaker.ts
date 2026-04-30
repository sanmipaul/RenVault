export class ConnectionCircuitBreaker {
  private failures: number = 0;
  private readonly threshold: number;
  private readonly resetTimeout: number;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private resetTimer: NodeJS.Timeout | null = null;
  private probePending: boolean = false;

  constructor(threshold: number = 5, resetTimeout: number = 60000) {
    this.threshold = threshold;
    this.resetTimeout = resetTimeout;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      throw new Error(
        `Circuit breaker is open after ${this.failures} failure(s). ` +
        `It will transition to half-open in ~${Math.ceil(this.resetTimeout / 1000)}s.`
      );
    }

    // In half-open state only one probe is allowed at a time.
    // Additional concurrent calls are rejected to avoid a thundering herd
    // re-opening the circuit immediately after the reset timeout expires.
    if (this.state === 'half-open') {
      if (this.probePending) {
        throw new Error('Circuit breaker is probing; try again shortly.');
      }
      this.probePending = true;
    }

    try {
      const result = await fn();
      this.probePending = false;
      this.onSuccess();
      return result;
    } catch (error) {
      this.probePending = false;
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === 'half-open') {
      this.state = 'closed';
    }
  }

  private onFailure(): void {
    this.failures++;
    if (this.state === 'half-open' || this.failures >= this.threshold) {
      this.state = 'open';
      this.scheduleReset();
    }
  }

  private scheduleReset(): void {
    if (this.resetTimer) clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => {
      this.resetTimer = null;
      this.state = 'half-open';
      this.failures = 0;
    }, this.resetTimeout);
  }

  getState(): {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
    threshold: number;
    remainingCapacity: number;
  } {
    return {
      state: this.state,
      failures: this.failures,
      threshold: this.threshold,
      remainingCapacity: Math.max(0, this.threshold - this.failures),
    };
  }

  reset(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
    this.state = 'closed';
    this.failures = 0;
    this.probePending = false;
  }

  destroy(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
    this.state = 'closed';
    this.failures = 0;
    this.probePending = false;
  }
}
