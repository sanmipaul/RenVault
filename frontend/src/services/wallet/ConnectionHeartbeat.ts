export class ConnectionHeartbeat {
  private interval: NodeJS.Timeout | null = null;
  private lastBeat: number = 0;
  private started: boolean = false;

  start(callback: () => void, intervalMs: number = 30000): void {
    this.stop();
    this.started = true;
    this.lastBeat = Date.now();
    this.interval = setInterval(() => {
      this.lastBeat = Date.now();
      callback();
    }, intervalMs);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.started = false;
  }

  getLastBeat(): number {
    return this.lastBeat;
  }

  isRunning(): boolean {
    return this.interval !== null;
  }

  isAlive(timeoutMs: number = 60000): boolean {
    if (!this.started) return false;
    return Date.now() - this.lastBeat < timeoutMs;
  }
}
