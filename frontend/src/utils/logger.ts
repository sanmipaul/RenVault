import { environment } from '../config/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const LEVEL_NAMES: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARN',
  error: 'ERROR',
  silent: 'SILENT',
};

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

const DEFAULT_MIN_LEVEL_DEV = LogLevel.DEBUG;
const DEFAULT_MIN_LEVEL_PROD = LogLevel.WARN;
const DEFAULT_BUFFER_SIZE = 200;

export interface LogEntry {
  level: LogLevel;
  levelName: string;
  message: string;
  context?: string;
  data?: unknown;
  error?: Error;
  timestamp: string;
}

export interface LogTransport {
  write(entry: LogEntry): void;
}

export interface LoggerOptions {
  minLevel?: LogLevel;
  bufferSize?: number;
  enableBuffer?: boolean;
  transports?: LogTransport[];
  context?: string;
}

class Logger {
  private isDev = environment.isDev;
  private minLevel: LogLevel = environment.isDev ? 'debug' : 'info';
  private bufferSize: number = DEFAULT_BUFFER_SIZE;
  private enableBuffer: boolean = true;
  private transports: LogTransport[] = [];
  private context: string = '';
  private buffer: LogEntry[] = [];

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_RANK[level] >= LEVEL_RANK[this.minLevel];
  }

  addTransport(transport: LogTransport): void {
    this.transports.push(transport);
  }

  removeTransports(): void {
    this.transports = [];
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  getMinLevel(): LogLevel {
    return this.minLevel;
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  silence(): void {
    this.minLevel = 'silent';
  }

  private record(entry: LogEntry): void {
    if (!this.enableBuffer) return;
    this.buffer.push(entry);
    if (this.buffer.length > this.bufferSize) {
      this.buffer.shift();
    }
  }

  private buildEntry(level: LogLevel, message: string, data?: unknown, error?: Error): LogEntry {
    return {
      level,
      levelName: LEVEL_NAMES[level],
      message,
      context: this.context,
      data,
      error,
      timestamp: new Date().toISOString(),
    };
  }

  private dispatch(entry: LogEntry): void {
    this.record(entry);
    for (const transport of this.transports) {
      try {
        transport.write(entry);
      } catch {
        // never let a transport crash the app
      }
    }
  }

  private formatMessage(levelName: string, message: string): string {
    return `[${new Date().toISOString()}] ${levelName}: ${message}`;
  }

  debug(message: string): void {
    if (!this.shouldLog('debug')) return;
    console.debug(this.formatMessage(LOG_LEVELS.DEBUG, message));
  }

  info(message: string): void {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage(LOG_LEVELS.INFO, message));
  }

  warn(message: string): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message));
  }

  error(message: string, error?: unknown): void {
    if (!this.shouldLog('error')) return;
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message), error);
  }

  getBuffer(): ReadonlyArray<LogEntry> {
    return [...this.buffer];
  }

  getBufferByLevel(level: LogLevel): LogEntry[] {
    return this.buffer.filter(e => e.level === level);
  }

  clearBuffer(): void {
    this.buffer = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.buffer, null, 2);
  }

  getRecentErrors(limit: number = 10): LogEntry[] {
    return this.buffer.filter(e => e.level === LogLevel.ERROR).slice(-limit);
  }

  getRecentWarnings(limit: number = 10): LogEntry[] {
    return this.buffer.filter(e => e.level === LogLevel.WARN).slice(-limit);
  }

  child(context: string, options?: Omit<LoggerOptions, 'context'>): Logger {
    return new Logger({
      minLevel: this.minLevel,
      bufferSize: this.bufferSize,
      enableBuffer: this.enableBuffer,
      transports: this.transports,
      ...options,
      context: this.context ? `${this.context}:${context}` : context,
    });
  }

  getLogStats(): Record<string, number> {
    const stats: Record<string, number> = {
      DEBUG: 0, INFO: 0, WARN: 0, ERROR: 0,
    };
    for (const entry of this.buffer) {
      stats[entry.levelName] = (stats[entry.levelName] ?? 0) + 1;
    }
    return stats;
  }

  getErrorRate(): number {
    if (this.buffer.length === 0) return 0;
    const errors = this.buffer.filter(e => e.level === LogLevel.ERROR).length;
    return errors / this.buffer.length;
  }

  reset(): void {
    this.minLevel = environment.isDev ? DEFAULT_MIN_LEVEL_DEV : DEFAULT_MIN_LEVEL_PROD;
    this.buffer = [];
  }
}

export const logger = new Logger();
export { Logger };
export default logger;