import { environment } from '../config/environment';

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

class Logger {
  private isDev = environment.isDev;

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  error(message: string, error?: Error) {
    const msg = this.formatMessage(LOG_LEVELS.ERROR, message);
    console.error(msg, error);
  }

  warn(message: string) {
    const msg = this.formatMessage(LOG_LEVELS.WARN, message);
    console.warn(msg);
  }

  info(message: string) {
    const msg = this.formatMessage(LOG_LEVELS.INFO, message);
    console.log(msg);
  }

  debug(message: string, data?: any) {
    if (this.isDev) {
      const msg = this.formatMessage(LOG_LEVELS.DEBUG, message);
      console.debug(msg, data);
    }
  }
}

export const logger = new Logger();
export default logger;
