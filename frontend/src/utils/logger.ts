import { environment } from '../config/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4,
}

export interface LogEntry {
  level: LogLevel;
  levelName: string;
  message: string;
  context?: string;
  data?: unknown;
  error?: Error;
  timestamp: string;
}

export interface LoggerOptions {
  minLevel?: LogLevel;
  context?: string;
  bufferSize?: number;
  enableBuffer?: boolean;
}

const LEVEL_NAMES: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.SILENT]: 'SILENT',
};

const DEFAULT_MIN_LEVEL_DEV = LogLevel.DEBUG;
const DEFAULT_MIN_LEVEL_PROD = LogLevel.WARN;
const DEFAULT_BUFFER_SIZE = 200;

class Logger {
  private minLevel: LogLevel;
  private context: string | undefined;
  private buffer: LogEntry[] = [];
  private bufferSize: number;
  private enableBuffer: boolean;

  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel ?? (environment.isDev ? DEFAULT_MIN_LEVEL_DEV : DEFAULT_MIN_LEVEL_PROD);
    this.context = options.context;
    this.bufferSize = options.bufferSize ?? DEFAULT_BUFFER_SIZE;
    this.enableBuffer = options.enableBuffer ?? true;
  }

  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  getMinLevel(): LogLevel {
    return this.minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(levelName: string, message: string): string {
    const timestamp = new Date().toISOString();
    const ctx = this.context ? ` [${this.context}]` : '';
    return `[${timestamp}] [${levelName}]${ctx} ${message}`;
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

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    const entry = this.buildEntry(LogLevel.DEBUG, message, data);
    this.record(entry);
    console.debug(this.formatMessage('DEBUG', message), data !== undefined ? data : '');
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    const entry = this.buildEntry(LogLevel.INFO, message, data);
    this.record(entry);
    console.log(this.formatMessage('INFO', message), data !== undefined ? data : '');
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    const entry = this.buildEntry(LogLevel.WARN, message, data);
    this.record(entry);
    console.warn(this.formatMessage('WARN', message), data !== undefined ? data : '');
  }

  error(message: string, error?: Error, data?: unknown): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    const entry = this.buildEntry(LogLevel.ERROR, message, data, error);
    this.record(entry);
    console.error(this.formatMessage('ERROR', message), error, data !== undefined ? data : '');
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
      ...options,
      context: this.context ? `${this.context}:${context}` : context,
    });
  }

  silence(): void {
    this.minLevel = LogLevel.SILENT;
  }

  reset(): void {
    this.minLevel = environment.isDev ? DEFAULT_MIN_LEVEL_DEV : DEFAULT_MIN_LEVEL_PROD;
    this.buffer = [];
  }
}

export const logger = new Logger();
export { Logger };
export default logger;
