const fs = require('fs');
const path = require('path');

class MetricsLogger {
  constructor() {
    this.logFile = path.join(__dirname, 'metrics.log');
  }

  log(data) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${JSON.stringify(data)}\n`;
    
    fs.appendFileSync(this.logFile, logEntry);
  }

  getRecentLogs(hours = 24) {
    if (!fs.existsSync(this.logFile)) return [];
    
    const content = fs.readFileSync(this.logFile, 'utf8');
    const lines = content.split('\n').filter(line => line.trim());
    
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return lines
      .map(line => {
        const [timestamp, ...data] = line.split(' - ');
        return { timestamp, data: data.join(' - ') };
      })
      .filter(entry => new Date(entry.timestamp) > cutoff);
  }
}

module.exports = MetricsLogger;