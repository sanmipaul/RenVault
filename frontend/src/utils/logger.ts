import { environment } from '../config/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

class Logger {
  private isDev = environment.isDev;
  private minLevel: LogLevel = environment.isDev ? 'debug' : 'info';

  private shouldLog(level: LogLevel): boolean {
    return LEVEL_RANK[level] >= LEVEL_RANK[this.minLevel];
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  setLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  silence(): void {
    this.minLevel = 'silent';
  }

  error(message: string, error?: unknown): void {
    if (!this.shouldLog('error')) return;
    const msg = this.formatMessage(LOG_LEVELS.ERROR, message);
    console.error(msg, error);
  }

  warn(message: string, extra?: unknown): void {
    if (!this.shouldLog('warn')) return;
    const msg = this.formatMessage(LOG_LEVELS.WARN, message);
    console.warn(msg, extra);
  }

  info(message: string): void {
    if (!this.shouldLog('info')) return;
    const msg = this.formatMessage(LOG_LEVELS.INFO, message);
    console.log(msg);
  }

  debug(message: string, data?: unknown): void {
    if (!this.isDev || !this.shouldLog('debug')) return;
    const msg = this.formatMessage(LOG_LEVELS.DEBUG, message);
    console.debug(msg, data);
  }
}

export const logger = new Logger();
export default logger;
