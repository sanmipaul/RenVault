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

export interface LogTransport {
  write(entry: LogEntry): void;
}

export class ConsoleTransport implements LogTransport {
  write(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.levelName}]${entry.context ? ` [${entry.context}]` : ''} ${entry.message}`;
    switch (entry.level) {
      case LogLevel.DEBUG: console.debug(prefix, entry.data ?? ''); break;
      case LogLevel.INFO: console.log(prefix, entry.data ?? ''); break;
      case LogLevel.WARN: console.warn(prefix, entry.data ?? ''); break;
      case LogLevel.ERROR: console.error(prefix, entry.error, entry.data ?? ''); break;
    }
  }
}

export class BufferTransport implements LogTransport {
  private entries: LogEntry[] = [];
  private readonly maxSize: number;

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
  }

  write(entry: LogEntry): void {
    this.entries.push(entry);
    if (this.entries.length > this.maxSize) {
      this.entries.shift();
    }
  }

  getEntries(): ReadonlyArray<LogEntry> {
    return [...this.entries];
  }

  getEntriesByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter(e => e.level === level);
  }

  clear(): void {
    this.entries = [];
  }

  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }
}

export interface LoggerOptions {
  minLevel?: LogLevel;
  context?: string;
  bufferSize?: number;
  enableBuffer?: boolean;
  transports?: LogTransport[];
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
  private transports: LogTransport[];

  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel ?? (environment.isDev ? DEFAULT_MIN_LEVEL_DEV : DEFAULT_MIN_LEVEL_PROD);
    this.context = options.context;
    this.bufferSize = options.bufferSize ?? DEFAULT_BUFFER_SIZE;
    this.enableBuffer = options.enableBuffer ?? true;
    this.transports = options.transports ?? [new ConsoleTransport()];
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

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
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

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;
    this.dispatch(this.buildEntry(LogLevel.DEBUG, message, data));
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.INFO)) return;
    this.dispatch(this.buildEntry(LogLevel.INFO, message, data));
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog(LogLevel.WARN)) return;
    this.dispatch(this.buildEntry(LogLevel.WARN, message, data));
  }

  error(message: string, error?: Error, data?: unknown): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;
    this.dispatch(this.buildEntry(LogLevel.ERROR, message, data, error));
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
