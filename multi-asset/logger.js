// Centralized logger for multi-asset module
const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

const minLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level) {
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel];
}

function format(level, message) {
  return `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
}

const logger = {
  debug(message, data) {
    if (!shouldLog('debug')) return;
    data !== undefined ? console.debug(format('debug', message), data) : console.debug(format('debug', message));
  },
  info(message) {
    if (!shouldLog('info')) return;
    console.log(format('info', message));
  },
  warn(message, extra) {
    if (!shouldLog('warn')) return;
    extra !== undefined ? console.warn(format('warn', message), extra) : console.warn(format('warn', message));
  },
  error(message, error) {
    if (!shouldLog('error')) return;
    error !== undefined ? console.error(format('error', message), error) : console.error(format('error', message));
  },
};

module.exports = { logger };
