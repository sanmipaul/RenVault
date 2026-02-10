const fs = require('fs');
const path = require('path');

class Logger {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir);
    }
    this.logFile = path.join(this.logDir, `${serviceName.toLowerCase()}.log`);
  }

  formatMessage(level, message, context = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      context
    }) + '\n';
  }

  log(level, message, context) {
    const logEntry = this.formatMessage(level, message, context);
    console.log(`[${level.toUpperCase()}] ${message}`, context || '');
    fs.appendFileSync(this.logFile, logEntry);
  }

  info(message, context) {
    this.log('info', message, context);
  }

  warn(message, context) {
    this.log('warn', message, context);
  }

  error(message, context) {
    this.log('error', message, context);
  }

  debug(message, context) {
    if (process.env.DEBUG === 'true') {
      this.log('debug', message, context);
    }
  }
}

module.exports = Logger;
