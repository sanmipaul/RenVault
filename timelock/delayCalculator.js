// Delay Calculator
class DelayCalculator {
  constructor() {
    this.presets = {
      '1hour': 3600000,
      '6hours': 21600000,
      '12hours': 43200000,
      '1day': 86400000,
      '3days': 259200000,
      '1week': 604800000,
      '2weeks': 1209600000,
      '1month': 2592000000
    };
  }

  calculateDelay(input) {
    // If it's a preset
    if (this.presets[input]) {
      return this.presets[input];
    }

    // If it's a number (milliseconds)
    if (typeof input === 'number') {
      return input;
    }

    // Parse string format like "2d 3h 30m"
    if (typeof input === 'string') {
      return this.parseTimeString(input);
    }

    throw new Error('Invalid delay format');
  }

  parseTimeString(timeString) {
    const regex = /(\d+)([dhms])/g;
    let totalMs = 0;
    let match;

    while ((match = regex.exec(timeString)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case 'd': totalMs += value * 24 * 60 * 60 * 1000; break;
        case 'h': totalMs += value * 60 * 60 * 1000; break;
        case 'm': totalMs += value * 60 * 1000; break;
        case 's': totalMs += value * 1000; break;
      }
    }

    if (totalMs === 0) {
      throw new Error('Invalid time format');
    }

    return totalMs;
  }

  formatDelay(milliseconds) {
    const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
    const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
  }

  getPresets() {
    return Object.keys(this.presets).map(key => ({
      name: key,
      value: this.presets[key],
      formatted: this.formatDelay(this.presets[key])
    }));
  }

  validateDelay(delay, minDelay, maxDelay) {
    const ms = this.calculateDelay(delay);
    
    if (ms < minDelay) {
      throw new Error(`Delay too short. Minimum: ${this.formatDelay(minDelay)}`);
    }
    
    if (ms > maxDelay) {
      throw new Error(`Delay too long. Maximum: ${this.formatDelay(maxDelay)}`);
    }

    return ms;
  }

  getOptimalDelay(riskLevel) {
    switch (riskLevel) {
      case 'low': return this.presets['1hour'];
      case 'medium': return this.presets['1day'];
      case 'high': return this.presets['3days'];
      case 'critical': return this.presets['1week'];
      default: return this.presets['1day'];
    }
  }

  calculateETA(delay) {
    return new Date(Date.now() + this.calculateDelay(delay));
  }
}

module.exports = { DelayCalculator };