export class ConnectionHeartbeat {
  private interval: NodeJS.Timeout | null = null;
  private lastBeat: number = 0;

  start(callback: () => void, intervalMs: number = 30000): void {
    this.stop();
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
  }

  getLastBeat(): number {
    return this.lastBeat;
  }

  isAlive(timeoutMs: number = 60000): boolean {
    return Date.now() - this.lastBeat < timeoutMs;
  }
}
