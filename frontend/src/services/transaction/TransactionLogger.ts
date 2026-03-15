interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: Record<string, unknown>;
}

export class TransactionLogger {
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 100;

  log(level: 'info' | 'warn' | 'error', message: string, data?: Record<string, unknown>): void {
    this.logs.push({ timestamp: Date.now(), level, message, data });
    if (this.logs.length > this.MAX_LOGS) {
      this.logs.shift();
    }
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.log('error', message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}
