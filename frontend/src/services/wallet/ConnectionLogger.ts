export class ConnectionLogger {
  private logs: Array<{ timestamp: number; level: string; message: string }> = [];

  log(level: 'info' | 'warn' | 'error', message: string): void {
    this.logs.push({ timestamp: Date.now(), level, message });
    if (this.logs.length > 100) this.logs.shift();
  }

  getLogs() {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}
