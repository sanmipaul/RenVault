export class TransactionLogger {
  private logs: Array<{ timestamp: number; level: string; message: string; data?: any }> = [];
  private readonly MAX_LOGS = 100;

  log(level: 'info' | 'warn' | 'error', message: string, data?: any): void {
    this.logs.push({ timestamp: Date.now(), level, message, data });
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
  }

  info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.log('error', message, data);
  }

  getLogs(): Array<{ timestamp: number; level: string; message: string; data?: any }> {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}
