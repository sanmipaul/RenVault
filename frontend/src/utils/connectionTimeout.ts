export class ConnectionTimeoutHandler {
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  set(id: string, callback: () => void, ms: number): void {
    this.clear(id);
    const timeout = setTimeout(() => {
      callback();
      this.timeouts.delete(id);
    }, ms);
    this.timeouts.set(id, timeout);
  }

  clear(id: string): void {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
  }

  clearAll(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
  }
}
