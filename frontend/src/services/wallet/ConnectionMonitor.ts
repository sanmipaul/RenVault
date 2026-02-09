export class ConnectionMonitor {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  start(id: string, checkFn: () => void, intervalMs: number = 30000): void {
    this.stop(id);
    const interval = setInterval(checkFn, intervalMs);
    this.intervals.set(id, interval);
  }

  stop(id: string): void {
    const interval = this.intervals.get(id);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(id);
    }
  }

  stopAll(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }
}
